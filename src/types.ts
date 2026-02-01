/**
 * types for nanostorage lib
 */

export interface NanoStorageOptions {
    /** min bytes to compress. smaller stuff stored raw */
    threshold?: number;
    /** compression algo */
    algorithm?: 'gzip' | 'deflate';
    /** key prefix for storage */
    keyPrefix?: string;
}

export interface StorageStats {
    totalItems: number;
    compressedSize: number;
    originalSize: number;
    compressionRatio: number;
}

export interface CompressionResult {
    data: string;
    originalSize: number;
    compressedSize: number;
    wasCompressed: boolean;
}

export interface StoredItemMeta {
    timestamp: number;
    originalSize: number;
    version: number;
}

export interface ResolvedConfig {
    threshold: number;
    algorithm: 'gzip' | 'deflate';
    keyPrefix: string;
}

export const DEFAULT_CONFIG: ResolvedConfig = {
    threshold: 500,
    algorithm: 'gzip',
    keyPrefix: 'ns:',
} as const;

// markers for data format
export const MARKERS = {
    RAW: 'R',
    GZIP: 'G',
    DEFLATE: 'D',
} as const;

export type MarkerType = (typeof MARKERS)[keyof typeof MARKERS];
