import * as math from "mathjs";

export const bisection = ( a, b, fn, TOL, Nmax ) => {
      const f = math.parse( fn );
      let p, fa, fp;
      for ( let i = 0;i <= Nmax;i++ ) {
            p = ( a + b ) / 2;
            fa = f.evaluate( { x: a } );
            fp = f.evaluate( { x: p } );
            if ( ( b - a ) < TOL || fp == 0 ) break
            else if ( fa * fp < 0 ) b = p;
            else {
                  a = p;
                  fa = fp;
            }
      }
      return p;
}

export const secant = ( x0, x1, fn, TOL, NMax ) => {
      const f = math.parse( fn )
      let ctr = false, init = x0, itr = x1, finit = f.evaluate( { x: init } ), fitr;
      for ( let i = 1;i <= NMax;i++ ) {
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
      if ( ctr ) return val;
      else return null;
}

export const regula = ( a, b, fn, TOL, NMax ) => {
      const f = math.parse( fn )
      let fa = f.evaluate( { x: a } ), fb = f.evaluate( { x: b } ), init = b, ctr = false, finit, fFin;
      for ( let i = 1;i <= NMax;i++ ) {
            finit = b - fb * ( b - a ) / ( fb - fa );
            fFin = f.evaluate( { x: init } );
            if ( Math.abs( finit - init ) < TOL ) {
                  ctr = true;
                  break
            }
            else if ( fa * fFin < 0 ) {
                  b = finit;
                  fb = fFin;
            }
            else {
                  a = finit;
                  fa = fFin;
            }
            init = finit;
      }
      if ( ctr ) return finit;
      else return null;
}

export const newton = ( a, fn, TOL, NMax ) => {
      const f = math.parse( fn )
      const df = math.derivative( f, 'x' );
      let p = a, fdf = 1, i = 0;
      for ( i = 1;i <= NMax;i++ ) {
            fdf = f.evaluate( { x: p } ) / df.evaluate( { x: p } );
            if ( Math.abs( fdf ) < TOL ) break;
            else p = p - fdf;
      }
      if ( i == NMax || Math.abs( fdf ) > TOL ) return null;
      else return p;
}

export const multiNewton = ( a, fn, TOL, NMax, multiplicity ) => {
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