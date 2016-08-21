'use strict';


export function rgbToHex(r, g, b) {
  return ((r & 0x0ff) << 16) | ((g & 0x0ff) << 8) | (b & 0x0ff);
}

export function hexToRgb(hex) {

  return {
    r: (hex >> 16) & 0x0ff,
    g: (hex >> 8) & 0x0ff,
    b: (hex) & 0x0ff,
    a: 255
  };

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