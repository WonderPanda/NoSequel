import { extractDataType, allKeysPresent, keyOrder } from "..";

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
    });

    describe('key validation', () => {
        it('should flag missing keys', () => {
            const result = allKeysPresent(['message', 'anotherMessage', 'lastMessage'],
                { message: 'abcd' });
            expect(result).toBe(false);
        });
        it('clustering keys should be in the correct order: 1,3, missing second', () => {
            const result = keyOrder(['message', 'anotherMessage', 'lastMessage'],
                { message: 'abcd', lastMessage: 'last' });
            expect(result).toBe(false);

        });
        it('clustering keys should begin at the origin: 2,3, missing first', () => {
            const result = keyOrder(['message', 'anotherMessage', 'lastMessage'],
                { anotherMessage: 'else', lastMessage: 'last' });
            expect(result).toBe(false);

        });
        it('should be able to use the first clustering key only', () => {
            const result = keyOrder(['message', 'anotherMessage', 'lastMessage', 'last2'],
                { message: 'abcd' });
            expect(result).toBe(true);

        });
    })
});