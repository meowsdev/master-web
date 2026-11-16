/** "৳১০০০" with Bengali digits, the way the Figma form shows prices. */
export const formatTaka = (amount: string | number) => `৳${Number(amount).toLocaleString('bn-BD')}`;
