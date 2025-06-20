export const generateRandomNumber = (n: number): number => {
  const add = 1;
  let max = 12 - add;

  if (n > max) {
    return generateRandomNumber(max) + generateRandomNumber(n - max);
  }

  max = 10 ** (n + add);
  const min = max / 10;
  const strNumber = String(Math.floor(Math.random() * (max - min + 1)) + min);
  return +strNumber.substring(0, strNumber.length - add);
};
