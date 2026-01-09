export function log(type: 'info' | 'error' | 'warn', message: string, context: unknown = null) {
    console.log(`[${type.toUpperCase()} - ${new Date().toISOString()}] ${message}`);
    // TODO: Integrate with external logging service
    if (context) {
        console.log(context);
    }
}
