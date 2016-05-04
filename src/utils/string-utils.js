export function getNumberSign(num) {

  if (!num) return '';

  return (num.value < 0) ? '-' : '+';

}

export function formatIdString(str) {

  if (!str) return '';

  return str.replace(/_/g, ' ');

}

export function formatNumber(num) {

  if (!num) return '';

  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  
}