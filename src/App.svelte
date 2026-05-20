<script lang="ts">
  import { arrayOf, sleep } from "@gbagan/utils";
  import { type Mode } from "./types";
  import GraphView from "./components/GraphView.svelte";
  import { addEdge, addVertex, emptyGraph, graph1, moveVertex, removeEdge, removeVertex } from "./lib/graph";
  import Config from "./components/Config.svelte";
  import Simulation from "./components/Simulation.svelte";

  let graphIndex = $state(0);
  let nbCenters = $state(1);
  let graph = $state.raw(graph1);
  let mode = $state<Mode>("play1");
  let centers1 = $state.raw<number[]>([]);
  let centers2 = $state.raw<number[]>([]);

  function setNbCenters(nb: number) {
    nbCenters = nb;
    centers1 = [];
    centers2 = [];
  }

  function edit() {
    mode = "addv";
    centers1 = [];
    centers2 = [];
  }

  function chooseVertex(i: number) {
    if (mode === "play1") {
      centers1 = centers1.includes(i) ? centers1.filter(c => c !== i) : [...centers1, i];
    } else if (mode === "play2") {
      centers2 = centers2.includes(i) ? centers2.filter(c => c !== i) : [...centers2, i];
    }
  }

  function simulate() {
    mode = "sim";
  }

  function simLeave() {
    mode = "play1";
  }
</script>

{#if mode === "sim"}
  <Simulation {graph} {centers1} {centers2} leave={simLeave} />
{:else}
  <div class="container">
    <div class="main-container">
      <div class="graph-container">
        <GraphView 
          {graph}
          {mode}
          {centers1}
          {centers2}
          addVertex={pos => graph = addVertex(graph, pos)}
          moveVertex={(idx, pos) => graph = moveVertex(graph, idx, pos)}
          addEdge={(u, v) => graph = addEdge(graph, u, v)}
          removeVertex={(idx) => graph = removeVertex(graph, idx)}
          removeEdge={(edge) => graph = removeEdge(graph, edge)}
          {chooseVertex}
        />
      </div>
      <div class="btngroup">
        <button
          class={["btn left", { active: mode === "move" }]}
          disabled={mode === "play1" || mode === "play2"}
          onclick={() => mode = "move"}
        >
          <span class="check">✓</span> Déplacer
        </button>
        <button
          class={["btn", { active: mode === "addv" }]}
          disabled={mode === "play1" || mode === "play2"}
          onclick={() => mode = "addv"}
        >
          <span class="check">✓</span> Ajouter sommet
        </button>
        <button
          class={["btn", { active: mode === "adde" }]}
          disabled={mode === "play1" || mode === "play2"}
          onclick={() => mode = "adde"}
        >
          <span class="check">✓</span> Ajouter arête
        </button>
        <button
          class={["btn", { active: mode === "delete" }]}
          disabled={mode === "play1" || mode === "play2"}
          onclick={() => mode = "delete"}
        >
          <span class="check">✓</span> Retirer
        </button>
        <button
          class="btn right"
          disabled={mode === "play1" || mode === "play2"}
          onclick={() => graph = emptyGraph()}
        >
           Tout effacer
        </button>
      </div>
    </div>
    <Config
      {mode}
      {nbCenters}
      canSimulate={centers1.length === nbCenters && centers2.length === nbCenters}
      {setNbCenters}
      setGraph={i => {}}
      edit={edit}
      play={i => i === 1? (mode = "play1") : (mode = "play2")}
      simulate={simulate}
      saveGraph={() => {}}
      openImportDialog={() => {}}
      exportGraph={() => {}}
    />
  </div>
{/if}

<style>
  .container {
    display: flex;
    justify-content: space-around;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .graph-container {
    width: 40rem;
    touch-action: none;
    border: 1px solid var(--border);
  }
</style>