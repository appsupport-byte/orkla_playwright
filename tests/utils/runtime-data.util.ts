import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger.util';

/**
 * File-backed key-value store for sharing data across steps and scenarios.
 * Persists to disk immediately on every write so values survive across scenarios.
 */
export class RuntimeDataStore {

    private static readonly FILE_PATH = path.resolve(process.cwd(), 'test-results', 'runtime-data.json');

    /** In-memory cache — loaded once from disk on first access */
    private static cache: Record<string, string> | null = null;

    // ─── Public API ───────────────────────────────────────────────────────────────

    static save(key: string, value: string): void {
        const store = RuntimeDataStore.loadFromDisk();
        store[key] = value;
        RuntimeDataStore.cache = store;
        RuntimeDataStore.flushToDisk(store);
        Logger.info(`[RuntimeDataStore] Saved → "${key}": "${value}"`);
    }

    /** Returns undefined if key does not exist */
    static get(key: string): string | undefined {
        const value = RuntimeDataStore.loadFromDisk()[key];
        if (value === undefined) {
            Logger.warn(`[RuntimeDataStore] Key not found → "${key}"`);
        }
        return value;
    }

    /** Throws with available keys listed if key is missing */
    static getRequired(key: string): string {
        const value = RuntimeDataStore.loadFromDisk()[key];
        if (value === undefined) {
            throw new Error(
                `[RuntimeDataStore] Required key "${key}" not found.\n` +
                `Available keys: ${RuntimeDataStore.listKeys().join(', ') || '(none)'}`
            );
        }
        return value;
    }

    static has(key: string): boolean {
        return key in RuntimeDataStore.loadFromDisk();
    }

    static delete(key: string): void {
        const store = RuntimeDataStore.loadFromDisk();
        if (key in store) {
            delete store[key];
            RuntimeDataStore.cache = store;
            RuntimeDataStore.flushToDisk(store);
            Logger.info(`[RuntimeDataStore] Deleted → "${key}"`);
        } else {
            Logger.warn(`[RuntimeDataStore] Delete skipped — key not found → "${key}"`);
        }
    }

    static listKeys(): string[] {
        return Object.keys(RuntimeDataStore.loadFromDisk());
    }

    static snapshot(): Readonly<Record<string, string>> {
        return { ...RuntimeDataStore.loadFromDisk() };
    }

    /** Call in BeforeAll to start each run with a clean store */
    static clear(): void {
        RuntimeDataStore.cache = {};
        if (fs.existsSync(RuntimeDataStore.FILE_PATH)) {
            fs.unlinkSync(RuntimeDataStore.FILE_PATH);
        }
        Logger.info('[RuntimeDataStore] Store cleared.');
    }

    /** Call in AfterAll to print all stored values for traceability */
    static logSummary(): void {
        const store = RuntimeDataStore.loadFromDisk();
        const keys = Object.keys(store);

        if (keys.length === 0) {
            Logger.info('[RuntimeDataStore] Store is empty.');
            return;
        }

        Logger.info('[RuntimeDataStore] ── Stored Values ──────────────────────');
        keys.forEach(key => Logger.info(`  ${key}: ${store[key]}`));
        Logger.info('[RuntimeDataStore] ───────────────────────────────────────');
    }

    // ─── Private ──────────────────────────────────────────────────────────────────

    private static loadFromDisk(): Record<string, string> {
        if (RuntimeDataStore.cache !== null) {
            return RuntimeDataStore.cache;
        }

        if (!fs.existsSync(RuntimeDataStore.FILE_PATH)) {
            RuntimeDataStore.cache = {};
            return RuntimeDataStore.cache;
        }

        try {
            const raw = fs.readFileSync(RuntimeDataStore.FILE_PATH, 'utf-8');
            RuntimeDataStore.cache = JSON.parse(raw);
        } catch (error) {
            Logger.warn(`[RuntimeDataStore] Failed to parse file — starting fresh. Error: ${error}`);
            RuntimeDataStore.cache = {};
        }

        return RuntimeDataStore.cache!;
    }

    private static flushToDisk(store: Record<string, string>): void {
        const dir = path.dirname(RuntimeDataStore.FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(RuntimeDataStore.FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    }
}