/** "৳১০০০" with Bengali digits, the way the Figma form shows prices. */
export const formatTaka = (amount: string | number) => {
  const value = Number(amount);
  // A discount line (e.g. an admin price adjustment) reads "-৳৫০০", not "৳-৫০০".
  return `${value < 0 ? '-' : ''}৳${Math.abs(value).toLocaleString('bn-BD')}`;
};
