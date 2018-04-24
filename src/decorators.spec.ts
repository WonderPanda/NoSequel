// export const sum
// 	= (...a: number[]) =>
// 		a.reduce((acc, val) => acc + val, 0);

// test('basic', () => {
// 	expect(sum()).toBe(0);
// });

// test('basic again', () => {
// 	expect(sum(1, 2)).toBe(3);
// });
import { Entity, getEntityMeta } from './decorators';

@Entity()
class TestClass {

}

describe('EntityClassDecorator', () => {
	it('should provide metadata for decorated classes', () => {
		const meta = getEntityMeta();
		console.log(meta);
	});
});