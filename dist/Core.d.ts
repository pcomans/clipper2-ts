/*******************************************************************************
* Author    :  Angus Johnson                                                   *
* Date      :  12 December 2025                                                *
* Website   :  https://www.angusj.com                                          *
* Copyright :  Angus Johnson 2010-2025                                         *
* Purpose   :  Core structures and functions for the Clipper Library           *
* License   :  https://www.boost.org/LICENSE_1_0.txt                           *
*******************************************************************************/
export interface Point64 {
    x: number;
    y: number;
    z?: number;
}
export interface PointD {
    x: number;
    y: number;
    z?: number;
}
export type Path64 = Point64[];
export type PathD = PointD[];
export type Paths64 = Path64[];
export type PathsD = PathD[];
export interface Rect64 {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface RectD {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export declare enum ClipType {
    NoClip = 0,
    Intersection = 1,
    Union = 2,
    Difference = 3,
    Xor = 4
}
export declare enum PathType {
    Subject = 0,
    Clip = 1
}
export declare enum FillRule {
    EvenOdd = 0,
    NonZero = 1,
    Positive = 2,
    Negative = 3
}
export declare enum PointInPolygonResult {
    IsOn = 0,
    IsInside = 1,
    IsOutside = 2
}
export type ZCallback64 = (bot1: Point64, top1: Point64, bot2: Point64, top2: Point64, intersectPt: Point64) => void;
export type ZCallbackD = (bot1: PointD, top1: PointD, bot2: PointD, top2: PointD, intersectPt: PointD) => void;
declare function maxSafeCoordinateForScale(scale: number): number;
declare function checkSafeScaleValue(value: number, maxAbs: number, context: string): void;
declare function ensureSafeInteger(value: number, context: string): void;
declare function crossProduct(pt1: Point64, pt2: Point64, pt3: Point64): number;
declare function crossProductSign(pt1: Point64, pt2: Point64, pt3: Point64): number;
declare function checkPrecision(precision: number): void;
declare function isAlmostZero(value: number): boolean;
declare function triSign(x: number): number;
export interface UInt128Struct {
    lo64: bigint;
    hi64: bigint;
}
declare function multiplyUInt64(a: number, b: number): UInt128Struct;
declare function productsAreEqual(a: number, b: number, c: number, d: number): boolean;
declare function isCollinear(pt1: Point64, sharedPt: Point64, pt2: Point64): boolean;
declare function dotProduct(pt1: Point64, pt2: Point64, pt3: Point64): number;
declare function dotProductSign(pt1: Point64, pt2: Point64, pt3: Point64): number;
declare function icArea(path: Path64): number;
declare function crossProductD(vec1: PointD, vec2: PointD): number;
declare function dotProductD(vec1: PointD, vec2: PointD): number;
declare function roundToEven(value: number): number;
declare function checkCastInt64(val: number): number;
declare function getLineIntersectPt(ln1a: Point64, ln1b: Point64, ln2a: Point64, ln2b: Point64): Point64 | null;
declare function getLineIntersectPtD(ln1a: PointD, ln1b: PointD, ln2a: PointD, ln2b: PointD): {
    success: boolean;
    ip: PointD;
};
declare function segsIntersect(seg1a: Point64, seg1b: Point64, seg2a: Point64, seg2b: Point64, inclusive?: boolean): boolean;
declare function icGetBounds(path: Path64): Rect64;
declare function getClosestPtOnSegment(offPt: Point64, seg1: Point64, seg2: Point64): Point64;
declare function icPointInPolygon(pt: Point64, polygon: Path64): PointInPolygonResult;
declare function path2ContainsPath1(path1: Path64, path2: Path64): boolean;
declare function path1PlaceInPath2(path1: Path64, path2: Path64): PointInPolygonResult;
export declare const InternalClipper: {
    MaxInt64: bigint;
    MaxCoord: number;
    max_coord: number;
    min_coord: number;
    Invalid64: number;
    floatingPointTolerance: number;
    defaultMinimumEdgeLength: number;
    maxCoordForSafeAreaProduct: number;
    maxCoordForSafeCrossSq: number;
    maxSafeCoordinateForScale: typeof maxSafeCoordinateForScale;
    checkSafeScaleValue: typeof checkSafeScaleValue;
    ensureSafeInteger: typeof ensureSafeInteger;
    crossProduct: typeof crossProduct;
    crossProductSign: typeof crossProductSign;
    checkPrecision: typeof checkPrecision;
    isAlmostZero: typeof isAlmostZero;
    triSign: typeof triSign;
    multiplyUInt64: typeof multiplyUInt64;
    productsAreEqual: typeof productsAreEqual;
    isCollinear: typeof isCollinear;
    dotProduct: typeof dotProduct;
    dotProductSign: typeof dotProductSign;
    area: typeof icArea;
    crossProductD: typeof crossProductD;
    dotProductD: typeof dotProductD;
    roundToEven: typeof roundToEven;
    checkCastInt64: typeof checkCastInt64;
    getLineIntersectPt: typeof getLineIntersectPt;
    getLineIntersectPtD: typeof getLineIntersectPtD;
    segsIntersect: typeof segsIntersect;
    getBounds: typeof icGetBounds;
    getClosestPtOnSegment: typeof getClosestPtOnSegment;
    pointInPolygon: typeof icPointInPolygon;
    path2ContainsPath1: typeof path2ContainsPath1;
    path1PlaceInPath2: typeof path1PlaceInPath2;
};
/** @deprecated Import UInt128Struct directly instead of using InternalClipper.UInt128Struct */
export declare namespace InternalClipper {
    /** @deprecated Import UInt128Struct directly */
    type UInt128Struct = import('./Core.js').UInt128Struct;
}
export declare const Point64Utils: {
    create(x?: number, y?: number, z?: number): Point64;
    fromPointD(pt: PointD): Point64;
    scale(pt: Point64, scale: number): Point64;
    equals(a: Point64, b: Point64): boolean;
    add(a: Point64, b: Point64): Point64;
    subtract(a: Point64, b: Point64): Point64;
    toString(pt: Point64): string;
};
export declare const PointDUtils: {
    create(x?: number, y?: number, z?: number): PointD;
    fromPoint64(pt: Point64): PointD;
    scale(pt: PointD, scale: number): PointD;
    equals(a: PointD, b: PointD): boolean;
    negate(pt: PointD): void;
    toString(pt: PointD, precision?: number): string;
};
export declare const Rect64Utils: {
    create(l?: number, t?: number, r?: number, b?: number): Rect64;
    createInvalid(): Rect64;
    width(rect: Rect64): number;
    height(rect: Rect64): number;
    isEmpty(rect: Rect64): boolean;
    isValid(rect: Rect64): boolean;
    midPoint(rect: Rect64): Point64;
    contains(rect: Rect64, pt: Point64): boolean;
    containsRect(rect: Rect64, rec: Rect64): boolean;
    intersects(rect: Rect64, rec: Rect64): boolean;
    asPath(rect: Rect64): Path64;
};
export declare const RectDUtils: {
    create(l?: number, t?: number, r?: number, b?: number): RectD;
    createInvalid(): RectD;
    width(rect: RectD): number;
    height(rect: RectD): number;
    isEmpty(rect: RectD): boolean;
    midPoint(rect: RectD): PointD;
    contains(rect: RectD, pt: PointD): boolean;
    containsRect(rect: RectD, rec: RectD): boolean;
    intersects(rect: RectD, rec: RectD): boolean;
    asPath(rect: RectD): PathD;
};
export declare const PathUtils: {
    toString64(path: Path64): string;
    toStringD(path: PathD, precision?: number): string;
    reverse64(path: Path64): Path64;
    reverseD(path: PathD): PathD;
};
export declare const PathsUtils: {
    toString64(paths: Paths64): string;
    toStringD(paths: PathsD, precision?: number): string;
    reverse64(paths: Paths64): Paths64;
    reverseD(paths: PathsD): PathsD;
};
export declare const InvalidRect64: Rect64;
export declare const InvalidRectD: RectD;
export {};
//# sourceMappingURL=Core.d.ts.map