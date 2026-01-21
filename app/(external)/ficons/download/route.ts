import { $ } from 'bun';
import { type NextRequest, NextResponse } from 'next/server';
import * as v from 'valibot';
import { getIconsByIds } from '@/db/icons';
import { log } from '@/utils/log.helpers';
import { astToSvgString, astToTsx } from '@/utils/svg-helpers';

const downloadRequestSchema = v.object({
    iconIds: v.pipe(
        v.array(v.number()),
        v.minLength(1, 'At least one icon must be selected'),
        v.maxLength(500, 'Maximum 500 icons per download')
    ),
    attributes: v.object({
        color: v.pipe(v.string(), v.minLength(1, 'Color is required')),
        size: v.pipe(
            v.number(),
            v.minValue(1, 'Size must be at least 1'),
            v.maxValue(512, 'Size must be at most 512')
        )
    })
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validation = v.safeParse(downloadRequestSchema, body);

        if (!validation.success) {
            const errors = validation.issues.map((issue) => issue.message).join(', ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const { iconIds, attributes } = validation.output;

        log('info', '[download/route] START', { iconIds, attributes });

        // Fetch icons from database
        const icons = await getIconsByIds(iconIds);

        if (icons.length === 0) {
            return NextResponse.json({ error: 'No icons found' }, { status: 404 });
        }

        // Create temporary directory for SVG files
        const timestamp = Date.now();
        const tmpDir = `/var/tmp/icons-download-${timestamp}`;
        const rawDir = `${tmpDir}/raw`;
        const reactDir = `${tmpDir}/react`;
        await $`mkdir -p ${rawDir} ${reactDir}`;

        try {
            // Generate SVG files and React components with applied attributes
            for (const icon of icons) {
                const svgAst = icon.svgAst as SvgNode;
                const defaultAttrs = icon.defaultSvgAttributes;

                // Apply size and color attributes
                const modifiedAst: SvgNode = {
                    ...svgAst,
                    attrs: {
                        ...svgAst.attrs,
                        width: String(attributes.size),
                        height: String(attributes.size)
                    }
                };

                // Apply fill if variant has fill in default attributes
                if (defaultAttrs.fill !== undefined) {
                    modifiedAst.attrs.fill = attributes.color;
                }
                // Apply stroke if variant has stroke in default attributes
                if (defaultAttrs.stroke !== undefined) {
                    modifiedAst.attrs.stroke = attributes.color;
                }

                // Generate raw SVG file
                const svgContent = astToSvgString(modifiedAst);
                const svgFileName = `${icon.name}.svg`;
                const svgFilePath = `${rawDir}/${svgFileName}`;
                await Bun.write(svgFilePath, svgContent);

                // Generate React component file
                const tsxContent = astToTsx({ name: icon.name, svgAst: modifiedAst });
                const tsxFileName = `${icon.name
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('')}.tsx`;
                const tsxFilePath = `${reactDir}/${tsxFileName}`;
                await Bun.write(tsxFilePath, tsxContent);
            }

            // Create ZIP file using Bun's shell
            const zipPath = `/var/tmp/icons-${timestamp}.zip`;
            await $`cd ${tmpDir} && zip -r ${zipPath} .`;

            // Read ZIP file and stream it
            const zipFile = Bun.file(zipPath);
            const zipBuffer = await zipFile.arrayBuffer();
            const zipSizeKB = Math.round(zipBuffer.byteLength / 1024);

            log('info', '[download/route] END - SUCCESS', {
                iconsCount: icons.length,
                zipSizeKB
            });

            // Cleanup temporary files
            await $`rm -rf ${tmpDir}`;
            await $`rm -f ${zipPath}`;

            // Return ZIP file as binary stream
            return new NextResponse(zipBuffer, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="icons-${timestamp}.zip"`,
                    'Content-Length': String(zipBuffer.byteLength)
                }
            });
        } catch (error) {
            // Cleanup on error
            await $`rm -rf ${tmpDir}`.catch(() => {});
            await $`rm -f /var/tmp/icons-${timestamp}.zip`.catch(() => {});
            throw error;
        }
    } catch (error) {
        log('error', '[download/route] ERROR', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
