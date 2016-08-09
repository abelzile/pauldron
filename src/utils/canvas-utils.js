'use strict';


export function setPixel(imageData, x, y, r, g, b, a) {

  a = a || 255;

  const i = (x + y * imageData.width) * 4;

  imageData.data[i] = r;
  imageData.data[i + 1] = g;
  imageData.data[i + 2] = b;
  imageData.data[i + 3] = a;

}

export function getPixel(imageData, x, y) {

  const i = (x + y * imageData.width) * 4;

  return {
    r: imageData.data[i],
    g: imageData.data[i + 1],
    b: imageData.data[i + 2],
    a: imageData.data[i + 3],
  };

}