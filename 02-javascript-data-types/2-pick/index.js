/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {

  let objNew = [];

  for (let item of Object.entries(obj)) {
    if (fields.includes(item[0])) {
      objNew.push([item[0], item[1]]);
    }
  }
  return Object.fromEntries(objNew);
};
