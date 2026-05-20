<script lang="ts">
  import { type Graph } from "../lib/graph";
  import GraphSim from "./GraphSim.svelte";
  import { Sim } from "../lib/simulation.svelte";

  type Props = {
    graph: Graph;
    centers1: number[];
    centers2: number[];
    leave: () => void;
  };

  let {graph, centers1, centers2, leave}: Props = $props();

  let sim1 = $derived(new Sim(graph, centers1));
  let sim2 = $derived(new Sim(graph, centers2));

  function simulate() {
    sim1.simulate();
    sim2.simulate();
  }

</script>

<div class="container">
  <div>
    <span class="phase">Phase {sim1.phase}</span>
    <div class="graph-container">
      <GraphSim
        {graph}
        player={1}
        labels={sim1.labels}
        arcs={sim1.arcs}
        phones={sim1.phones}
      />
    </div>
  </div>
  <div>
    <span class="phase">Phase {sim2.phase}</span>
    <div class="graph-container">
      <GraphSim
        {graph}
        player={2}
        labels={sim2.labels}
        arcs={sim2.arcs}
        phones={sim2.phones}
      />
    </div>
  </div>
</div>
<button class="btn left" onclick={simulate}>Lancer</button>
<button class="btn right" onclick={leave}>Quitter</button>

<style>
  .container {
    display: flex;
    justify-content: space-around;
  }

  .graph-container {
    width: 40rem;
    height: 40rem;
    border: solid 1px var(--border);
  }

  .phase {
    font-size: 1.5em;
    font-weight: bold;
    margin-right: 1em;
    color: var(--blue-500);
  }
</style>