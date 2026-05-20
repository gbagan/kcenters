<script lang="ts">
  import toast, {Toaster} from 'svelte-5-french-toast'
  import { type Mode } from "./types";
  import GraphView from "./components/GraphView.svelte";
  import { addEdge, addVertex, emptyGraph, graph1, initialGraphs, jsonToGraph, moveVertex, removeEdge, removeVertex } from "./lib/graph";
  import Config from "./components/Config.svelte";
  import Simulation from "./components/Simulation.svelte";

  let graphs = $state.raw(initialGraphs);

  let graphIndex = $state(0);
  let nbCenters = $state(1);
  let graph = $derived(graphs[graphIndex]);
  let mode = $state<Mode>("play1");
  let centers1 = $state.raw<number[]>([]);
  let centers2 = $state.raw<number[]>([]);
  let dialogContent = $state("");
  let importDialog!: HTMLDialogElement;

  function setNbCenters(nb: number) {
    nbCenters = nb;
    centers1 = [];
    centers2 = [];
  }

  function edit() {
    mode = "move";
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

  function setGraph(i: number) {
    graphIndex = i;
    centers1 = [];
    centers2 = [];
  }

  function saveGraph() {
    if (graphIndex < 5) return;
    const json = JSON.stringify(graph);
    window.localStorage.setItem(`kcenters-graph-${graphIndex}`, json);
    toast.success("Le graphe a été sauvegardé sur votre machine");
  }

  function importGraph() {
    const g = jsonToGraph(dialogContent);
    if (g === null) {
      toast.error("Le texte que vous avez entré ne représente pas un graphe valide");
    } else {
      graphs = graphs.with(graphIndex, g);
      centers1 = [];
      centers2 = [];
    }
    importDialog.close();
  }

  function openImportDialog() {
    navigator.clipboard
      .readText()
      .then((text) => dialogContent = text)
      .catch(() => dialogContent = "")
      .finally(() => importDialog.showModal())
  }


  function exportGraph() {
    navigator.clipboard.writeText(JSON.stringify(graph));
    toast.success("Le graphe a été copié dans le presse-papier");
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
          addVertex={pos => graphs = graphs.with(graphIndex, addVertex(graph, pos))}
          moveVertex={(idx, pos) => graphs = graphs.with(graphIndex, moveVertex(graph, idx, pos))}
          addEdge={(u, v) => graphs = graphs.with(graphIndex, addEdge(graph, u, v))}
          removeVertex={(idx) => graphs = graphs.with(graphIndex, removeVertex(graph, idx))}
          removeEdge={(edge) => graphs = graphs.with(graphIndex, removeEdge(graph, edge))}
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
          onclick={() => graphs = graphs.with(graphIndex, emptyGraph())}
        >
          Tout effacer
        </button>
        <button
          class="btn right"
          disabled={mode === "play1" || mode === "play2"}
          onclick={() => graphs = graphs.with(graphIndex, initialGraphs[graphIndex])}
        >
          Réinitialiser
        </button>
      </div>
    </div>
    <Config
      {mode}
      {nbCenters}
      canSimulate={centers1.length === nbCenters && centers2.length === nbCenters}
      {setNbCenters}
      {setGraph}
      {edit}
      play={i => i === 1? (mode = "play1") : (mode = "play2")}
      {simulate}
      {saveGraph}
      {openImportDialog}
      {exportGraph}
    />
  </div>
{/if}
<dialog bind:this={importDialog}>
  <div class="dialog-title">Importer un graphe</div>
  <div class="dialog-body" >
    <textarea
      class="textarea"
      cols="100"
      rows="20"
      bind:value={dialogContent}
    ></textarea>
  </div>
  <div class="dialog-buttons">
    <button class="btn rounded-lg" onclick={() => importDialog.close()}>Annuler</button>
    <button class="btn rounded-lg" autofocus onclick={importGraph}>OK</button>
  </div>
</dialog>
<Toaster />

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

  dialog {
    border: none;
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  dialog::backdrop {
    background-color: rgb(107 114 128 / 0.7);
  }

  .dialog-title {
    margin: 0;
    padding: 1rem;
    min-height: 2rem;
    border-bottom: 2px solid var(--gray-200);
    font-size: 2.25rem;
    font-weight: 500;
  }

  .dialog-body {
    margin: 0;
    padding: 1.5rem;
    border-bottom: 2px solid var(--gray-200);
  }

  .dialog-buttons {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  textarea {
    display: block;
    padding: 0.625rem;
    width: 100%;
    font-size: 0.875rem;
    color: var(--gray-900);
    background-color: var(--gray-50);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }

  textarea:focus {
    outline: 1px solid var(--blue-500);
    border-color: var(--blue-500);
  }
</style>