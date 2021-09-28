/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  let objNew = [];

  for (let item of Object.entries(obj)) {
    if (!fields.includes(item[0])) {
      objNew.push([item[0], item[1]]);
    }
  }
  return Object.fromEntries(objNew);
};
