declare module 'bun' {
    interface Env {
        DATABASE_URL: string;
        PROCESSING_BATCH_SIZE: string;
    }
}
