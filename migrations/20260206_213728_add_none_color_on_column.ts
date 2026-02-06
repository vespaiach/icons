import type { SQL } from 'bun';

export const version = '20260206_213728_add_none_color_on_column';

export async function up(sql: SQL): Promise<void> {
    await sql`
        ALTER TABLE variants
        ADD COLUMN none_color_on TEXT
    `;
}

export async function down(sql: SQL): Promise<void> {
    await sql`
        ALTER TABLE variants
        DROP COLUMN none_color_on
    `;
}
