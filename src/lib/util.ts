import { times } from "@gbagan/utils";

export const tabulate2 = <A>(n: number,  m: number, f: (i: number, j: number) => A) => 
  times(n * m, i => f(i / m | 0, i % m));