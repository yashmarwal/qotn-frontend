export function formatPrice(paise: number): string {
  if (!paise || isNaN(paise)) return '₹0';
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

export function toRupees(paise: number): number {
  return paise / 100;
}

export function discountPercent(originalPaise: number, currentPaise: number): number {
  return Math.round(((originalPaise - currentPaise) / originalPaise) * 100);
}

export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.toUpperCase();
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
