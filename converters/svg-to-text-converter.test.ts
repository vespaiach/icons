import { describe, expect, test } from 'bun:test';
import {
    batchSvgToTextFormat,
    batchTextFormatToSvg,
    DEFAULT_ATTRIBUTE_MAP,
    DEFAULT_ELEMENT_MAP,
    DEFAULT_VALUE_MAP,
    extendAttributeMap,
    extendElementMap,
    extendValueMap,
    svgToTextFormat,
    textFormatToSvg
} from './svg-to-text-converter';

describe('svg-to-text-converter', () => {
    describe('svgToTextFormat', () => {
        test('should convert simple SVG with path to text format', () => {
            const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 6 L2 16"/></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toBe('s vb=0 0 24 24,f=n,st=cc|p M10 6 L2 16 ');
        });

        test('should convert SVG with line elements', () => {
            const svg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
  <line x1="12" x2="12" y1="9" y2="13"></line>
  <line x1="12" x2="12.01" y1="17" y2="17"></line>
</svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('s f=n,st=cc,vb=0 0 24 24,stw=2,stlc=round,stlj=round');
            expect(result).toContain(
                'p M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'
            );
            expect(result).toContain('l x1=12,x2=12,y1=9,y2=13');
            expect(result).toContain('l x1=12,x2=12.01,y1=17,y2=17');
        });

        test('should convert SVG with circle', () => {
            const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 12L7 12M12 17L12 7"></path><circle r="10" cx="12" cy="12"></circle></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('s vb=0 0 24 24,f=n,st=cc');
            expect(result).toContain('p M17 12L7 12M12 17L12 7');
            expect(result).toContain('c r=10,cx=12,cy=12');
        });

        test('should convert SVG with rect and transform', () => {
            const svg = `<svg viewBox="0 0 24 24"><rect width="24" height="24" transform="translate(24 0) rotate(90)"/></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('s vb=0 0 24 24');
            expect(result).toContain('r w=24,h=24,tr=translate(24 0) rotate(90)');
        });

        test('should handle nested g elements', () => {
            const svg = `<svg viewBox="0 0 24 24">
                <g id="Layer_2">
                    <g id="activity">
                        <path d="M14.33 20h-.21"/>
                    </g>
                </g>
            </svg>`;
            const result = svgToTextFormat(svg);
            console.log("---------");
            console.log(result);
            console.log("---------");
            console.log(textFormatToSvg(result));
            expect(result).toContain('s vb=0 0 24 24');
            expect(result).toContain('g');
            expect(result).toContain('p M14.33 20h-.21');
        });

        test('should exclude non-rendering attributes', () => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" aria-labelledby="addIconTitle" fill="none" stroke="currentColor"><title id="addIconTitle">Add</title><path d="M17 12L7 12"/></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).not.toContain('xmlns');
            expect(result).not.toContain('aria-labelledby');
            expect(result).toContain('vb=0 0 24 24');
            expect(result).toContain('f=n');
            expect(result).toContain('st=cc');
        });

        test('should handle clip-rule and fill-rule', () => {
            const svg = `<svg fill="currentColor" viewBox="0 0 16 16"><path d="M8 2a.75.75 0 0 1 .75.75v8.69" clip-rule="evenodd" fill-rule="evenodd"></path></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('cr=evenodd');
            expect(result).toContain('fr=evenodd');
        });

        test('should support custom attribute map', () => {
            const svg = `<svg viewBox="0 0 24 24" opacity="0.5"><path d="M10 6"/></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('op=0.5');
        });
    });

    describe('textFormatToSvg', () => {
        test('should convert simple text format to SVG', () => {
            const text = 's vb=0 0 24 24,f=n,st=cc|p M10 6 L2 16';
            const result = textFormatToSvg(text);
            expect(result).toContain('<svg');
            expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
            expect(result).toContain('viewBox="0 0 24 24"');
            expect(result).toContain('fill="none"');
            expect(result).toContain('stroke="currentColor"');
            expect(result).toContain('<path d="M10 6 L2 16"/>');
        });

        test('should convert text with line elements to SVG', () => {
            const text =
                's f=n,st=cc,vb=0 0 32 32,stw=2,stlc=round,stlj=round|p M10 6 L2 16 10 26 M2 16 L30 16';
            const result = textFormatToSvg(text);
            expect(result).toContain('stroke-width="2"');
            expect(result).toContain('stroke-linecap="round"');
            expect(result).toContain('stroke-linejoin="round"');
            expect(result).toContain('<path d="M10 6 L2 16 10 26 M2 16 L30 16"/>');
        });

        test('should convert text with circle to SVG', () => {
            const text = 's vb=0 0 24 24,f=n,st=cc|p M17 12L7 12M12 17L12 7|c r=10,cx=12,cy=12';
            const result = textFormatToSvg(text);
            expect(result).toContain('<path d="M17 12L7 12M12 17L12 7"/>');
            expect(result).toContain('<circle r="10" cx="12" cy="12"/>');
        });

        test('should add xmlns if not present', () => {
            const text = 's vb=0 0 24 24';
            const result = textFormatToSvg(text);
            expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
        });

        test('should handle rect with transform', () => {
            const text = 's vb=0 0 24 24|r w=24,h=24,tr=translate(24 0) rotate(90)';
            const result = textFormatToSvg(text);
            expect(result).toContain('<rect width="24" height="24" transform="translate(24 0) rotate(90)"/>');
        });
    });

    describe('Round-trip conversion', () => {
        test('should maintain data integrity through SVG->text->SVG conversion', () => {
            const originalSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 6 L2 16"/></svg>`;
            const text = svgToTextFormat(originalSvg);
            const restoredSvg = textFormatToSvg(text);

            expect(restoredSvg).toContain('viewBox="0 0 24 24"');
            expect(restoredSvg).toContain('fill="none"');
            expect(restoredSvg).toContain('stroke="currentColor"');
            expect(restoredSvg).toContain('d="M10 6 L2 16"');
        });

        test('should handle complex SVG with multiple elements', () => {
            const originalSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" x2="12" y1="9" y2="13"/>
            </svg>`;
            const text = svgToTextFormat(originalSvg);
            const restoredSvg = textFormatToSvg(text);

            expect(restoredSvg).toContain('viewBox="0 0 24 24"');
            expect(restoredSvg).toContain('stroke-width="2"');
            expect(restoredSvg).toContain('<path');
            expect(restoredSvg).toContain('<line');
            expect(restoredSvg).toContain('x1="12"');
            expect(restoredSvg).toContain('y1="9"');
        });

        test('should preserve clip-rule and fill-rule', () => {
            const originalSvg = `<svg fill="currentColor" viewBox="0 0 16 16"><path d="M8 2" clip-rule="evenodd" fill-rule="evenodd"/></svg>`;
            const text = svgToTextFormat(originalSvg);
            const restoredSvg = textFormatToSvg(text);

            expect(restoredSvg).toContain('clip-rule="evenodd"');
            expect(restoredSvg).toContain('fill-rule="evenodd"');
        });
    });

    describe('Batch conversion', () => {
        test('should batch convert multiple SVGs to text format', () => {
            const svgs = [
                `<svg viewBox="0 0 24 24"><path d="M10 6"/></svg>`,
                `<svg viewBox="0 0 32 32"><circle r="10" cx="16" cy="16"/></svg>`
            ];
            const results = batchSvgToTextFormat(svgs);

            expect(results).toHaveLength(2);
            expect(results[0]).toContain('s vb=0 0 24 24');
            expect(results[0]).toContain('p M10 6');
            expect(results[1]).toContain('s vb=0 0 32 32');
            expect(results[1]).toContain('c r=10,cx=16,cy=16');
        });

        test('should batch convert multiple text formats to SVG', () => {
            const texts = ['s vb=0 0 24 24|p M10 6', 's vb=0 0 32 32|c r=10,cx=16,cy=16'];
            const results = batchTextFormatToSvg(texts);

            expect(results).toHaveLength(2);
            expect(results[0]).toContain('viewBox="0 0 24 24"');
            expect(results[0]).toContain('<path');
            expect(results[1]).toContain('viewBox="0 0 32 32"');
            expect(results[1]).toContain('<circle');
        });

        test('should handle errors gracefully in batch conversion', () => {
            const invalidSvgs = [
                `<svg viewBox="0 0 24 24"><path d="M10 6"/></svg>`,
                `<invalid>Not an SVG</invalid>`,
                `<svg viewBox="0 0 32 32"><circle r="10"/></svg>`
            ];
            const results = batchSvgToTextFormat(invalidSvgs);

            expect(results).toHaveLength(3);
            expect(results[0]).toContain('s vb=0 0 24 24');
            expect(results[1]).toBe(''); // Error case
            expect(results[2]).toContain('s vb=0 0 32 32');
        });
    });

    describe('Custom configuration', () => {
        test('should support custom attribute map', () => {
            const svg = `<svg viewBox="0 0 24 24" data-custom="test"><path d="M10 6"/></svg>`;
            const config = {
                attributeMap: extendAttributeMap({ 'data-custom': 'dc' }),
                excludeAttrs: ['xmlns', 'xmlns:xlink']
            };
            const result = svgToTextFormat(svg, config);
            expect(result).toContain('dc=test');
        });

        test('should support custom value map', () => {
            const svg = `<svg viewBox="0 0 24 24" fill="transparent"><path d="M10 6"/></svg>`;
            const config = {
                valueMap: extendValueMap({ transparent: 'tr' })
            };
            const result = svgToTextFormat(svg, config);
            expect(result).toContain('f=tr');
        });

        test('should support custom element map', () => {
            const svg = `<svg viewBox="0 0 24 24"><polygon points="12,2 15,8 22,9"/></svg>`;
            const config = {
                elementMap: extendElementMap({ polygon: 'pg' })
            };
            const result = svgToTextFormat(svg, config);
            expect(result).toContain('pg');
        });

        test('should use custom config for reverse conversion', () => {
            const text = 's vb=0 0 24 24,f=tr|p M10 6';
            const config = {
                valueMap: extendValueMap({ transparent: 'tr' })
            };
            const result = textFormatToSvg(text, config);
            expect(result).toContain('fill="transparent"');
        });
    });

    describe('Helper functions', () => {
        test('extendAttributeMap should merge with defaults', () => {
            const extended = extendAttributeMap({ opacity: 'op', 'data-custom': 'dc' });
            expect(extended.viewBox).toBe('vb');
            expect(extended.fill).toBe('f');
            expect(extended.opacity).toBe('op');
            expect(extended['data-custom']).toBe('dc');
        });

        test('extendValueMap should merge with defaults', () => {
            const extended = extendValueMap({ transparent: 'tr', inherit: 'inh' });
            expect(extended.currentColor).toBe('cc');
            expect(extended.none).toBe('n');
            expect(extended.transparent).toBe('tr');
            expect(extended.inherit).toBe('inh');
        });

        test('extendElementMap should merge with defaults', () => {
            const extended = extendElementMap({ use: 'u', symbol: 'sym' });
            expect(extended.svg).toBe('s');
            expect(extended.path).toBe('p');
            expect(extended.use).toBe('u');
            expect(extended.symbol).toBe('sym');
        });
    });

    describe('Edge cases', () => {
        test('should handle empty SVG', () => {
            const svg = `<svg viewBox="0 0 24 24"></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toBe('s vb=0 0 24 24 ');
        });

        test('should handle SVG with only attributes', () => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"/>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('f=n');
            expect(result).toContain('st=cc');
        });

        test('should throw error for invalid SVG', () => {
            const invalidSvg = `<div>Not an SVG</div>`;
            expect(() => svgToTextFormat(invalidSvg)).toThrow('Invalid SVG: No svg root element found');
        });

        test('should handle text format with trailing spaces', () => {
            const text = 's vb=0 0 24 24|p M10 6  ';
            const result = textFormatToSvg(text);
            expect(result).toContain('viewBox="0 0 24 24"');
        });

        test('should handle attributes with = in value', () => {
            const svg = `<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/></svg>`;
            const text = svgToTextFormat(svg);
            const restored = textFormatToSvg(text);
            expect(restored).toContain('d="M0 0h24v24H0z"');
        });
    });

    describe('Sample file conversions', () => {
        test('should convert sample1 - cloud icon', () => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor" width="38" height="38">
    <path
        d="M791.9 492l-37.8-10-13.8-36.5c-8.6-22.7-20.6-44.1-35.7-63.4a245.73 245.73 0 0 0-52.4-49.9c-41.1-28.9-89.5-44.2-140-44.2s-98.9 15.3-140 44.2a245.6 245.6 0 0 0-52.4 49.9 240.47 240.47 0 0 0-35.7 63.4l-13.9 36.6-37.9 9.9a125.7 125.7 0 0 0-66.1 43.7A123.1 123.1 0 0 0 140 612c0 33.1 12.9 64.3 36.3 87.7 23.4 23.4 54.5 36.3 87.6 36.3h496.2c33.1 0 64.2-12.9 87.6-36.3A123.3 123.3 0 0 0 884 612c0-56.2-37.8-105.5-92.1-120z"
        fill="#D9D9D9"></path>
    <path
        d="M811.4 418.7C765.6 297.9 648.9 212 512.2 212S258.8 297.8 213 418.6C127.3 441.1 64 519.1 64 612c0 110.5 89.5 200 199.9 200h496.2C870.5 812 960 722.5 960 612c0-92.7-63.1-170.7-148.6-193.3zm36.3 281a123.07 123.07 0 0 1-87.6 36.3H263.9c-33.1 0-64.2-12.9-87.6-36.3A123.3 123.3 0 0 1 140 612c0-28 9.1-54.3 26.2-76.3a125.7 125.7 0 0 1 66.1-43.7l37.9-9.9 13.9-36.6c8.6-22.8 20.6-44.1 35.7-63.4a245.6 245.6 0 0 1 52.4-49.9c41.1-28.9 89.5-44.2 140-44.2s98.9 15.3 140 44.2c19.9 14 37.5 30.8 52.4 49.9 15.1 19.3 27.1 40.7 35.7 63.4l13.8 36.5 37.8 10c54.3 14.5 92.1 63.8 92.1 120 0 33.1-12.9 64.3-36.3 87.7z">
    </path>
</svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('s vb=0 0 1024 1024,f=cc');
            expect(result).toContain('p M791.9 492l-37.8-10');
        });

        test('should convert sample2 - arrow left icon', () => {
            const svg = `<svg id="i-arrow-left" fill="none" width="38" xmlns="http://www.w3.org/2000/svg" height="38" stroke="currentColor" viewBox="0 0 32 32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 6 L2 16 10 26 M2 16 L30 16"></path>
</svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('f=n');
            expect(result).toContain('st=cc');
            expect(result).toContain('vb=0 0 32 32');
            expect(result).toContain('stw=2');
            expect(result).toContain('stlc=round');
            expect(result).toContain('stlj=round');
        });

        test('should convert sample5 - add icon with circle', () => {
            const svg = `<svg role="img" width="38" xmlns="http://www.w3.org/2000/svg" height="38" viewBox="0 0 24 24" aria-labelledby="addIconTitle" fill="none" stroke="currentColor"><title id="addIconTitle">Add</title><path d="M17 12L7 12M12 17L12 7"></path><circle r="10" cx="12" cy="12"></circle></svg>`;
            const result = svgToTextFormat(svg);
            expect(result).toContain('vb=0 0 24 24');
            expect(result).toContain('f=n');
            expect(result).toContain('st=cc');
            expect(result).toContain('p M17 12L7 12M12 17L12 7');
            expect(result).toContain('c r=10,cx=12,cy=12');
        });
    });
});
