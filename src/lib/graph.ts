import { times } from "@gbagan/utils";

export type Edge = [number, number];

export type Position = {
  x: number;
  y: number;
}

// une structure Graph est composé d'une liste des arêtes et de la position de chaque sommet dans le plan
export type Graph = {
  layout: Position[],
  edges: Edge[],
}

export type AdjGraph = number[][]

export const nbVertices = (graph: Graph) => graph.layout.length;

export const getCoords = (graph: Graph, u: number) => graph.layout[u];

export const getCoordsOfEdge = (graph: Graph, [u, v]: Edge) => {
  const { x: x1, y: y1 } = getCoords(graph, u);
  const { x: x2, y: y2 } = getCoords(graph, v);
  return { x1, x2, y1, y2 };
};

export const addVertex = (graph: Graph, pos: Position): Graph => ({
  ...graph,
  layout: [...graph.layout, pos]
});

export const moveVertex = (graph: Graph, idx: number, pos: Position): Graph => ({
  ...graph,
  layout: graph.layout.with(idx, pos)
});

export function removeVertex(graph: Graph, v: number): Graph {
  const layout = graph.layout.toSpliced(v, 1);
  const edges: Edge[] = [];
  const m = graph.edges.length;
  for (let i = 0; i < m; i++) {
    const [u1, u2] = graph.edges[i];
    if (u1 !== v && u2 !== v) {
      edges.push([u1 > v ? u1 - 1 : u1, u2 > v ? u2 - 1 : u2]);
    }
  }
  return { layout, edges };
}


export function removeEdge(graph: Graph, [u, v]: Edge): Graph {
  const edges = graph.edges.filter(([u1, v1]) => !(u === u1 && v === v1 || u === v1 && v === u1));
  return { ...graph, edges };
}

export function addEdge(graph: Graph, u: number, v: number): Graph {
  if (graph.edges.some(([u1, v1]) => u == u1 && v == v1 || u == v1 && v == u1)) {
    return graph;
  } else {
    return {...graph, edges: [...graph.edges, [u, v]] }
  }
}

export function toAdjGraph(graph: Graph) {
  const adjgraph: AdjGraph = times(graph.layout.length, () => []);
  for (const [u, v] of graph.edges) {
    adjgraph[u].push(v);
    adjgraph[v].push(u);
  }
  return adjgraph;
}

export function jsonToGraph (json: string): Graph | null {
  function isEdge(x: any, n: number) {
    return Array.isArray(x) &&
      x.length == 2 &&
      typeof x[0] === "number" &&
      typeof x[1] === "number" &&
      x[0] >= 0 && x[1] >= 0 && x[0] < n && x[1] < n
  }
  
  function isPosition(obj: any) {
    return obj !== null &&
      typeof obj === "object" &&
      typeof obj.x === "number" &&
      obj.x >= 0 && obj.x < 1 &&
      typeof obj.y === "number" &&
      obj.y >= 0 && obj.y < 1;
  }
  
  function isValidGraph(obj: any) {
    if (obj === null || typeof obj !== "object" || !Array.isArray(obj.layout) || !obj.layout.every(isPosition)) {
      return false
    }
    const n = obj.layout.length;
    return Array.isArray(obj.edges) && obj.edges.every((e: any) => isEdge(e, n));
  }

  try {
    const obj = JSON.parse(json);
    return isValidGraph(obj) ? obj as Graph : null
  } catch {
    return null;
  }
}

export const emptyGraph = () => ({ layout: [], edges: [] }) as Graph;

export const graph1: Graph = {
  layout: [
    {y: 0.08142857142857143, x: 0.18050000871930805},
    {y: 0.23285714285714285, x: 0.07621429443359375},
    {y: 0.23714285714285716, x: 0.2876428658621652},
    {y: 0.4757142857142857, x: 0.2676428658621652},
    {y: 0.6242857142857143, x: 0.08621429443359375},
    {y: 0.79, x:0.08478572300502232},
    {y: 0.9514285714285714, x: 0.28192858014787947},
    {y: 0.9557142857142857, x: 0.680500008719308},
    {y: 0.5057142857142857, x: 0.9276428658621652},
    {y: 0.6942857142857143, x: 0.5047857230050223},
    {y: 0.7, x: 0.2776428658621652},
    {y: 0.4928571428571429, x: 0.49764286586216516},
    {y: 0.20285714285714285, x: 0.5019285801478794},
    {y: 0.7071428571428572, x:0.6833571515764509},
  ],
  edges: [[1,0], [2,1], [3,2], [4,3], [5,4], [6,5], [7,6], [8,7], [9,8], [10,9], [11,10], [3,11], [12,11], [12,0], [13,9], [7,13], [10,5]]
}