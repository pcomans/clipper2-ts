/*******************************************************************************
* Author    :  Angus Johnson                                                   *
* Date      :  10 October 2024                                                 *
* Website   :  https://www.angusj.com                                          *
* Copyright :  Angus Johnson 2010-2024                                         *
* Purpose   :  Minkowski Sum and Difference                                    *
* License   :  https://www.boost.org/LICENSE_1_0.txt                           *
*******************************************************************************/
import { Path64, PathD, Paths64, PathsD } from './Core.js';
export declare const Minkowski: {
    sum(pattern: Path64, path: Path64, isClosed: boolean): Paths64;
    sumD(pattern: PathD, path: PathD, isClosed: boolean, decimalPlaces?: number): PathsD;
    diff(pattern: Path64, path: Path64, isClosed: boolean): Paths64;
    diffD(pattern: PathD, path: PathD, isClosed: boolean, decimalPlaces?: number): PathsD;
};
//# sourceMappingURL=Minkowski.d.ts.map