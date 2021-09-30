/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

  let stringNew = '';
  let symbol = ' ';
  let count = 0;

  if (size === 0 || string.length === 0) {return '';}

  if (size === undefined) {return string;}

  for (let char of string) {

    if (char !== symbol) {
      symbol = char;
      count = 0;
      stringNew += symbol;
      count += 1;
    } else if ((char === symbol) && (count < size)) {
      stringNew += symbol;
      count += 1;
    }

  }

  return stringNew;

}
