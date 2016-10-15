import shallowEquals, { shallowEqualsDebug } from '../shallowEquals';

describe('shallowEquals', () => {
  it('typical shallow equals checks', () => {
    expect(shallowEquals({ a: [1, 2, 3] }, { a: [1, 2, 3] })).toBe(false);
    expect(shallowEquals({ a: 4, b: 10, c: 12 }, { a: 4, b: 10, c: 12 })).toBe(true);

    const objA = { a: [1, 2, 3], b: 15 };
    const objB = { a: objA.a, b: 15 };
    expect(shallowEquals(objA, objB)).toBe(true);
  });

  it('excludes keys when comparing', () => {
    expect(shallowEquals({ a: [1, 2, 3], b: 19 }, { a: [1, 2, 3], b: 19 }, ['a'])).toBe(true);
    expect(shallowEquals({ a: [1, 2, 3], b: 19 }, { a: [1, 2, 3], b: 20 }, ['a'])).toBe(false);

    expect(shallowEquals({ a: [1, 2, 3], b: 19, c: 999 }, { a: [1, 2, 3], b: 19, c: 123 },
      ['a', 'c'])).toBe(true);
  });

  it('includes keys when comparing', () => {
    expect(shallowEquals({ a: [1, 2, 3], b: 19 }, { a: [1, 2, 3], b: 19, c: 99 }, null,
      ['b'])).toBe(true);
    expect(shallowEquals({ a: [1, 2, 3], b: 19 }, { a: [1, 2, 3], b: 20, c: 99 }, null,
      ['b'])).toBe(false);

    expect(shallowEquals({ a: [1, 2, 3], b: 20, c: 94 }, { a: [1, 2, 3], b: 20, c: 99 }, null,
      ['b', 'c'])).toBe(false);
  });

  it('ignores include if exclude keys provided', () => {
    expect(shallowEquals({ a: [1, 2, 3], b: 19 }, { a: [1, 2, 3], b: 19, c: 99 }, ['a', 'c'],
    ['c'])).toBe(true);
  });
});

describe('shallowEqualsDebug', () => {
  it('returns equal when equal', () => {
    expect(shallowEqualsDebug({ a: 4, b: 10, c: 12 }, { a: 4, b: 10, c: 12 })).toBe('equal');
  });

  it('returns differences correctly', () => {
    expect(shallowEqualsDebug({ a: 4, b: 9, c: 2 }, { a: 4, b: 10, c: 12 })).toEqual(
      ['b', 9, 10, 'c', 2, 12]);
  });
});
