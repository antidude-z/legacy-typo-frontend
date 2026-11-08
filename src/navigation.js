// Laravel accepted arbitrary destination URLs; only same-origin app pages are
// retained in the port to avoid open redirects and SPA fallback loops.
export function safeDestination(value, fallback, origin) {
  if (typeof value !== 'string' || !value.trim() || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || url.username || url.password || !/^\/(orders|accounting|references|options|prices|reports)(?:\/|$)/.test(url.pathname)) return fallback;
    if (/%(?:2f|5c|0[0-9a-f]|1[0-9a-f])/i.test(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}

export function orderEditPath(identity, destination) {
  return `/orders/${identity}?destination=${encodeURIComponent(destination)}`;
}

export function billLabel(bill) {
  if (!bill) return ' - Не выбран - ';
  const date = (bill.date ?? bill.bill_date ?? '').split('-').reverse().join('.');
  return `${bill.number}${date ? ` от ${date} г.` : ''}`;
}