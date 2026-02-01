// storage wrapper with compression

import { compress, decompress, isSupported } from './core';
import { getByteLength } from './utils';
import {
    DEFAULT_CONFIG,
    type NanoStorageOptions,
    type ResolvedConfig,
    type StorageStats,
} from './types';

export class NanoStorage {
    private config: ResolvedConfig;

    constructor(options?: NanoStorageOptions) {
        this.config = {
            threshold: options?.threshold ?? DEFAULT_CONFIG.threshold,
            algorithm: options?.algorithm ?? DEFAULT_CONFIG.algorithm,
            keyPrefix: options?.keyPrefix ?? DEFAULT_CONFIG.keyPrefix,
        };
    }

    private getKey(key: string): string {
        return this.config.keyPrefix + key;
    }

    private getManagedKeys(): string[] {
        const keys: string[] = [];
        const prefix = this.config.keyPrefix;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(prefix)) {
                keys.push(key.slice(prefix.length));
            }
        }

        return keys;
    }

    isSupported(): boolean {
        return isSupported();
    }

    // store value with auto compression
    async setItem<T>(key: string, value: T): Promise<void> {
        const result = await compress(value, this.config);

        try {
            localStorage.setItem(this.getKey(key), result.data);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                throw new Error(`storage full, size: ${result.compressedSize}b`);
            }
            throw error;
        }
    }

    // get and decompress
    async getItem<T>(key: string): Promise<T | null> {
        const data = localStorage.getItem(this.getKey(key));

        if (data === null) {
            return null;
        }

        return decompress<T>(data);
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(this.getKey(key));
    }

    async hasItem(key: string): Promise<boolean> {
        return localStorage.getItem(this.getKey(key)) !== null;
    }

    // clear only our prefixed keys
    async clear(): Promise<void> {
        const keys = this.getManagedKeys();
        for (const key of keys) {
            localStorage.removeItem(this.getKey(key));
        }
    }

    async keys(): Promise<string[]> {
        return this.getManagedKeys();
    }

    async length(): Promise<number> {
        return this.getManagedKeys().length;
    }

    // get compression stats
    async getStats(): Promise<StorageStats> {
        const keys = this.getManagedKeys();
        let compressedSize = 0;
        let originalSize = 0;

        for (const key of keys) {
            const data = localStorage.getItem(this.getKey(key));
            if (data) {
                compressedSize += getByteLength(data);

                try {
                    const original = await decompress(data);
                    originalSize += getByteLength(JSON.stringify(original));
                } catch {
                    originalSize += compressedSize;
                }
            }
        }

        return {
            totalItems: keys.length,
            compressedSize,
            originalSize,
            compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1,
        };
    }

    async forEach<T>(
        callback: (value: T, key: string) => void | Promise<void>
    ): Promise<void> {
        const keys = this.getManagedKeys();

        for (const key of keys) {
            const value = await this.getItem<T>(key);
            if (value !== null) {
                await callback(value, key);
            }
        }
    }

    async getItems<T>(keys: string[]): Promise<Record<string, T | null>> {
        const result: Record<string, T | null> = {};

        for (const key of keys) {
            result[key] = await this.getItem<T>(key);
        }

        return result;
    }

    async setItems<T>(items: Record<string, T>): Promise<void> {
        for (const [key, value] of Object.entries(items)) {
            await this.setItem(key, value);
        }
    }
}

export function createStorage(options?: NanoStorageOptions): NanoStorage {
    return new NanoStorage(options);
}
