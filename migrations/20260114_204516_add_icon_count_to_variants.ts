import type { SQL } from 'bun';

export const version = '20260114_204516_add_icon_count_to_variants';

export async function up(sql: SQL): Promise<void> {
    // Add icon_count column to variants table
    await sql`
        ALTER TABLE variants
        ADD COLUMN icon_count INTEGER NOT NULL DEFAULT 0
    `;

    // Populate icon_count with actual counts from icons table
    await sql`
        UPDATE variants
        SET icon_count = (
            SELECT COUNT(*)
            FROM icons
            WHERE icons.variant_id = variants.id
        )
    `;
}

export async function down(sql: SQL): Promise<void> {
    // Remove icon_count column from variants table
    await sql`
        ALTER TABLE variants
        DROP COLUMN icon_count
    `;
}
