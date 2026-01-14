import type { SQL } from 'bun';

export const version = '20260114_161143_replace_attributes_to_adjust_with_default_svg_attributes';

export async function up(sql: SQL): Promise<void> {
    // Remove attributes_to_adjust column and add default_svg_attributes JSONB column
    await sql`
        ALTER TABLE variants
        DROP COLUMN IF EXISTS attributes_to_adjust
    `;

    await sql`
        ALTER TABLE variants
        ADD COLUMN default_svg_attributes JSONB NOT NULL DEFAULT '{}'::jsonb
    `;
}

export async function down(sql: SQL): Promise<void> {
    // Rollback: remove default_svg_attributes and add back attributes_to_adjust
    await sql`
        ALTER TABLE variants
        DROP COLUMN IF EXISTS default_svg_attributes
    `;

    await sql`
        ALTER TABLE variants
        ADD COLUMN attributes_to_adjust VARCHAR(63)[] DEFAULT '{}'
    `;
}
