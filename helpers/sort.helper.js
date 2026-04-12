module.exports.sortObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    throw new TypeError("Input must be an object");
  }

  let sorted = {};
  let str = [];
  let key;

  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(key);
    }
  }

  str.sort();

  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }

  return sorted;
};
