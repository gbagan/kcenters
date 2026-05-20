import { arrayOf, sleep } from "@gbagan/utils";
import type { Graph } from "./graph";

export class Sim {
  #graph: Graph;
  #centers: number[];
  phase = $state(0);
  labels: number[] = $state.raw([]);
  phones: number[] = $state.raw([]);
  arcs: [number, number][] = $state.raw([]);

  constructor(graph: Graph, centers: number[]) {
    this.#graph = graph;
    this.#centers = centers;
    const labels = arrayOf(graph.layout.length, -1);
    for (const c of centers) {
      labels[c] = 0;
    };
    this.labels = labels;
  }

  reset() {
    const labels = arrayOf(this.#graph.layout.length, -1);
    for (const c of this.#centers) {
      labels[c] = 0;
    };
    this.labels = labels;
    this.phase = 0;
    this.phones = [];
    this.arcs = [];
  }

  async simulate() {    
    this.reset();
    await sleep(50);
    let iter = 0;
    while (true) {
      iter++;
      const newArcs = this.#propagate();
      if (newArcs.length === 0) break;
      this.phase = iter;
      this.phones = newArcs.map(([v, _]) => v);
      await sleep(50);
      this.phones = newArcs.map(([_, v]) => v);
      await sleep(1000);
      this.phones = [];
      const labels2 = [...this.labels];
      for (const [_, v] of newArcs) {
        labels2[v] = iter;
      }
      this.labels = labels2;
      this.arcs = this.arcs.concat(newArcs);
      await sleep(500);
    }
  }


  #propagate(): [number, number][] {
    const arcs: [number, number][] = [];
    for (const [u, v] of this.#graph.edges) {
      if (this.labels[u] !== -1 && this.labels[v] === -1) {
        arcs.push([u, v]);
      } else if (this.labels[v] !== -1 && this.labels[u] === -1) {
        arcs.push([v, u]);
      }
    }
    return arcs;
  }
}