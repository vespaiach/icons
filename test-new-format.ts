import { svgToTextFormat, textFormatToSvg } from './converters/svg-to-text-converter';

// Test sample 2 - simple case
const svg2 = `<svg fill="none" stroke="currentColor" viewBox="0 0 32 32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6 L2 16 10 26 M2 16 L30 16"></path></svg>`;

console.log('=== Sample 2 Test ===');
const text2 = svgToTextFormat(svg2);
console.log('Output:  ', text2);
console.log(
    'Expected:',
    's f=n_st=cc_vb=0 0 32 32_stw=2_stlc=round_stlj=round|:1p M10 6 L2 16 10 26 M2 16 L30 16 '
);

// Test sample 7 - complex nested structure
const svg7 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <defs>
        <style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style>
    </defs>
    <title>activity</title>
    <g id="Layer_2" data-name="Layer 2">
        <g id="activity">
            <g id="activity-2" data-name="activity">
                <rect class="cls-1" width="24" height="24" transform="translate(24 0) rotate(90)"/>
                <path class="cls-2" d="M14.33,20h-.21a2,2,0,0,1-1.76-1.58L9.68,6,6.92,12.4A1,1,0,0,1,6,13H3a1,1,0,0,1,0-2H5.34L7.85,5.21a2,2,0,0,1,3.79.38L14.32,18l2.76-6.38A1,1,0,0,1,18,11h3a1,1,0,0,1,0,2H18.66l-2.51,5.79A2,2,0,0,1,14.33,20Z"/>
            </g>
        </g>
    </g>
</svg>`;

console.log('\n=== Sample 7 Test (Nested) ===');
const text7 = svgToTextFormat(svg7);
console.log('Output:');
console.log(text7);
console.log('\nExpected:');
console.log(
    's vb=0 0 24 24|:1defs|1:2sl >.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}|:3g id=Layer_2_d-name=Layer 2|3:4g id=activity|4:5g id=activity-2_d-name=activity|5:6r cl=cls-1_w=24_h=24_tf=translate(24 0) rotate(90)|5:7p cl=cls-2_M14.33,20h-.21a2,2,0,0,1-1.76-1.58L9.68,6,6.92,12.4A1,1,0,0,1,6,13H3a1,1,0,0,1,0-2H5.34L7.85,5.21a2,2,0,0,1,3.79.38L14.32,18l2.76-6.38A1,1,0,0,1,18,11h3a1,1,0,0,1,0,2H18.66l-2.51,5.79A2,2,0,0,1,14.33,20Z '
);

console.log('\n=== Round-trip Test ===');
try {
    const restored = textFormatToSvg(text2);
    console.log('✓ Round-trip successful');
    console.log(restored);
} catch (error) {
    console.error('✗ Round-trip failed:', error);
}
