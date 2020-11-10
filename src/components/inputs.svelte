<script>
  import { inputHandler } from "../core/IOHandler";
  export let state;

  let func,
    tol = "10e-6",
    nmax = 500,
    init,
    fin,
    matA,
    matB;

  const matrixParser = (str) => {
    return JSON.parse(str);
  };

  $: inputs = {
    state: state,
    func: func,
    tol: Number(tol),
    nmax: Number(nmax),
    init: +init,
    final: +fin,
    matA: matrixParser(matA || [1]),
    matB: matrixParser(matB || [1]),
  };

  import { slide, fade } from "svelte/transition";
</script>

<style type="text/scss">
  .input-wrapper {
    position: relative;
    margin: 10px;
    display: inline-block;
    font-size: 12px;
    label {
      color: #bbb;
      font-weight: 300;
      padding: 1px;
      position: absolute;
      z-index: 2;
      left: 20px;
      top: 14px;
      padding: 0 2px;
      pointer-events: none;
      border-radius: 8px;
      background: #3c1874;
      transition: transform 0.2s ease;
      transform: translateY(-20px);
    }
    input {
      outline: none;
      border: 1px solid #bbb;
      padding: 10px 20px;
      border-radius: 10px;
      &::placeholder {
        color: transparent;
      }
      &:invalid {
        + {
          label {
            background: transparent;
            transform: translateY(0);
          }
        }
      }
      &:disabled {
        background: #8888;
        + {
          label {
            background: transparent;
            color: #fff;
            transform: translateY(0);
          }
        }
      }
      &:focus {
        border-color: #3c1874;
        + {
          label {
            background: #3c1874;
            color: #fff;
            transform: translateY(-20px);
          }
        }
        &::placeholder {
          color: #8888;
        }
      }
    }
  }
  .calculate {
    padding: 0.5em 1.5em;
    input[type="submit"] {
      width: 100%;
      font-size: 1.1rem;
      padding: 0.66em;
      background: #3c1874bb;
      color: #eee;
      outline: none;
      border: 0;
      border-radius: 15px;
      transition: all 0.3s ease;
      &:hover {
        cursor: pointer;
        color: #fff;
        background: #3c1874;
      }
    }
  }
</style>

<form on:submit|preventDefault={inputHandler(inputs)}>
  {#if state.set == 'eqns'}
    <div transition:slide style="overflow:hidden;padding:1em;">
      <div class="input-wrapper" style="width:100%">
        <input
          bind:value={func}
          style="width:calc(100% - 2em - 40px)"
          name="function"
          placeholder="Ex. sin(x) - (cos(x))^2 - 3"
          required />
        <label for="function">FUNCTION</label>
      </div>
      <div class="input-wrapper" style="width:calc(50% - 2em)">
        <input
          bind:value={tol}
          name="tol"
          style="width:calc(100% - 40px)"
          placeholder="Ex. 10e-6"
          required />
        <label for="tol">TOLLERANCE</label>
      </div>
      <div class="input-wrapper" style="width:calc(50% - 2em)">
        <input
          bind:value={nmax}
          name="nmax"
          max="5000"
          style="width:calc(100% - 40px)"
          placeholder="Ex. 1000"
          required />
        <label for="nmax">MAX ITRnS</label>
      </div>
      <div class="input-wrapper" style="width:calc(50% - 2em)">
        <input
          bind:value={init}
          style="width:calc(100% - 40px)"
          name="to"
          placeholder="Ex. -1.55"
          required />
        <label for="from">INITAL PT</label>
      </div>
      <div class="input-wrapper" style="width:calc(50% - 2em)">
        <input
          bind:value={fin}
          disabled={state.method == 'Newton-Raphson'}
          style="width:calc(100% - 40px)"
          name="to"
          placeholder="Ex. 3.3355"
          required />
        <label for="to">FINAL PT</label>
      </div>
    </div>
  {:else}
    <div transition:slide style="overflow:hidden;padding:1em;">
      <div class="input-wrapper" style="width:calc(50% - 2em)">
        <input
          bind:value={matA}
          name="matA"
          style="width:calc(100% - 40px)"
          placeholder="Ex. [[1,2,3],[4,0,2],[6,2,5]]"
          required />
        <label for="matA">MATRIX {state.method == 'Multiply' ? 'A' : ''}</label>
      </div>
      {#if state.method == 'Multiply'}
        <div
          transition:fade
          class="input-wrapper"
          style="width:calc(50% - 2em)">
          <input
            bind:value={matB}
            name="matB"
            style="width:calc(100% - 40px)"
            placeholder="Ex. [[0,5,2],[9,7,2],[0,5.44,0]]"
            required />
          <label for="matB">MATRIX B</label>
        </div>
      {/if}
    </div>
  {/if}
  <div class="calculate"><input type="submit" value="Calculate" /></div>
</form>
