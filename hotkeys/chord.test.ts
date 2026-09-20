import { describe, expect, it } from 'vitest';

import { canonicalQuery } from './chord.ts';

describe('canonicalQuery', () => {
    it('sorts typed modifiers into the order chordOf spells them in', () => {
        expect(canonicalQuery('cmd+shift+l')).toBe('shift+cmd+l');
    });

    it('sorts a modifier run with no key on it', () => {
        expect(canonicalQuery('cmd+shift')).toBe('shift+cmd');
    });

    it('leaves prose alone, so the same needle can match a note', () => {
        expect(canonicalQuery('linear')).toBe('linear');
    });
});
