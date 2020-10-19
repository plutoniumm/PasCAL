import { bisection, secant, newton, regula, multiNewton } from './eqns'
import { crout, dolittle } from './matrix'
import { divide, matrix, multiply } from 'mathjs'

const strToMatrix = ( str ) => { return '[[' + str.map( a => a.join( "," ) ).join( "], [" ) + ']]'; }
function iMatrix ( n ) { var a = Array.apply( null, new Array( n ) ); return a.map( function ( x, i ) { return a.map( function ( y, k ) { return i === k ? 1 : 0; } ) } ) }

export const inputHandler = ( inps ) => {
      document.getElementById( 'answer' ).innerHTML = "PasCAL is calculating";
      const state = inps.state;
      if ( state.set == 'eqns' ) {
            switch ( state.method ) {
                  case 'Bisection': {
                        const root = bisection( inps.init, inps.final, inps.func, inps.tol, inps.nmax );
                        outputHandler( root );
                  }
                        break;
                  case 'Secant': {
                        const root = secant( inps.init, inps.final, inps.func, inps.tol, inps.nmax );
                        outputHandler( root );
                  }
                        break;
                  case 'Regula-Falsi': {
                        const root = regula( inps.init, inps.final, inps.func, inps.tol, inps.nmax );
                        outputHandler( root );
                  }
                        break;
                  case 'Newton-Raphson': {
                        const root = newton( inps.init, inps.func, inps.tol, inps.nmax );
                        outputHandler( root );
                  }
                        break;
                  default:
                        break;
            }
      }
      if ( state.set == 'matrix' ) {
            const matA = matrix( inps.matA );
            switch ( state.method ) {
                  case "Multiply": {
                        const matB = matrix( inps.matB );
                        outputHandler( multiply( matA, matB ).toString() );
                  }
                        break;
                  case 'Inverse': {
                        const matB = matrix( iMatrix( inps.matA.length ) );
                        let inv = '';
                        try { inv = divide( matB, matA ).toString() }
                        catch ( e ) { inv = e };
                        outputHandler( inv );
                  }
                        break;
                  case 'LU-Crout': {
                        const crt = crout( inps.matA )
                        outputHandler( `Lower: ${ strToMatrix( crt.lower ) } || Upper: ${ strToMatrix( crt.upper ) }` )
                  }
                        break;
                  case 'LU-Dolittle': {
                        const dlt = dolittle( inps.matA )
                        console.log( dlt );
                        outputHandler( `Lower: ${ strToMatrix( dlt.lower ) } || Upper: ${ strToMatrix( dlt.upper ) }` )
                  }
                        break;
                  default:
                        break;
            }
      }
}

const outputHandler = ( ans ) => {
      document.getElementById( 'answer' ).innerHTML = ans
}