<script>
  export let fnHandler, state;
</script>

<style type="text/scss">
  table {
    font-size: 1.25em;
    width: 100%;
    table-layout: fixed;
    tr {
      padding: 0;
      margin: 0;
    }
    th {
      div {
        padding: 10px;
        font-weight: 200;
        color: #fff;
        background: #de354c;
        border-radius: 10px;
      }
    }
    td,
    th {
      padding: 10px;
      display: table-cell;
      button {
        color: #3c1874;
        font-size: 1.25em;
        width: 100%;
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
    }
    .active {
      background: #3c1874;
      color: #eee;
    }
  }
  @media (max-width: 600px) {
    table {
      font-size: 1em;
      table-layout: fixed;
      th {
        div {
          padding: 5px;
        }
      }
      td,
      th {
        padding: 5px;
        button {
          font-size: 1em;
        }
      }
    }
  }
</style>

<table on:click={fnHandler} cellpadding="0" cellspacing="0">
  <tr id="eqns">
    <th>
      <div>Linear Eq<sup>n</sup>s</div>
    </th>
    {#each ['Bisection', 'Secant', 'Regula-Falsi', 'Newton-Raphson'] as mth}
      <td>
        <button class={state.method == mth ? 'active' : ''}>{mth}</button>
      </td>
    {/each}
  </tr>
  <tr id="matrix">
    <th>
      <div>Matrices</div>
    </th>
    {#each ['Multiply', 'Inverse', 'LU-Dolittle', 'LU-Crout'] as mth}
      <td>
        <button class={state.method == mth ? 'active' : ''}>{mth}</button>
      </td>
    {/each}
  </tr>
</table>
