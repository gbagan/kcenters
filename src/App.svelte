<script lang="ts">
  import { arrayOf, sleep } from "@gbagan/utils";
  import GraphView from "./components/GraphView.svelte";
  import { addEdge, addVertex, emptyGraph, graph1, moveVertex, removeEdge, removeVertex } from "./lib/graph";
  import { type Mode } from "./types";

  let graph = $state.raw(graph1);
  let phase = $state(0);
  let mode = $state<Mode>("addv");
  let centers = $state.raw<number[]>([]);
  let phones = $state.raw<number[]>([]);
  let arcs = $state.raw<[number, number][]>([]);

  let labels = $derived.by(() => {
    const res = arrayOf(graph.layout.length, -1);
    for (const c of centers) {
      res[c] = 0;
    }
    return res;
  });

  function propagate(): [number, number][] {
    const arcs: [number, number][] = [];
    for (const [u, v] of graph.edges) {
      if (labels[u] !== -1 && labels[v] === -1) {
        arcs.push([u, v]);
      } else if (labels[v] !== -1 && labels[u] === -1) {
        arcs.push([v, u]);
      }
    }
    return arcs;
  }

  function edit() {
    mode = "addv";
    centers = [];
    phones = [];
    arcs = [];
    phase = 0;
    labels = arrayOf(graph.layout.length, -1);
  }

  async function simulate() {
    let iter = 0;
    while (true) {
      iter++;
      const newArcs = propagate();
      if (newArcs.length === 0) break;
      phase = iter;
      phones = newArcs.map(([v, _]) => v);
      await sleep(50);
      phones = newArcs.map(([_, v]) => v);
      await sleep(1000);
      phones = [];
      const labels2 = [...labels];
      for (const [_, v] of newArcs) {
        labels2[v] = iter;
      }
      labels = labels2;
      arcs = arcs.concat(newArcs);
      await sleep(500);
    }
  }

</script>

<div class="container">
  <div class="graph-container">
    <span class="phase">Phase {phase}</span>
    <GraphView 
      {graph}
      {mode}
      {labels}
      {arcs}
      {phones}
      addVertex={(pos) => graph = addVertex(graph, pos)}
      moveVertex={(idx, pos) => graph = moveVertex(graph, idx, pos)}
      addEdge={(u, v) => graph = addEdge(graph, u, v)}
      removeVertex={(idx) => graph = removeVertex(graph, idx)}
      removeEdge={(edge) => graph = removeEdge(graph, edge)}
      chooseVertex={i => centers = centers.includes(i) ? centers.filter(c => c !== i) : [...centers, i]}
    />
    <div class="btngroup">
      <button class="ui-button" disabled={mode === "play"} onclick={() => mode = "move"}>Déplacer</button>
      <button class="ui-button" disabled={mode === "play"} onclick={() => mode = "addv"}>Ajouter sommet</button>
      <button class="ui-button" disabled={mode === "play"} onclick={() => mode = "adde"}>Ajouter arête</button>
      <button class="ui-button" disabled={mode === "play"} onclick={() => mode = "delete"}>Retirer</button>
      <button class="ui-button" disabled={mode === "play"} onclick={() => graph = emptyGraph()}>Tout effacer</button>
    </div>
  </div>
  <div>
    <button class="ui-button" onclick={edit}>Editer</button>
    <button class="ui-button" onclick={() => mode = "play"}>Jouer</button>
    <button class="ui-button" onclick={simulate}>Simuler</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: space-around;
  }

  .graph-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .phase {
    font-size: 1.5em;
    font-weight: bold;
    margin-right: 1em;
    color: var(--blue-500);
  }

  .btngroup {
    display: inline-flex;
  }
</style>