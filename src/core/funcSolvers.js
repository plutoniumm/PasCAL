import { derivative, e, evaluate, log, pi, pow, round, sqrt } from "mathjs";

export const bisection = ( a, b, f, TOL ) => {
      let p, fa, fp;
      for ( let i = 0;i <= Math.floor( ( b - a ) / TOL );i++ ) {
            p = ( a + b ) / 2;
            fa = f( a );
            fp = f( p );
            if ( ( b - a ) < TOL || fp == 0 ) break
            else if ( fa * fp < 0 ) b = p;
            else {
                  a = p;
                  fa = fp;
            }
      }
      return p;
}

export const secant = ( x0, x1, f, TOL, NMax ) => {
      let ctr = false, init = x0, itr = x1, finit = f( init ), fitr;
      for ( let i = 1;i <= NMax;i++ ) {
            fitr = f( itr );
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

export const regula = ( a, b, f, TOL, NMax ) => {
      let fa = f( a ), fb = f( b ), init = b, ctr = false, finit, fFin;
      for ( let i = 1;i <= NMax;i++ ) {
            finit = b - fb * ( b - a ) / ( fb - fa );
            fFin = f( finit );
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

export const newton = ( a, f, TOL, NMax ) => {
      let df = derivative( f ), p = a, fdf, i;
      for ( i = 1;i <= NMax;i++ ) {
            fdf = f( p ) / df( p );
            if ( Math.abs( fdf ) < TOL ) break;
            else p = p - fdf;
      }
      if ( i == Nmax || Math.abs( fdf ) > TOL ) return null;
      else return p;
}