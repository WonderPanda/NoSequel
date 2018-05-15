import { extractDataType } from "..";

describe('utilities', () => {
    describe('extract DataType', () => {
        it('Should correctly identify numbers', () => {
            const input = 42;
            const result = extractDataType(input);

            expect(result).toBe('number');
        })

        it('Should correctly identify numbers wrapped in quotes as strings', () => {
            const input = '42';
            const result = extractDataType(input);

            expect(result).toBe('string');
        })


        it('Should correctly identify boolean', () => {
            const input = true;
            const result = extractDataType(input);

            expect(result).toBe('boolean');
        })
        it('Should correctly identify strings', () => {
            const input = 'Hello';
            const result = extractDataType(input);

            expect(result).toBe('string');
        })
        it('Should correctly identify dates', () => {
            const input = new Date();
            const result = extractDataType(input);

            expect(result).toBe('date');
        })
    })
});