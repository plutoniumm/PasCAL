<script>
  import Nbar from "./components/nav.svelte";
  import Output from "./components/out.svelte";
  import Ddown from "./components/ddown.svelte";
  import Inputs from "./components/inputs.svelte";
  import Footer from "./components/foot.svelte";

  $: state = { set: "eqns", method: "Bisection" };
  const fnHandler = (e) => {
    state.method = e.target.innerText;
    state.set = e.target.parentElement.parentElement.id;
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
  <Ddown {state} {fnHandler} />
  <Inputs {state} />
  <Output />
  TODO: Add Link to DOCS
  <Footer />
</main>
