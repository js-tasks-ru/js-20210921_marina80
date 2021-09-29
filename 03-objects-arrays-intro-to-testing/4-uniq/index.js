/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {

  const arrUniq = [];
  const arrCopy = (arr !== undefined) ? [...arr] : [];

  arrCopy.forEach((item) => {

    let search = arrUniq.find(el => el === item);

    if (search === undefined) {
      arrUniq.push(item);
    }

  });

  return arrUniq;

}
