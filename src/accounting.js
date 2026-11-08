export function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  const [whole, fraction] = number.toFixed(2).split('.');
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${fraction}`;
}

export function billEditPath(identity, destination) {
  if (!/^\d+$/.test(String(identity))) throw new Error('Invalid bill identity');
  return `/accounting/bills/${identity}/edit?destination=${encodeURIComponent(destination)}`;
}