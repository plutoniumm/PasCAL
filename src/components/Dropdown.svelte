<script>
  const fnHandler = (e) => {
    console.log(e.target.innerText);
  };
</script>

<style type="text/scss">
  table {
    width: 100%;
    td,
    th {
      padding: 0.25em;
    }
  }
</style>

<table on:click={fnHandler}>
  <tr>
    <th>Linear Eq<sup>n</sup>s</th>
    <td><button>Bisection</button></td>
    <td><button>Secant Method</button></td>
    <td><button>Regula Falsi</button></td>
    <td><button>Newton-Raphson</button></td>
  </tr>
  <tr>
    <th>Matrices</th>
    <td><button>Multiply</button></td>
    <td><button>Inverse</button></td>
    <td><button>LU Dolittle</button></td>
    <td><button>LU Crout</button></td>
  </tr>
</table>
