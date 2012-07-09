/*! Picturefill - Author: Scott Jehl, 2012 | License: MIT/GPLv2 */
/*
	Use the hell outta this. -@wilto
*/ 
(function( w ){
	// Enable strict mode
	"use strict";
	// User preference for HD content when available
	var prefHD = false || w.localStorage && w.localStorage[ "picturefill-prefHD" ] === "true";

	w.picturefill = function() {
		var ps = w.document.getElementsByTagName( "div" );
		
		// Loop the pictures
		for( var i = 0, il = ps.length; i < il; i++ ){
			if( ps[ i ] && ps[ i ].getAttribute( "data-picture" ) !== null ){
				var sources = ps[ i ].getElementsByTagName( "div" ),
					matches = [],
					hasHD = false;

				// See which sources match
				for( var j = 0, jl = sources.length; j < jl; j++ ){
					var media = sources[ j ].getAttribute( "data-media" );

					// if there's no media specified, OR w.matchMedia is supported 
					if( !media || ( w.matchMedia && w.matchMedia( media ).matches ) ){
						matches.push( sources[ j ] );
					}
				}

				// Find any existing img element in the picture element
				var picImg = ps[ i ].getElementsByTagName( "img" )[ 0 ];

				if( matches.length ){

					var match = matches.pop(),
						srcset = match.getAttribute( "data-srcset" );

					if( !picImg ){
						picImg = w.document.createElement( "img" );
						picImg.alt = ps[ i ].getAttribute( "data-alt" );
						ps[ i ].appendChild( picImg );
					}

					if( srcset ) {
						var screenRes = ( prefHD && w.devicePixelRatio ) || 1,
							sources = srcset.split(","); // Split comma-separated `srcset` sources into an array.

						hasHD = w.devicePixelRatio > 1; // User is on an HD device.

						for( var res = sources.length, r = res - 1; r >= 0; r-- ) { // Loop through each source/resolution in `srcset`.
							var source = sources[ r ].replace(/^\s*/, '').replace(/\s*$/, '').split(" "), // Remove any leading whitespace, then split on spaces.
								resMatch = parseFloat( source[1], 10 ); // Parse out the resolution for each source in `srcset`.

							if( screenRes >= resMatch ) {
								if( picImg.getAttribute( "src" ) !== source[0] ) {
									var newImg = document.createElement("img");

									newImg.src = source[0];

									// When the image is loaded, set a width equal to that of the original’s intrinsic width divided by the screen resolution:
									newImg.onload = function() {
										// Clone the original image into memory so the width is unaffected by page styles:
										newImg.width = ( this.cloneNode( true ).width / resMatch );
									}
									picImg.parentNode.replaceChild( newImg, picImg );
								}
								break; // We’ve matched, so bail out of the loop here. 
							}
						}
					} else {
						// No `srcset` in play, so just use the `src` value:
						picImg.src = match.getAttribute( "data-src" );
					}
					
					if( hasHD ){
						var prevSwitch = ps[ i ].getElementsByTagName( "a" )[ 0 ],
							picSwitch = w.document.createElement( "a" );

						if( prevSwitch ){
							ps [ i ].removeChild( prevSwitch );
						}

						picSwitch.href = "#";
						picSwitch.innerHTML = ( prefHD ? "S" : "H" ) + "D";
						picSwitch.title = "Switch image to " + ( prefHD ? "Standard" : "High" ) + "Definition";
						picSwitch.className = "pf-pref pf-pref-" + ( prefHD ? "standard" : "high" );
						ps[ i ].appendChild( picSwitch );
						picSwitch.onmouseup = function(){
							prefHD = !prefHD;
							if( w.localStorage ){
								w.localStorage[ "picturefill-prefHD" ] = prefHD; 
							}
							w.picturefill();
							return false;
						};
					}
				}
			}
		}
	};

	// Run on resize and domready (w.load as a fallback)
	if( w.addEventListener ){
		var throttle;
		w.addEventListener( "resize", function() {
			// Throttling the resize event prevents iOS from freaking out when it occasionally triggers a couple of resizes, as 2x images are loaded in.
			if( throttle ) { w.clearTimeout( throttle ); }
			throttle = w.setTimeout(function () {
				w.picturefill();
			}, 150 );
		}, false );
		
		w.addEventListener( "DOMContentLoaded", function(){
			w.picturefill();
			// Run once only
			w.removeEventListener( "DOMContentLoaded", w.picturefill, false );
			w.removeEventListener( "load", w.picturefill, false );
		}, false );
	}
	else if( w.attachEvent ){
		w.attachEvent( "onload", w.picturefill );
	}
})( this );
