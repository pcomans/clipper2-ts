/**
 * PolyTree nesting of result paths that touch.
 *
 * buildTree walks each result path up an owner chain that the sweep starts
 * and nests it under the first owner that contains it. The PolyTree contract:
 * the children of an outer path are holes and the children of a hole are
 * outer paths, so a parent always has the opposite orientation. Found by
 * randomised testing against an independent exact checker.
 */
import { describe, test, expect } from 'vitest';
import {
  booleanOp, booleanOpWithPolyTree, area, InternalClipper, PointInPolygonResult,
  PolyTree64, PolyPath64, ClipType, FillRule, type Path64, type Paths64,
} from '../src';

const path = (...xy: number[]): Path64 => {
  const p: Path64 = [];
  for (let i = 0; i < xy.length; i += 2) p.push({ x: xy[i], y: xy[i + 1] });
  return p;
};

/** [depth, area] of every node, depth first */
function nodes(tree: PolyTree64): [number, number][] {
  const out: [number, number][] = [];
  const walk = (pp: PolyPath64 | PolyTree64, depth: number) => {
    for (let i = 0; i < pp.count; i++) {
      const child = pp.child(i);
      out.push([depth, area(child.poly!)]);
      walk(child, depth + 1);
    }
  };
  walk(tree, 0);
  return out;
}

function treeOf(ct: ClipType, fr: FillRule, subject: Paths64, clip: Paths64): PolyTree64 {
  const tree = new PolyTree64();
  booleanOpWithPolyTree(ct, subject, clip, tree, fr);
  return tree;
}

describe('PolyTree nesting of touching paths', () => {
  test('an outer path sharing an edge with another stays at the top level', () => {
    // two triangles sharing the edge (100,37)-(104,39); every vertex of the
    // smaller lies on the larger but one, which is outside it, and the
    // midpoint of its bounds lies on the larger
    const tree = treeOf(ClipType.Intersection, FillRule.NonZero,
      [path(100, 37, 195, 0, 107, 41), path(100, 37, 107, 41, 0, 0)],
      [path(76, 0, 104, 39, 0, 0)]);
    expect(nodes(tree)).toEqual([[0, 26], [0, 4]]);
  });

  test('outer paths that rounding leaves slightly crossing are not nested', () => {
    // the two result triangles touch along a line; rounding the computed
    // points leaves them crossing by a unit, so containment can't be told,
    // and the orientation decides
    const tree = treeOf(ClipType.Intersection, FillRule.NonZero,
      [path(0, 0, 5141749069, 0, 5141749101, 5141749100)],
      [path(5930366127, 0, 1755271217, 5141749072, 0, 0),
        path(7462532174, 0, 5065272711, 5141749101, 4220261353, 506311144),
        path(5065272705, 5141749070, 0, 5141749070, 4681317630, 3035505272)]);
    const n = nodes(tree);
    expect(n.map(([depth]) => depth)).toEqual([0, 0]);
    for (const [, a] of n) expect(a).toBeGreaterThan(0);
  });

  test.fails.each([
    ['union, even-odd', ClipType.Union, FillRule.EvenOdd,
      [path(1, 0, 0, 3, 1, 3), path(1, 1, 1, 0, 1, 2, 0, 4), path(1, 3, 0, 2, 2, 1)], [],
      [[0, 2], [1, -1]]],
    ['xor, even-odd', ClipType.Xor, FillRule.EvenOdd,
      [path(1, 1, 0, 3, 1, 0, 0, 2), path(0, 1, 1, 2, 2, 0)], [],
      [[0, 2.5], [1, -1]]],
    ['union, non-zero', ClipType.Union, FillRule.NonZero,
      [path(7, 0, 7, 20, 0, 20), path(11, 0, 15, 0, 11, 33)],
      [path(0, 20, 7, 20, 7, 25), path(7, 0, 13, 18, 7, 36), path(18, 26, 0, 18, 18, 28)],
      [[0, 262.5], [1, -4]]],
  ] as [string, ClipType, FillRule, Paths64, Paths64, [number, number][]][])(
    'a hole touching its parent where the sweep closes it is nested in it (%s)',
    (_name, ct, fr, subject, clip, expected) => {
      expect(nodes(treeOf(ct, fr, subject, clip))).toEqual(expected);
    });

  test.each([
    ['union, even-odd', ClipType.Union, FillRule.EvenOdd,
      [path(0, 0, 4, 0, 0, 2), path(0, 0, 2, 0, 0, 2), path(1, 0, 3, 0, 0, 3),
        path(0, 3, 4, 0, 2, 0), path(0, 0, 2, 0, 0, 2)],
      [path(0, 1, 2, 2, 0, 1)],
      [[0, 1.5], [1, -1]]],
    ['xor, positive', ClipType.Xor, FillRule.Positive,
      [path(0, 0, 1, 7, 0, 7), path(0, 7, 7, 7, 1, 12, 0, 12), path(0, 12, 2, 12, 0, 16),
        path(7, 0, 8, 7, 7, 7), path(7, 7, 10, 7, 7, 10)],
      [path(0, 4, 9, 8, 1, 12), path(0, 0, 7, 0, 7, 13, 0, 13)],
      [[0, 3], [0, 73.5], [1, -2]]],
  ] as [string, ClipType, FillRule, Paths64, Paths64, [number, number][]][])(
    'touching paths found during the sweep, a hole is nested in its parent (%s)',
    (_name, ct, fr, subject, clip, expected) => {
      // degenerate pieces of paths met while splitting them in the sweep:
      // these stay as they were
      expect(nodes(treeOf(ct, fr, subject, clip))).toEqual(expected);
    });

  test('random touching fans: every node has the orientation of its depth', () => {
    // fans of thin triangles around a point near a cell's corner, cut by the
    // cell, with a real hole and island every third trial
    let state = 7;
    const random = () => ((state = (state * 1103515245 + 12345) % 2147483648) / 2147483648);
    let wrong = 0;
    for (let trial = 0; trial < 20000; trial++) {
      const cx = Math.round(random() * 4000), cy = Math.round(random() * 4000);
      const n = 2 + Math.floor(random() * 5);
      const angles = Array.from({ length: n + 1 }, () => random() * 6.283).sort((a, b) => a - b);
      const radius = 2 + random() * 400000;
      const ends = angles.map((t) => ({
        x: Math.round(cx + radius * (0.3 + random()) * Math.cos(t)),
        y: Math.round(cy + radius * (0.3 + random()) * Math.sin(t)),
      }));
      const subject: Paths64 = Array.from({ length: n }, (_, k) => {
        const triangle = [{ x: cx, y: cy }, ends[k], ends[k + 1]];
        return area(triangle) < 0 ? triangle.reverse() : triangle;
      });
      if (trial % 3 === 0) subject.push(path(-2000, -2000, 6000, -2000, 6000, 6000, -2000, 6000), path(0, 0, 0, 4000, 4000, 4000, 4000, 0));
      const ct = trial % 4 < 2 ? ClipType.Intersection : ClipType.Difference;
      const clip = ct === ClipType.Difference || trial % 2 ? [path(0, 0, 4000, 0, 4000, 4000, 0, 4000)] : [path(-8000, -8000, 8000, -8000, 8000, 8000, -8000, 8000)];
      const tree = treeOf(ct, FillRule.NonZero, subject, clip);
      const n2 = nodes(tree);
      for (const [depth, a] of n2) if ((a > 0) !== (depth % 2 === 0)) wrong++;
      const flat = booleanOp(ct, subject, clip, FillRule.NonZero);
      expect(n2.reduce((sum, [, a]) => sum + a, 0)).toBe(flat.reduce((sum, p) => sum + area(p), 0));
    }
    expect(wrong).toBe(0);
  });
});

