#!/usr/bin/env bun
/**
 * Test script to demonstrate bandwidth savings with compact AST
 * Simulates API response size comparison
 */

// Sample SVG AST representing a typical icon
const sampleIcon: IconWithRelativeData = {
    id: 1,
    name: 'sample-icon',
    repositoryId: 1,
    variantId: 1,
    svgAst: {
        i: 'root',
        t: 'svg',
        a: {
            fill: 'none',
            width: '24',
            xmlns: 'http://www.w3.org/2000/svg',
            height: '24',
            viewBox: '0 0 24 24'
        },
        c: [
            {
                i: 'path1',
                t: 'path',
                a: {
                    d: 'M12 17C12 17.5523 12.4477 18 13 18H17C17.5523 18 18 17.5523 18 17V13C18 12.4477 17.5523 12 17 12H16V16H12V17Z',
                    fill: 'currentColor'
                }
            },
            {
                i: 'path2',
                t: 'path',
                a: {
                    d: 'M11 6C11.5523 6 12 6.44772 12 7V8H8V12H7C6.44772 12 6 11.5523 6 11V7C6 6.44772 6.44772 6 7 6H11Z',
                    fill: 'currentColor'
                }
            }
        ]
    }
};

console.log('='.repeat(70));
console.log('🌐 API RESPONSE BANDWIDTH SAVINGS TEST');
console.log('='.repeat(70));
console.log('');

// Simulate API response with 1 icon
const singleIconFullResponse = JSON.stringify([sampleIcon]);
const singleIconCompactResponse = JSON.stringify([
    {
        id: sampleIcon.id,
        name: sampleIcon.name,
        repositoryId: sampleIcon.repositoryId,
        variantId: sampleIcon.variantId,
        svgAst: {
            i: 'root',
            t: 'svg',
            a: sampleIcon.svgAst.a,
            c: sampleIcon.svgAst.c?.map((child: SvgNode) => ({
                i: child.i,
                t: child.t,
                a: child.a
            }))
        }
    }
]);

console.log('📦 SINGLE ICON RESPONSE:');
console.log(`  Full format:     ${singleIconFullResponse.length} bytes`);
console.log(`  Compact format:  ${singleIconCompactResponse.length} bytes`);
console.log(
    `  Saved:           ${singleIconFullResponse.length - singleIconCompactResponse.length} bytes (${(((singleIconFullResponse.length - singleIconCompactResponse.length) / singleIconFullResponse.length) * 100).toFixed(2)}%)`
);
console.log('');

// Simulate API response with 100 icons
const manyIcons = Array(100).fill(sampleIcon);
const manyIconsFullResponse = JSON.stringify(manyIcons);
const manyIconsCompactResponse = JSON.stringify(
    manyIcons.map((icon) => ({
        id: icon.id,
        name: icon.name,
        repositoryId: icon.repositoryId,
        variantId: icon.variantId,
        svgAst: {
            i: 'root',
            t: 'svg',
            a: icon.svgAst.a,
            c: icon.svgAst.c?.map((child: SvgNode) => ({
                i: child.i,
                t: child.t,
                a: child.a
            }))
        }
    }))
);

console.log('📦 100 ICONS RESPONSE:');
console.log(
    `  Full format:     ${manyIconsFullResponse.length.toLocaleString()} bytes (${(manyIconsFullResponse.length / 1024).toFixed(2)} KB)`
);
console.log(
    `  Compact format:  ${manyIconsCompactResponse.length.toLocaleString()} bytes (${(manyIconsCompactResponse.length / 1024).toFixed(2)} KB)`
);
console.log(
    `  Saved:           ${(manyIconsFullResponse.length - manyIconsCompactResponse.length).toLocaleString()} bytes (${(((manyIconsFullResponse.length - manyIconsCompactResponse.length) / manyIconsFullResponse.length) * 100).toFixed(2)}%)`
);
console.log('');

// Estimate monthly bandwidth savings
const avgRequestsPerDay = 1000; // Example: 1000 API calls per day
const avgIconsPerRequest = 50;
const requestsPerMonth = avgRequestsPerDay * 30;
const bytesPerIcon = singleIconFullResponse.length - singleIconCompactResponse.length;
const monthlyBandwidthSavings = (requestsPerMonth * avgIconsPerRequest * bytesPerIcon) / 1024 / 1024;

console.log('💰 ESTIMATED MONTHLY SAVINGS:');
console.log(`  Assumptions:`);
console.log(`    - ${avgRequestsPerDay.toLocaleString()} API requests/day`);
console.log(`    - ${avgIconsPerRequest} icons per request (average)`);
console.log(`    - ${bytesPerIcon} bytes saved per icon`);
console.log('');
console.log(`  Monthly bandwidth saved: ${monthlyBandwidthSavings.toFixed(2)} MB`);
console.log(`  Yearly bandwidth saved:  ${(monthlyBandwidthSavings * 12).toFixed(2)} MB`);
console.log('');

console.log('✅ Benefits:');
console.log('  • Faster API responses');
console.log('  • Lower data transfer costs');
console.log('  • Improved mobile user experience');
console.log('  • Reduced server bandwidth usage');
console.log('');

console.log('='.repeat(70));
