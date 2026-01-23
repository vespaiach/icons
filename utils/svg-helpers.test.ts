import { describe, expect, test } from 'bun:test';
import { astToInnerHtml, astToSvgString } from './client-side/svg-helpers';
import { parseSvgToAst } from './svg-parser';

describe('svg-helpers', () => {
    describe('parseSvgToAst', () => {
        test('should parse simple SVG with basic attributes', () => {
            const simpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7z"/>
            </svg>`;

            const ast = parseSvgToAst(simpleSvg);

            expect(ast.id).toBe('root');
            expect(ast.type).toBe('svg');
            expect(ast.attrs.xmlns).toBe('http://www.w3.org/2000/svg');
            expect(ast.attrs.width).toBe('24');
            expect(ast.attrs.height).toBe('24');
            expect(ast.attrs.viewBox).toBe('0 0 24 24');
            expect(ast.children).toHaveLength(1);
            expect(ast.children?.[0].type).toBe('path');
            expect(ast.children?.[0].attrs.d).toBe('M12 2L2 7v10l10 5 10-5V7z');
        });

        test('should parse SVG with multiple paths', () => {
            const multiPathSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7 7 10 10" />
                <path d="M17 7v10H7" />
            </svg>`;

            const ast = parseSvgToAst(multiPathSvg);

            expect(ast.children).toHaveLength(2);
            expect(ast.children?.[0].id).toBe('path1');
            expect(ast.children?.[0].attrs.d).toBe('m7 7 10 10');
            expect(ast.children?.[1].id).toBe('path2');
            expect(ast.children?.[1].attrs.d).toBe('M17 7v10H7');
        });

        test('should preserve hyphenated attributes like stroke-width', () => {
            const svgWithHyphenAttrs = `<svg stroke-width="2" stroke-linecap="round">
                <path d="M0 0"/>
            </svg>`;

            const ast = parseSvgToAst(svgWithHyphenAttrs);

            expect(ast.attrs['stroke-width']).toBe('2');
            expect(ast.attrs['stroke-linecap']).toBe('round');
        });

        test('should preserve data- attributes with hyphens', () => {
            const svgWithDataAttrs = `<svg data-test="value" data-icon-name="test-icon">
                <g data-layer="1"><path d="M0 0"/></g>
            </svg>`;

            const ast = parseSvgToAst(svgWithDataAttrs);

            expect(ast.attrs['data-test']).toBe('value');
            expect(ast.attrs['data-icon-name']).toBe('test-icon');
            expect(ast.children?.[0].attrs['data-layer']).toBe('1');
        });

        test('should parse complex SVG with defs and style', () => {
            const complexSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <defs>
                    <style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style>
                </defs>
                <title>activity</title>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="activity">
                        <rect class="cls-1" width="24" height="24" transform="translate(24 0) rotate(90)"/>
                        <path class="cls-2" d="M14.33,20h-.21a2,2,0,0,1-1.76-1.58L9.68,6"/>
                    </g>
                </g>
            </svg>`;

            const ast = parseSvgToAst(complexSvg);

            // Check root attributes
            expect(ast.type).toBe('svg');
            expect(ast.attrs.viewBox).toBe('0 0 24 24');

            // Check defs element
            const defsNode = ast.children?.find((child) => child.type === 'defs');
            expect(defsNode).toBeDefined();

            // Check style element within defs
            const styleNode = defsNode?.children?.find((child) => child.type === 'style');
            expect(styleNode).toBeDefined();
            expect(styleNode?.attrs.textContent).toContain('.cls-1{fill:#fff;opacity:0;}');

            // Check title element
            const titleNode = ast.children?.find((child) => child.type === 'title');
            expect(titleNode).toBeDefined();
            expect(titleNode?.attrs.textContent).toBe('activity');

            // Check nested groups
            const rootGroup = ast.children?.find((child) => child.id === 'g4');
            expect(rootGroup?.attrs.id).toBe('Layer_2');
            expect(rootGroup?.attrs['data-name']).toBe('Layer 2');

            // Check rect and path elements
            const innerGroup = rootGroup?.children?.[0];
            expect(innerGroup?.children).toHaveLength(2);

            const rect = innerGroup?.children?.[0];
            expect(rect?.type).toBe('rect');
            expect(rect?.attrs.class).toBe('cls-1');
            expect(rect?.attrs.transform).toBe('translate(24 0) rotate(90)');

            const path = innerGroup?.children?.[1];
            expect(path?.type).toBe('path');
            expect(path?.attrs.class).toBe('cls-2');
        });

        test('should parse SVG with nested groups', () => {
            const nestedSvg = `<svg>
                <g id="outer">
                    <g id="middle">
                        <g id="inner">
                            <circle cx="12" cy="12" r="10"/>
                        </g>
                    </g>
                </g>
            </svg>`;

            const ast = parseSvgToAst(nestedSvg);

            const outer = ast.children?.[0];
            expect(outer?.attrs.id).toBe('outer');

            const middle = outer?.children?.[0];
            expect(middle?.attrs.id).toBe('middle');

            const inner = middle?.children?.[0];
            expect(inner?.attrs.id).toBe('inner');

            const circle = inner?.children?.[0];
            expect(circle?.type).toBe('circle');
            expect(circle?.attrs.cx).toBe('12');
            expect(circle?.attrs.cy).toBe('12');
            expect(circle?.attrs.r).toBe('10');
        });

        test('should handle SVG with mixed element types', () => {
            const mixedSvg = `<svg>
                <rect x="0" y="0" width="10" height="10"/>
                <circle cx="20" cy="20" r="5"/>
                <ellipse cx="30" cy="30" rx="8" ry="4"/>
                <line x1="0" y1="0" x2="40" y2="40"/>
                <polyline points="0,0 10,10 20,0"/>
                <polygon points="0,0 10,0 5,10"/>
            </svg>`;

            const ast = parseSvgToAst(mixedSvg);

            expect(ast.children).toHaveLength(6);
            expect(ast.children?.[0].type).toBe('rect');
            expect(ast.children?.[1].type).toBe('circle');
            expect(ast.children?.[2].type).toBe('ellipse');
            expect(ast.children?.[3].type).toBe('line');
            expect(ast.children?.[4].type).toBe('polyline');
            expect(ast.children?.[5].type).toBe('polygon');
        });

        test('should generate unique IDs for nodes', () => {
            const svgWithMultipleSameElements = `<svg>
                <path d="M0 0"/>
                <path d="M1 1"/>
                <path d="M2 2"/>
            </svg>`;

            const ast = parseSvgToAst(svgWithMultipleSameElements);

            expect(ast.children?.[0].id).toBe('path1');
            expect(ast.children?.[1].id).toBe('path2');
            expect(ast.children?.[2].id).toBe('path3');
        });
    });

    describe('astToInnerHtml', () => {
        test('should convert simple AST to inner HTML', () => {
            const ast: SvgNode = {
                id: 'root',
                type: 'svg',
                attrs: { width: '24', height: '24' },
                children: [
                    {
                        id: 'path1',
                        type: 'path',
                        attrs: { d: 'M0 0L10 10' }
                    }
                ]
            };

            const html = astToInnerHtml(ast);

            expect(html).toBe('<path d="M0 0L10 10"/>');
        });

        test('should convert AST with text content', () => {
            const ast: SvgNode = {
                id: 'root',
                type: 'svg',
                attrs: {},
                children: [
                    {
                        id: 'title1',
                        type: 'title',
                        attrs: { textContent: 'My Icon' }
                    },
                    {
                        id: 'path1',
                        type: 'path',
                        attrs: { d: 'M0 0' }
                    }
                ]
            };

            const html = astToInnerHtml(ast);

            expect(html).toContain('<title>My Icon</title>');
            expect(html).toContain('<path d="M0 0"/>');
        });

        test('should convert nested AST structure', () => {
            const ast: SvgNode = {
                id: 'root',
                type: 'svg',
                attrs: {},
                children: [
                    {
                        id: 'g1',
                        type: 'g',
                        attrs: { id: 'layer1' },
                        children: [
                            {
                                id: 'path1',
                                type: 'path',
                                attrs: { d: 'M0 0' }
                            }
                        ]
                    }
                ]
            };

            const html = astToInnerHtml(ast);

            expect(html).toBe('<g id="layer1"><path d="M0 0"/></g>');
        });

        test('should return empty string for AST without children', () => {
            const ast: SvgNode = {
                id: 'root',
                type: 'svg',
                attrs: { width: '24' }
            };

            const html = astToInnerHtml(ast);

            expect(html).toBe('');
        });
    });

    describe('astToSvgString', () => {
        test('should convert AST to complete SVG string', () => {
            const ast: SvgNode = {
                id: 'root',
                type: 'svg',
                attrs: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '24',
                    height: '24',
                    viewBox: '0 0 24 24'
                },
                children: [
                    {
                        id: 'path1',
                        type: 'path',
                        attrs: { d: 'M0 0L24 24' }
                    }
                ]
            };

            const svgString = astToSvgString(ast);

            expect(svgString).toContain('<svg');
            expect(svgString).toContain('xmlns="http://www.w3.org/2000/svg"');
            expect(svgString).toContain('width="24"');
            expect(svgString).toContain('viewBox="0 0 24 24"');
            expect(svgString).toContain('<path d="M0 0L24 24"/>');
            expect(svgString).toContain('</svg>');
        });

        test('should handle empty SVG', () => {
            const ast: SvgNode = {
                id: 'root',
                type: 'svg',
                attrs: {}
            };

            const svgString = astToSvgString(ast);

            expect(svgString).toBe('<svg></svg>');
        });
    });

    describe('roundtrip conversion', () => {
        test('should maintain SVG integrity through parse and convert cycle', () => {
            const originalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>`;

            const ast = parseSvgToAst(originalSvg);
            const reconstructed = astToSvgString(ast);

            // Parse both to compare structure (whitespace may differ)
            const originalAst = parseSvgToAst(originalSvg);
            const reconstructedAst = parseSvgToAst(reconstructed);

            expect(reconstructedAst.attrs).toEqual(originalAst.attrs);
            expect(reconstructedAst.children?.length).toBe(originalAst.children?.length);
        });

        test('should preserve complex SVG through roundtrip', () => {
            const complexSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#fff;opacity:0;}</style></defs><title>test</title><g id="Layer_2" data-name="Layer 2"><rect class="cls-1" width="24" height="24"/></g></svg>`;

            const ast = parseSvgToAst(complexSvg);
            const reconstructed = astToSvgString(ast);
            const finalAst = parseSvgToAst(reconstructed);

            // Verify structure is preserved
            expect(finalAst.children?.length).toBe(ast.children?.length);

            const defsNode = finalAst.children?.find((c) => c.type === 'defs');
            expect(defsNode).toBeDefined();

            const titleNode = finalAst.children?.find((c) => c.type === 'title');
            expect(titleNode?.attrs.textContent).toBe('test');

            const gNode = finalAst.children?.find((c) => c.type === 'g');
            expect(gNode?.attrs['data-name']).toBe('Layer 2');
        });
    });
});
