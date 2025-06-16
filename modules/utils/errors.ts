/**
 * Custom error for file operations
 */

export /*bundle*/ class FileError extends Error { constructor(message: string){ super(message); this.name='FileError'; } }
