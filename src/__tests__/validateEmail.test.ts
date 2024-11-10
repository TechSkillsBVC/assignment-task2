// __tests__/validateEmail.test.ts
import { validateEmail } from '../utils/validateEmail';

describe('validateEmail', () => {
    it('returns true for valid emails', () => {
        expect(validateEmail('luigi@carluccio.it')).toBe(true);
        expect(validateEmail('john@silva.com.br')).toBe(true);
    });

    it('returns false for invalid emails', () => {
        expect(validateEmail('invalidemail')).toBe(false);
        expect(validateEmail('missing@domain')).toBe(false);
        expect(validateEmail('missing@dot.')).toBe(false);
    });
});
