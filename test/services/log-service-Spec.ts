/// <reference path="../index.d.ts" />

import { warning } from '../../src/services/log-service'

describe('Test exported function', () => {
    it('does not error', () => {
        warning('Test warning message');
    });
    it('adds ?', () => {
        expect(50 + 50).toBe(100);
    })
})