/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const collator = new Intl.Collator(['ru', 'en'], {
    caseFirst: 'upper'
  });
  let arrSort = arr.slice();

  if (param == "asc") {
    arrSort.sort(function (a, b) {
      return collator.compare(a, b);
    });
  } else {
    arrSort.sort(function (a, b) {
      return collator.compare(b, a);
    });
  }

  return arrSort;
  /*  --- or ---
   let arrSort = arr.slice();

   if (param == "asc") {
     arrSort.sort(function (a, b) {
       return a.localeCompare(b, ['ru', 'en'], {
         caseFirst: 'upper'
       });
     });
   } else {
     arrSort.sort(function (a, b) {
       return b.localeCompare(a, ['ru', 'en'], {
         caseFirst: 'upper'
       });
     });
   }

   return arrSort;
 */
}

