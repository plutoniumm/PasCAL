import App from './App.svelte';

let pass;
const state = localStorage.getItem( 'useKey' ) || 'deny';
if ( state != 'allow' ) pass = +prompt( 'Enter Key' );
if ( ( ( pass - 1604986805970 ) / ( 1000 * 3600 ) ) <= 24 || state == 'allow' ) {
	localStorage.setItem( 'useKey', 'allow' );
	const app = new App( {
		target: document.body,
		props: {}
	} );
}
else {
	window.location.href = "https://www.google.com"
}

export default app;