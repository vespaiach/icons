#!/usr/bin/env bun
/**
 * Test script to demonstrate compact AST savings
 */

import { calculateCompactionSavings, compactAst, expandAst } from './utils/compact-ast';

// Sample SVG AST from the user's example
const sampleSvgAst: SvgNode = {
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
        },
        {
            i: 'path3',
            t: 'path',
            a: {
                d: 'M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V5C22 3.34315 20.6569 2 19 2H5ZM19 4H5C4.44771 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44771 19.5523 4 19 4Z',
                fill: 'currentColor',
                'clip-rule': 'evenodd',
                'fill-rule': 'evenodd'
            }
        }
    ]
};

console.log('='.repeat(60));
console.log('🔬 COMPACT AST TEST');
console.log('='.repeat(60));
console.log('');

// Original format
const originalJson = JSON.stringify(sampleSvgAst);
console.log('📄 ORIGINAL FORMAT:');
console.log(originalJson);
console.log('');
console.log(`Size: ${originalJson.length} bytes`);
console.log('');

// Compact format
const compacted = compactAst(sampleSvgAst);
const compactedJson = JSON.stringify(compacted);
console.log('📦 COMPACT FORMAT:');
console.log(compactedJson);
console.log('');
console.log(`Size: ${compactedJson.length} bytes`);
console.log('');

// Calculate savings
const savings = calculateCompactionSavings(sampleSvgAst);
console.log('💾 SAVINGS:');
console.log(`  Original Size:  ${savings.originalSize} bytes`);
console.log(`  Compact Size:   ${savings.compactSize} bytes`);
console.log(`  Saved:          ${savings.savings} bytes`);
console.log(`  Reduction:      ${savings.savingsPercentage}%`);
console.log('');

// Test round-trip conversion
const expanded = expandAst(compacted);
const expandedJson = JSON.stringify(expanded);
const roundTripMatch = originalJson === expandedJson;

console.log('🔄 ROUND-TRIP TEST:');
console.log(`  Original → Compact → Expanded: ${roundTripMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

if (!roundTripMatch) {
    console.log('⚠️  Mismatch Details:');
    console.log('Expected:', originalJson);
    console.log('Got:', expandedJson);
}

console.log('='.repeat(60));
