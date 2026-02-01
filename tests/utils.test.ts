// util tests

import { describe, it, expect } from 'vitest';
import {
    uint8ArrayToBase64,
    base64ToUint8Array,
    getByteLength,
    safeStringify,
    safeParse,
} from '../src/utils';

describe('uint8ArrayToBase64', () => {
    it('empty array', () => {
        const bytes = new Uint8Array([]);
        expect(uint8ArrayToBase64(bytes)).toBe('');
    });

    it('simple bytes', () => {
        const bytes = new Uint8Array([72, 101, 108, 108, 111]); // Hello
        expect(uint8ArrayToBase64(bytes)).toBe('SGVsbG8=');
    });

    it('big array no stack overflow', () => {
        const largeArray = new Uint8Array(100000);
        for (let i = 0; i < largeArray.length; i++) {
            largeArray[i] = i % 256;
        }

        expect(() => uint8ArrayToBase64(largeArray)).not.toThrow();
        const result = uint8ArrayToBase64(largeArray);
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('base64ToUint8Array', () => {
    it('empty string', () => {
        const bytes = base64ToUint8Array('');
        expect(bytes.length).toBe(0);
    });

    it('decode simple', () => {
        const bytes = base64ToUint8Array('SGVsbG8=');
        expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111]);
    });

    it('roundtrip', () => {
        const original = new Uint8Array([1, 2, 3, 255, 0, 128]);
        const base64 = uint8ArrayToBase64(original);
        const decoded = base64ToUint8Array(base64);
        expect(Array.from(decoded)).toEqual(Array.from(original));
    });
});

describe('getByteLength', () => {
    it('ascii', () => {
        expect(getByteLength('Hello')).toBe(5);
    });

    it('empty', () => {
        expect(getByteLength('')).toBe(0);
    });

    it('utf8', () => {
        expect(getByteLength('мир')).toBe(6);
        expect(getByteLength('日本')).toBe(6);
        expect(getByteLength('🎉')).toBe(4);
    });
});

describe('safeStringify', () => {
    it('object', () => {
        expect(safeStringify({ a: 1 })).toBe('{"a":1}');
    });

    it('array', () => {
        expect(safeStringify([1, 2, 3])).toBe('[1,2,3]');
    });

    it('primitives', () => {
        expect(safeStringify('hello')).toBe('"hello"');
        expect(safeStringify(42)).toBe('42');
        expect(safeStringify(true)).toBe('true');
        expect(safeStringify(null)).toBe('null');
    });

    it('circular throws', () => {
        const obj: Record<string, unknown> = { a: 1 };
        obj['self'] = obj;
        expect(() => safeStringify(obj)).toThrow();
    });
});

describe('safeParse', () => {
    it('valid json', () => {
        expect(safeParse('{"a":1}')).toEqual({ a: 1 });
        expect(safeParse('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('invalid throws', () => {
        expect(() => safeParse('{')).toThrow();
        expect(() => safeParse('undefined')).toThrow();
    });
});
