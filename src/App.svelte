<script>
  import Nbar from "./components/Navbar.svelte";
  import Ddown from "./Dropdown.svelte";
  import { newton } from "./core/funcSolvers";
  import { fade } from "svelte/transition";

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
</style>

<main>
  <Nbar />
  <Ddown />
</main>
