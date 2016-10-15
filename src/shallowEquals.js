/**
 * Helper function to include or exclude keys before comparing
 */
function excludeIncludeKeys(objA, objB, excludeKeys, includeKeys) {
  let keysA = Object.keys(objA);
  let keysB = Object.keys(objB);

  if (excludeKeys) {
    keysA = keysA.filter(key => excludeKeys.indexOf(key) === -1);
    keysB = keysB.filter(key => excludeKeys.indexOf(key) === -1);
  } else if (includeKeys) {
    keysA = keysA.filter(key => includeKeys.indexOf(key) !== -1);
    keysB = keysB.filter(key => includeKeys.indexOf(key) !== -1);
  }

  return [keysA, keysB];
}


/**
 * Modified from React's PureRenderMixin - https://github.com/francoislaberge/pure-render-mixin/blob/master/src/shallow-equal.js
 * (MIT License Copyright (c) 2015 Francois Laberge)
 *
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {Boolean}
 */
export default function shallowEquals(objA, objB, excludeKeys, includeKeys) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  const [keysA, keysB] = excludeIncludeKeys(objA, objB, excludeKeys, includeKeys);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (let i = 0; i < keysA.length; i += 1) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}


/**
 * Logs and returns an array showing the places where shallow equals failed or the string "equal"
 */
export function shallowEqualsDebug(objA, objB, excludeKeys, includeKeys,
    logPrefix = 'shallowEqualsDebug') {
  let result;
  if (shallowEquals(objA, objB, excludeKeys, includeKeys)) {
    result = 'equal';
  } else {
    const [keysA, keysB] = excludeIncludeKeys(objA, objB, excludeKeys, includeKeys);

    result = keysA
      .concat(keysB.filter(key => objA[key] === undefined)) // add in keys in B not in A
      .filter(key => objA[key] !== objB[key]) // add in keys where they don't match
      .map(key => ({ key, a: objA[key], b: objB[key] }))
      .reduce((acc, elem) => {
        acc.push(elem.key);
        acc.push(elem.a);
        acc.push(elem.b);
        return acc;
      }, []);
  }

  // eslint-disable-next-line no-console
  console.log(`${logPrefix}:`, result);
  return result;
}
