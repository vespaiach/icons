#!/usr/bin/env bun

/**
 * Analyze actual SVG AST storage savings in your database
 * Run this to see real savings before running the migration
 */

import { sql } from './db/db.client';
import { calculateCompactionSavings } from './utils/compact-ast';

async function analyzeDatabase() {
    console.log('🔍 Analyzing SVG AST storage in database...\n');

    try {
        // Get sample of icons to analyze
        const sampleSize = 100;
        const icons = await sql`
            SELECT id, name, svg_ast 
            FROM icons 
            ORDER BY RANDOM() 
            LIMIT ${sampleSize}
        `;

        if (icons.length === 0) {
            console.log('⚠️  No icons found in database.');
            return;
        }

        console.log(`📊 Analyzing ${icons.length} random icons...\n`);

        let totalOriginalSize = 0;
        let totalCompactSize = 0;
        const samples = [];

        for (const icon of icons) {
            try {
                const savings = calculateCompactionSavings(icon.svg_ast as SvgNode);
                totalOriginalSize += savings.originalSize;
                totalCompactSize += savings.compactSize;

                // Keep a few samples for display
                if (samples.length < 3) {
                    samples.push({
                        name: icon.name,
                        ...savings
                    });
                }
            } catch (error) {
                console.error(`Error analyzing icon ${icon.id}:`, error);
            }
        }

        const totalSavings = totalOriginalSize - totalCompactSize;
        const averageSavingsPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(2);

        console.log('═'.repeat(70));
        console.log('📈 AGGREGATE RESULTS');
        console.log('═'.repeat(70));
        console.log(`Total Original Size:    ${totalOriginalSize.toLocaleString()} bytes`);
        console.log(`Total Compact Size:     ${totalCompactSize.toLocaleString()} bytes`);
        console.log(`Total Savings:          ${totalSavings.toLocaleString()} bytes`);
        console.log(`Average Reduction:      ${averageSavingsPercent}%`);
        console.log('');

        // Get total count to estimate full database savings
        const [{ count }] = await sql`SELECT COUNT(*) as count FROM icons`;
        const estimatedTotalSavings = (totalSavings / icons.length) * count;

        console.log('💾 ESTIMATED DATABASE IMPACT');
        console.log('─'.repeat(70));
        console.log(`Total Icons in Database:        ${count.toLocaleString()}`);
        console.log(
            `Estimated Total Savings:        ${estimatedTotalSavings.toLocaleString()} bytes (${(estimatedTotalSavings / 1024 / 1024).toFixed(2)} MB)`
        );
        console.log('');

        console.log('📋 SAMPLE BREAKDOWNS');
        console.log('─'.repeat(70));
        for (const sample of samples) {
            console.log(`Icon: ${sample.name}`);
            console.log(`  Original: ${sample.originalSize} bytes`);
            console.log(`  Compact:  ${sample.compactSize} bytes`);
            console.log(`  Saved:    ${sample.savings} bytes (${sample.savingsPercentage}%)`);
            console.log('');
        }

        console.log('═'.repeat(70));
        console.log('✅ Analysis complete!');
        console.log('');
        console.log('To apply these savings, run:');
        console.log('  bun run migrate');
        console.log('');
    } catch (error) {
        console.error('❌ Error analyzing database:', error);
    } finally {
        await sql.end();
    }
}

analyzeDatabase();
