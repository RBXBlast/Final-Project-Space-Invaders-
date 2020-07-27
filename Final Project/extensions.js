//Random decimal between 2 values
Math.randomDec = function (low, high) {
  return Math.random() * (high - low) + low;
};

//random int between 2 values
Math.randomInt = function (low, high) {
  return Math.floor(Math.randomDec(low, high));
};
