// utils for base64 stuff

/**
 * blob to base64 - uses filereader cuz its better for big files
 */
export async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            if (base64) {
                resolve(base64);
            } else {
                reject(new Error('blob to base64 failed'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

/**
 * uint8array to base64
 * chunked for big arrays so we dont blow the stack
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
    if (bytes.length < 65536) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]!);
        }
        return btoa(binary);
    }

    // chunk it for large arrays
    const chunkSize = 32768;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        for (let j = 0; j < chunk.length; j++) {
            binary += String.fromCharCode(chunk[j]!);
        }
    }
    return btoa(binary);
}

/**
 * base64 back to bytes
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// get utf8 byte length of string
export function getByteLength(str: string): number {
    return new TextEncoder().encode(str).length;
}

// json stringify with circular ref check
export function safeStringify(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('circular')) {
            throw new Error('circular ref detected, cant compress');
        }
        throw error;
    }
}

// parse json safely
export function safeParse<T>(json: string): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        throw new Error('invalid json data');
    }
}
