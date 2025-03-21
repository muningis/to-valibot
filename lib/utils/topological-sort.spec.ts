import { describe, expect, it } from 'bun:test';
import { topologicalSort } from './topological-sort';

describe('#topologicalSort()', () => {
  it('should sort provided objects', () => {
    const res = topologicalSort({
      lorem: '',
      baz: '',
      bar: '',
      foo: '',
    }, {
      lorem: ['foo'],
      bar: ['lorem'],
      baz: ['bar', 'foo'],
    });

    expect(res).toEqual([
      ['foo', ''],
      ['lorem', ''],
      ['bar', ''],
      ['baz', ''],
    ]);
  });
});