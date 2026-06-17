const SIZE_ORDER: Record<string, number> = {
  // Infant/Baby
  '0-6M': 0, '6-12M': 1, '12-18M': 2, '18-24M': 3,
  // Toddler / Kids by age
  '2-3Y': 4, '3-4Y': 5, '4-5Y': 6, '5-6Y': 7, '6-7Y': 8,
  '7-8Y': 9, '8-9Y': 10, '9-10Y': 11, '10-11Y': 12, '11-12Y': 13,
  // Standard adult
  'XS': 14, 'S': 15, 'M': 16, 'L': 17, 'XL': 18, 'XXL': 19, '2XL': 19,
  '3XL': 20, '3X': 20, '4XL': 21, '4X': 21,
  // Numeric (waist/chest sizes)
  '28': 22, '30': 23, '32': 24, '34': 25, '36': 26, '38': 27,
  '40': 28, '42': 29, '44': 30, '46': 31, '48': 32,
};

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER[a] ?? 999;
    const bi = SIZE_ORDER[b] ?? 999;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  });
}
