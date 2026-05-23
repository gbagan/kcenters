<script lang="ts">
  import type { Mode } from "../types";

  type Props = {
    mode: Mode;
    nbCenters: number;
    canSimulate: boolean;
    setGraph: (idx: number) => void;
    setNbCenters: (nb: number) => void;
    edit: () => void;
    play: (i: 1 | 2) => void;
    simulate: () => void;
    saveGraph: () => void;
    openImportDialog:  () => void;
    exportGraph: () => void;
  }

  let { mode, nbCenters, canSimulate, 
    setGraph, setNbCenters, edit, play, simulate, saveGraph, 
    openImportDialog, exportGraph }: Props = $props();
</script>

<div class="container">
  <h2>Graphe</h2>
  <select class="select"
    value="0"
    onchange={e => setGraph(Number(e.currentTarget.value))}
  >
    <option value="0">Cygne</option>
    <option value="1">Confluence</option>
    <option value="2">Lapin</option>
    <option value="3">Poisson</option>
    <option value="4">Grille</option>
    <option value="5">Graphe personnalisé 1</option>
    <option value="6">Graphe personnalisé 2</option>
    <option value="7">Graphe personnalisé 3</option>
  </select>
  <div class="btngroup">
    <button class="btn left" onclick={saveGraph}>Sauvegarder</button>
    <button class="btn" onclick={openImportDialog}>Importer</button>
    <button class="btn right" onclick={exportGraph}>Exporter</button>
  </div>
  <h2>Nombre de centres</h2>
  <select class="select"
    value={""+nbCenters}
    onchange={e => setNbCenters(Number(e.currentTarget.value))}
  >
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
  </select>

  <h2>Actions</h2>
  <div class="btngroup">
    <button
      class={["btn left", { active: mode !== "play1" && mode !== "play2"}]}
      onclick={edit}
    >
      <span class="check">✓</span> Editer
    </button>
    <button
      class={["btn", { active: mode === "play1" }]}
      onclick={() => play(1)}
    >
      <span class="check">✓</span> Joueur 1
    </button>
    <button
      class={["btn", { active: mode === "play2" }]}
      onclick={() => play(2)}
    >
      <span class="check">✓</span> Joueur 2
    </button>
    <button class="btn right" disabled={!canSimulate} onclick={simulate}>Simuler</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }

  h2 {
    margin-bottom: 0.5rem;
    margin-top: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-900);
  }
</style>