export const version = '20260128_160449_convert_to_compact_ast';

/**
 * Convert full SvgNode to compact representation
 */
// biome-ignore lint/suspicious/noExplicitAny: Migration utility function needs flexible typing
function compactAst(node: any): any {
    // biome-ignore lint/suspicious/noExplicitAny: Compact object needs flexible typing
    const compact: any = {
        i: node.id,
        t: node.type
    };

    // Only include attrs if they exist and are non-empty
    if (node.attrs && Object.keys(node.attrs).length > 0) {
        compact.a = node.attrs;
    }

    // Only include children if they exist and are non-empty
    if (node.children && node.children.length > 0) {
        compact.c = node.children.map(compactAst);
    }

    return compact;
}

/**
 * Expand compact SvgNode back to full representation
 */
// biome-ignore lint/suspicious/noExplicitAny: Migration utility function needs flexible typing
function expandAst(compact: any): any {
    // biome-ignore lint/suspicious/noExplicitAny: Node object needs flexible typing
    const node: any = {
        id: compact.i,
        type: compact.t,
        attrs: compact.a ?? {}
    };

    // Restore children if they exist
    if (compact.c && compact.c.length > 0) {
        node.children = compact.c.map(expandAst);
    }

    return node;
}

// biome-ignore lint/suspicious/noExplicitAny: Migration function needs flexible typing for postgres.js compatibility
export async function up(sql: any): Promise<void> {
    console.log('Converting SVG AST to compact format...');

    // Fetch all icons
    const icons = await sql`SELECT id, svg_ast FROM icons`;

    console.log(`Found ${icons.length} icons to convert`);

    // Convert each icon's svg_ast to compact format
    let converted = 0;
    for (const icon of icons) {
        try {
            const compactedAst = compactAst(icon.svg_ast);
            await sql`
                UPDATE icons 
                SET svg_ast = ${sql.json(compactedAst)}
                WHERE id = ${icon.id}
            `;
            converted++;

            if (converted % 100 === 0) {
                console.log(`Converted ${converted}/${icons.length} icons...`);
            }
        } catch (error) {
            console.error(`Error converting icon ${icon.id}:`, error);
        }
    }

    console.log(`✓ Successfully converted ${converted} icons to compact format`);
}

// biome-ignore lint/suspicious/noExplicitAny: Migration function needs flexible typing for postgres.js compatibility
export async function down(sql: any): Promise<void> {
    console.log('Converting compact AST back to full format...');

    // Fetch all icons
    const icons = await sql`SELECT id, svg_ast FROM icons`;

    console.log(`Found ${icons.length} icons to convert back`);

    // Convert each icon's svg_ast back to full format
    let converted = 0;
    for (const icon of icons) {
        try {
            // Check if it's compact format (has 'i' and 't' keys)
            if (icon.svg_ast?.i && icon.svg_ast.t) {
                const expandedAst = expandAst(icon.svg_ast);
                await sql`
                    UPDATE icons 
                    SET svg_ast = ${sql.json(expandedAst)}
                    WHERE id = ${icon.id}
                `;
                converted++;

                if (converted % 100 === 0) {
                    console.log(`Converted ${converted}/${icons.length} icons...`);
                }
            }
        } catch (error) {
            console.error(`Error converting icon ${icon.id}:`, error);
        }
    }

    console.log(`✓ Successfully converted ${converted} icons back to full format`);
}
