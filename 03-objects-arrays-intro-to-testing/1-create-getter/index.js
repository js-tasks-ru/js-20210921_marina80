/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const props = path.split(".");
  return (obj) => getter(obj, props);
}

function getter(obj, props) {

  for (let [key, value] of Object.entries(obj)) {

    if (props.includes(key)) {

      if (typeof (value) === "object") {
        obj = value;
        props = props.slice(1);
        return getter(obj, props);
      } else {
        return value;
      }

    }

  }

}
