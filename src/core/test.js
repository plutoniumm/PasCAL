const math = require( 'mathjs' )

const secant1 = ( x0, x1, fn, TOL = 10e-6, NMax = 500 ) => {
      const f = math.parse( fn )
      let ctr = false, init = x0, itr = x1, finit = f.evaluate( { x: init } ), fitr, i = 1;
      for ( i = 1;i <= NMax;i++ ) {
            fitr = f.evaluate( { x: itr } );
            dx = fitr * ( itr - init ) / ( fitr - finit );
            val = itr - dx;
            if ( Math.abs( dx ) < TOL ) {
                  ctr = true;
                  break
            }
            else {
                  init = itr;
                  itr = val;
                  finit = fitr;
            }
      }
      if ( ctr ) return { "ans": val, "itr": i };
      else return null;
}

const secant2 = ( x0, x1, fn, TOL = 10e-6, NMax = 20 ) => {
      const f = math.parse( fn )
      let i = 1, temp = 0, dx;
      for ( i = 1;i <= NMax;i++ ) {
            temp = f.evaluate( { x: x1 } );
            dx = ( x1 - x0 ) / ( temp - f.evaluate( { x: x0 } ) );
            x0 = x1;
            x1 = x1 - ( temp * dx );

            if ( temp < TOL ) {
                  break;
            }
            console.log( dx + '=======>' + x1 + " |||   " + temp );
      }
      // if ( ctr )
      return { "ans": x1, "itr": i };
      // else return null;
}

console.log( secant2( 10, 30, 'x^2 -612' ) );