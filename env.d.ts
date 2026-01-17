declare module 'bun' {
    interface Env {
        DATABASE_URL: string;
        PROCESSING_BATCH_SIZE: string;
        COOKIE_SECRET: string;
        COOKIE_MAX_AGE: string;
        DEBUG_QUERIES?: string;
    }
}
