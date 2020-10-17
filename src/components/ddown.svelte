<script>
  export let fnHandler;
</script>

<style type="text/scss">
  table {
    font-size: 1.25em;
    width: 100%;
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
      button {
        color: #3c1874;
        font-size: 1.25em;
        width: 100%;
        background: #ddd;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.3s ease;
        &:hover {
          background: #3c1874;
          color: #ddd;
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
    <td><button>Bisection</button></td>
    <td><button>Secant</button></td>
    <td><button>Regula Falsi</button></td>
    <td><button>Newton-Raphson</button></td>
  </tr>
  <tr id="matrix">
    <th>
      <div>Matrices</div>
    </th>
    <td><button>Multiply</button></td>
    <td><button>Inverse</button></td>
    <td><button>LU Dolittle</button></td>
    <td><button>LU Crout</button></td>
  </tr>
</table>
