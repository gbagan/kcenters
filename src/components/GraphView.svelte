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
    labels: number[];
    phones: number[];
    arcs: [number, number][];
    addVertex: (pos: Position) => void;
    moveVertex: (idx: number, pos: Position) => void;
    addEdge: (u: number, v: number) => void;
    removeVertex: (idx: number) => void;
    removeEdge: (edge: Edge) => void;
    chooseVertex: (idx: number) => void;
  }

  let { graph, mode, labels, phones, arcs,
        addVertex, moveVertex, addEdge, removeVertex,
        removeEdge, chooseVertex }: Props = $props();

  let pointerPosition = $state<Position | null>(null);
  let selectedVertex = $state<number | null>(null);

  function arrowPath(x1: number, y1: number, x2: number, y2: number) {
    const arrowSize = 10;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle2 = Math.acos(dx / len);
    const angle = dy >= 0 ? 2 * Math.PI - angle2 : angle2;
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
    } else if (mode === "play") {
      chooseVertex(idx);
    }
  }

  $inspect(labels);

</script>

<div class="graph-container">
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
    {#each arcs as [u, v]}
      {@const {x1, x2, y1, y2} = getCoordsOfEdge(graph, [u, v])}
      <line
        x1={200 * x1}
        x2={200 * x2}
        y1={200 * y1}
        y2={200 * y2}
        stroke-width="1.5"
        stroke="blue"
        pointer-events="none"
      />
      <path
        d={arrowPath(200 * x1, 200 * y1, 200 * x2, 200 * y2)}
        fill="blue"
        pointer-events="none"
      />
    {/each}
    {#each graph.layout as {x, y}, i}
      <circle
        cx={200 * x}
        cy={200 * y}
        r={mode === "move" && selectedVertex === i ? 6 : 5}
        stroke="black"
        fill={labels[i] === 0 ? "lightblue" : labels[i] === -1 ? "white" : "lightgreen"}
        stroke-width="1"
        onpointerdown={e => handlePointerDown(i, e)}
        onpointerup={e => handlePointerUp(i, e)}
        onclick={e => handleNodeClick(i, e)}
      />
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
    {#each phones as i}
      {@const {x, y} = graph.layout[i]}
      <use 
        href="#phone"
        class="phone"
        x="-3"
        y="-3"
        width="6"
        height="6"
        style:transform="translate({200 * x}px, {200 * y}px)"
      />
    {/each}
  </svg>
</div>

<style>
  .graph-container {
    width: 40rem;
    touch-action: none;
    border: 1px solid var(--border);
  }

  .edge {
    stroke: var(--gray-300);
    stroke-width: 1;
  }

  .phone {
    transition: transform linear 1s;
  }
</style>