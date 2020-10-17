<script>
  import Nbar from "./components/nav.svelte";
  import Ddown from "./components/ddown.svelte";
  import Inputs from "./components/inputs.svelte";

  const fnHandler = (e) => {
    console.log(e.target.innerText);
  };
</script>

<style>
  main {
    width: 100%;
    height: 100%;
  }
</style>

<main>
  <Nbar />
  <Ddown {fnHandler} />
  <Inputs />
</main>