describe('path1PlaceInPath2', () => {
  const square = path(0, 0, 4, 0, 4, 4, 0, 4);
  const place = (p: Path64) => InternalClipper.path1PlaceInPath2(p, square);

  test('touching paths', () => {
    // inscribed, every vertex on a side of the square
    expect(place(path(2, 0, 4, 2, 2, 4, 0, 2))).toBe(PointInPolygonResult.IsInside);
    // half of the square, cut along its diagonal
    expect(place(path(0, 0, 4, 0, 4, 4))).toBe(PointInPolygonResult.IsInside);
    // sharing the bottom side, from outside
    expect(place(path(4, 0, 0, 0, 2, -3))).toBe(PointInPolygonResult.IsOutside);
    // sharing part of the bottom side, with a vertex of the square on its edge
    expect(place(path(-2, 0, 2, 0, 0, -2))).toBe(PointInPolygonResult.IsOutside);
    // along the square's outline: not inside it
    expect(place(square)).toBe(PointInPolygonResult.IsOutside);
  });

  test('a vertex strictly inside or outside', () => {
    expect(place(path(1, 1, 3, 1, 2, 3))).toBe(PointInPolygonResult.IsInside);
    expect(place(path(5, 5, 6, 5, 6, 6))).toBe(PointInPolygonResult.IsOutside);
  });

  test('crossing paths', () => {
    // one vertex inside, the next outside, the rest on the square
    expect(place(path(0, 0, 2, 1, 2, -1))).toBe(PointInPolygonResult.IsOn);
  });

  test('coordinates beyond 2^51', () => {
    const big = 2 ** 52;
    const sq = path(0, 0, big, 0, big, big, 0, big);
    expect(InternalClipper.path1PlaceInPath2(path(big / 2, 0, big, big / 2, big / 2, big, 0, big / 2), sq))
      .toBe(PointInPolygonResult.IsInside);
    expect(InternalClipper.path1PlaceInPath2(path(big, 0, 0, 0, big / 2, -big / 2), sq))
      .toBe(PointInPolygonResult.IsOutside);
  });
});
