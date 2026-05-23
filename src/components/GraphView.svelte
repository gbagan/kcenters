<script lang="ts">
  import { type Edge, getCoordsOfEdge, type Graph, type Position } from '../lib/graph';
  import type { Mode } from '../types';

  function getPointerPosition(e: MouseEvent): Position {
    const el = e.currentTarget as Element
    const { left, top, width, height } = el.getBoundingClientRect();
    return { x: (e.clientX - left) / width, y: (e.clientY - top) / height };
  }

  type Props = {
    graph: Graph;
    mode: Mode;
    centers1: number[];
    centers2: number[];
    addVertex: (pos: Position) => void;
    moveVertex: (idx: number, pos: Position) => void;
    addEdge: (u: number, v: number) => void;
    removeVertex: (idx: number) => void;
    removeEdge: (edge: Edge) => void;
    chooseVertex: (idx: number) => void;
  }

  let { graph, mode, centers1, centers2,
        addVertex, moveVertex, addEdge, removeVertex,
        removeEdge, chooseVertex }: Props = $props();

  let pointerPosition = $state<Position | null>(null);
  let selectedVertex = $state<number | null>(null);

  function arrowPath(x1: number, y1: number, x2: number, y2: number) {
    const arrowSize = 6;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle2 = Math.acos(dx / len);
    const angle = dy >= 0 ? 2 * Math.PI - angle2 : angle2;
    x2 = x1 + dx * (len - 5) / len;
    y2 = y1 + dy * (len - 5) / len;
    const x3 = x2 + arrowSize * Math.sin(angle - Math.PI / 3);
    const y3 = y2 + arrowSize * Math.cos(angle - Math.PI / 3);
    const x4 = x2 + arrowSize * Math.sin(angle - 2 * Math.PI / 3);
    const y4 = y2 + arrowSize * Math.cos(angle - 2 * Math.PI / 3);
    return `M${x2} ${y2}L${x3} ${y3}L${x4} ${y4}z`;
  }


  function handleMove(ev: MouseEvent) {
    const pos = getPointerPosition(ev);
    const idx = selectedVertex;
    if (mode === "move" && idx !== null) {
      moveVertex(idx, pos);
    } else if (mode === "adde") {
      pointerPosition = pos;
    }
  }

  function handlePointerDown(idx: number, e: PointerEvent) {
    if (mode === "move" || mode === "adde") {
      if (e.currentTarget) {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      }
      selectedVertex = idx;
    }
  }

  function handlePointerUp(idx: number, ev: MouseEvent) {
    ev.stopPropagation();
    const idx2 = selectedVertex;
    if (mode === "adde" && idx2 !== null && idx2 !== idx) {
      addEdge(idx, idx2);
    }
    selectedVertex = null;
  }

  function handleNodeClick(idx: number, ev: MouseEvent) {
    ev.stopPropagation();
    if (mode === "delete") {
      removeVertex(idx);
    } else if (mode === "play1" || mode === "play2") {
      chooseVertex(idx);
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  viewBox="0 0 200 200"
  class={{deletemode: mode === "delete"}}
  onpointermove={handleMove}
  onpointerup={() => mode === "adde" && (selectedVertex = null)}
  onclick={e => mode === "addv" && addVertex(getPointerPosition(e))}
>
  <symbol id="phone" viewBox="0 0 24 24">
    <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14 6 4 4m-4-8a9 9 0 0 1 8 8m-3 11Q4 20 3 6V4q0 0 0 0l1-1h5v1l1 3v2H9l-1 1 6 6 1-1v-1h2l3 1h1v5l-1 1q0 0 0 0z"/>
  </symbol>
  {#each graph.edges as edge}
    {@const {x1, x2, y1, y2} = getCoordsOfEdge(graph, edge)}
    <line
      x1={200 * x1}
      x2={200 * x2}
      y1={200 * y1}
      y2={200 * y2}
      class="edge"
      onclick={() => mode === "delete" && removeEdge(edge)}
    />
  {/each}
  {#each graph.layout as {x, y}, i}
    {#if centers1.includes(i) && centers2.includes(i)}
      <path
        d="M 0 5 A 5 5 0 0 1 0 -5 Z"
        class="player1"
        style:transform="translate({200 * x}px, {200 * y}px)"
        onclick={e => handleNodeClick(i, e)}
      />
      <path
        d="M 0 -5 A 5 5 0 0 1 0 5 Z"
        class="player2"
        style:transform="translate({200 * x}px, {200 * y}px)"
        onclick={e => handleNodeClick(i, e)}
      />
    {:else}
      <circle
        cx={200 * x}
        cy={200 * y}
        r={mode === "move" && selectedVertex === i ? 6 : 5}
        class={centers1.includes(i) ? "player1" : centers2.includes(i) ? "player2" : "empty"}
        onpointerdown={e => handlePointerDown(i, e)}
        onpointerup={e => handlePointerUp(i, e)}
        onclick={e => handleNodeClick(i, e)}
      />
    {/if}
  {/each}
  {#if mode == "adde" && selectedVertex !== null && pointerPosition !== null}
    {@const selectedPosition = graph.layout[selectedVertex]}
    <line
      x1={200 * selectedPosition.x}
      y1={200 * selectedPosition.y}
      x2={200 * pointerPosition.x}
      y2={200 * pointerPosition.y}
      class="edge"
      pointer-events="none"
    />
  {/if}
</svg>

<style>
  .edge {
    stroke: var(--gray-300);
    stroke-width: 1;
  }

  .player1 {
    fill: var(--player1);
    stroke: black;
    stroke-width: 1;
  }

  .player2 {
    fill: var(--player2);
    stroke: black;
    stroke-width: 1;
  }

  .player1 {
    fill: var(--player1);
    stroke: black;
    stroke-width: 1;
  }

  .player2 {
    fill: var(--player2);
    stroke: black;
    stroke-width: 1;
  }

  .empty {
    fill: white;
    stroke: black;
    stroke-width: 1;
  }
</style>