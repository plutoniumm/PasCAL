const math = require( 'mathjs' )

// const matrix = math.matrix( matrixI ); (THIS MAKES MATRIX)
// const matrix = math.multiply( matrixA, matrixB ); (THIS MULTIPLIES)
// const matrix1 = math.divide( matrixA, matrixI ); (THIS CALCULATES INVERSE)

const crout = ( A ) => {
      let i, j, k, U = [ [], [], [] ], L = [ [], [], [] ];
      const n = A.length;
      var sum = 0;
      for ( i = 0;i < n;i++ ) {
            for ( j = 0;j < n;j++ ) { U[ i ][ j ] = 0; L[ i ][ j ] = 0; }
            U[ i ][ i ] = 1;
      }
      for ( j = 0;j < n;j++ ) {
            for ( i = j;i < n;i++ ) {
                  sum = 0;
                  for ( k = 0;k < j;k++ ) { sum += L[ i ][ k ] * U[ k ][ j ]; }
                  L[ i ][ j ] = A[ i ][ j ] - sum;
            }
            for ( i = j;i < n;i++ ) {
                  sum = 0;
                  for ( k = 0;k < j;k++ ) { sum += L[ j ][ k ] * U[ k ][ i ]; }
                  U[ j ][ i ] = ( A[ j ][ i ] - sum ) / L[ j ][ j ];
            }
      }
      return { lower: L, upper: U }
}

const dolittle = ( A ) => {
      let i, j, k, U = [ [], [], [] ], L = [ [], [], [] ];
      const n = A.length;
      var sum = 0;
      for ( i = 0;i < n;i++ ) {
            for ( j = 0;j < n;j++ ) { U[ i ][ j ] = 0; L[ i ][ j ] = 0; }
            L[ i ][ i ] = 1;
      }
      for ( i = 0;i < n;i++ ) {
            for ( k = i;k < n;k++ ) {
                  sum = 0;
                  for ( j = 0;j < i;j++ )
                        sum += ( L[ i ][ j ] * U[ j ][ k ] );
                  U[ i ][ k ] = A[ i ][ k ] - sum;
            }
            for ( k = i;k < n;k++ ) {
                  if ( i == k )
                        L[ i ][ i ] = 1;
                  else {
                        sum = 0;
                        for ( j = 0;j < i;j++ )
                              sum += ( L[ k ][ j ] * U[ j ][ i ] );
                        L[ k ][ i ] = ( A[ k ][ i ] - sum ) / U[ i ][ i ];
                  }
            }
      }
      return { lower: L, upper: U }
}

const A = [
      [ 1, 1, 2 ],
      [ -1, 0, 2 ],
      [ 3, 2, -1 ]

]

console.log( dolittle( A ) )

const multiNewton = ( a, fn, TOL, NMax, multiplicity ) => {
      const f = math.parse( fn )
      const df = math.derivative( f, 'x' );
      let p = a, fdf = 1, i = 0;
      for ( i = 1;i <= NMax;i++ ) {
            fdf = f.evaluate( { x: p } ) / df.evaluate( { x: p } );
            if ( Math.abs( fdf ) < TOL ) break;
            else p = p - ( multiplicity * fdf );
      }
      if ( i == NMax || Math.abs( fdf ) > TOL ) return null;
      else return p;
}

// const seidel = ( A, x, b ) => {
//       const n = A.length; let i = 0, j = 0, d;
//       for ( j = 0;i < n;i++ ) {
//             d = b[ j ]

//             for ( i = 0;i < n;i++ ) {
//                   if ( j != i )
//                         d -= A[ j ][ i ] * x[ i ]
//             }

//             x[ j ] = d / A[ j ][ j ]
//       }
//       return x
// }

// x = [ 0, 0, 0 ]
// A = [ [ 4, 1, 2 ], [ 3, 5, 1 ], [ 1, 1, 3 ] ]
// b = [ 4, 7, 3 ]

// for ( let i = 0;i < A.length;i++ ) {
//       x = seidel( A, x, b )
// }
// console.log( x );