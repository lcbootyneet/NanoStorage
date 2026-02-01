// nanostorage - localstorage compression lib

export type {
    NanoStorageOptions,
    StorageStats,
    CompressionResult,
    StoredItemMeta,
    ResolvedConfig,
    MarkerType,
} from './types';

export { DEFAULT_CONFIG, MARKERS } from './types';
export { compress, decompress, isSupported, createCompressor } from './core';
export { NanoStorage, createStorage } from './storage';

export {
    blobToBase64,
    uint8ArrayToBase64,
    base64ToUint8Array,
    getByteLength,
} from './utils';

import { NanoStorage } from './storage';

// default instance ready to use
export const nanoStorage = new NanoStorage();
export default nanoStorage;
