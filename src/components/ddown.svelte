<script>
  export let fnHandler, state;
</script>

<style type="text/scss">
  button {
    color: #3c1874;
    font-size: 1.25em;
    width: 100%;
    margin: 0 5px;
    background: #eee;
    border: 1px solid transparent;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s ease;
    &:hover {
      border: 1px solid #3c1874;
    }
    &:active {
      background: #ddd;
    }
  }
  .active {
    background: #3c1874;
    color: #eee;
  }
  .th {
    font-weight: 200;
    color: #fff;
    background: #de354c;
    flex: 1;
    margin: 10px 5px;
    text-align: center;
  }
  .td {
    flex: 4;
    display: flex;
  }
  .tr {
    width: 100%;
    display: flex;
  }
  .th,
  .td {
    padding: 10px;
    border-radius: 10px;
  }
  @media (max-width: 600px) {
    .tr {
      width: 100%;
      display: flex;
    }
    .th,
    button {
      margin: 2px;
      width: 100px;
    }
    .th {
      margin: 12px 0;
      flex: 1;
    }
    .td {
      flex: 2;
      flex-wrap: wrap;
    }
  }
</style>

<section style="width:100%;text-align:center;">
  <div class="tr" id="eqns" on:click={fnHandler}>
    <div class="th">Equations</div>
    <div class="td">
      {#each ['Bisection', 'Secant', 'Regula-Falsi', 'Newton-Raphson'] as mth}
        <button class={state.method == mth ? 'active' : ''}>{mth}</button>
      {/each}
    </div>
  </div>
  <div class="tr" id="matrix" on:click={fnHandler}>
    <div class="th">Matrices</div>
    <div class="td">
      {#each ['Multiply', 'Inverse', 'LU-Dolittle', 'LU-Crout'] as mth}
        <button class={state.method == mth ? 'active' : ''}>{mth}</button>
      {/each}
    </div>
  </div>
</section>
