import { describe, expect, it } from 'vitest';
import { paginateRows, resolvePathProjectId } from './inputLine.util';

describe('inputLine util', () => {
  it('normalizes path project ids without precision loss', () => {
    expect(resolvePathProjectId('2042186550904643586')).toBe('2042186550904643586');
    expect(resolvePathProjectId(['2042186550904643586'])).toBe('2042186550904643586');
    expect(resolvePathProjectId('0')).toBeUndefined();
    expect(resolvePathProjectId('abc')).toBeUndefined();
  });

  it('paginates rows safely', () => {
    expect(paginateRows([1, 2, 3, 4, 5], 1, 2)).toEqual([1, 2]);
    expect(paginateRows([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
    expect(paginateRows([1, 2, 3], 0, 0)).toEqual([1, 2, 3]);
  });
});
