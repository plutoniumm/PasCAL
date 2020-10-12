<script>
  import Nbar from "./Navbar.svelte";
  import Ddown from "./Dropdown.svelte";
  import { fade } from "svelte/transition";

  let name = "Pascal",
    answer = "Answer is";
  var func = "",
    range = "0,pi",
    tol = ".01",
    NMAX = 100;
  $: lLim = eval(range.split(",")[0].replace("pi", "Math.PI"));
  $: uLim = eval(range.split(",")[1].replace("pi", "Math.PI"));

  function exporter(c, fn, tol, n) {
    answer = `The root is ${c} at ${fn} within ${tol} taking ${n} iterations`;
  }

  function inputProcessor() {
    let method = document.querySelector("input[name = method]:checked").value;

    switch (method) {
      case "bisect":
        bisector(func, lLim, uLim, tol, NMAX);
        break;
    }
  }
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    font-weight: 100;
    margin: 0 auto;
  }

  .gFunc {
    border: 1px solid rgba(0, 0, 0, 0.33);
    padding: 0.5em;
    border-radius: 0.25em;
    width: 20em;
    outline: none;
  }

  button {
    border: 1px solid rgba(0, 0, 0, 0.33);
    border-radius: 0.25em;
    padding: 0.5em;
    outline: none;
    text-transform: uppercase;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <Nbar />
  <Ddown />
  <div id="calculator">
    <input
      type="text"
      class="gFunc"
      bind:value={func}
      placeholder="Enter Function Ex. sin(x)" />

    <br />
    <input
      id="range"
      type="text"
      class="gFunc"
      bind:value={range}
      placeholder="Enter Range Ex. 2,3" />
    <input
      type="text"
      class="gFunc"
      bind:value={tol}
      placeholder="Enter Tolerance Ex. 10e-2" />
    {#if func}
      <p>{func} from {lLim} to {uLim} within {tol}</p>
    {:else}
      <p transition:fade>Add a function!</p>
    {/if}
    <button on:click={inputProcessor}>Go!</button>
  </div>
  <div id="answer">{answer}</div>
</main>
