'use strict';


// See http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#5624139
export function hexToRgb(hex) {

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 255
  } : null;

}