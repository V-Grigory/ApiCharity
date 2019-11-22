
const userId = (v) => {
  let num = Number(v);
  if(!num) return false;
  num = num.toString();
  return num.length === 6 ? num : false;
};

module.exports = validate = {
  userId
};
