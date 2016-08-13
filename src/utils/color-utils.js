'use strict';

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// See http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#5624139
export function hexToRgb(hex) {

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 255
  } : null;

}


//See http://stackoverflow.com/a/14246328/1004010
export function getGradient(startHex, endHex, steps) {

  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);

  const stepR = ((end.r - start.r) / (steps - 1));
  const stepG = ((end.g - start.g) / (steps - 1));
  const stepB = ((end.b - start.b) / (steps - 1));

  const gradient = [];

  for (let i = 0; i < steps; ++i) {

    gradient.push(rgbToHex(Math.floor(start.r + (stepR * i)),
                           Math.floor(start.g + (stepG * i)),
                           Math.floor(start.b + (stepB * i))));

  }

  return gradient;

}