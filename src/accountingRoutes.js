export function payerRoute(path) {
  const match = /^\/accounting\/payers(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match || (match[1] === 'create' && match[2])) return null;
  return {identity: match[1] && match[1] !== 'create' ? match[1] : null,
    action: match[1] === 'create' ? 'create' : match[2] ?? (match[1] ? 'show' : 'list')};
}

export function billRoute(path) {
  const match = /^\/accounting\/bills(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match || (match[1] === 'create' && match[2])) return null;
  return {identity:match[1] && match[1] !== 'create' ? match[1] : null,
    action:match[1] === 'create' ? 'create' : match[2] ?? (match[1] ? 'view' : 'list')};
}

export function paymentRoute(path) {
  const match = /^\/accounting\/bills\/(\d+)\/payments\/(create|\d+)(?:\/(edit|delete|restore))?\/?$/.exec(path);
  if (!match || (match[2] === 'create' && match[3])) return null;
  return {billId:match[1], identity:match[2] === 'create' ? null : match[2],
    action:match[2] === 'create' ? 'create' : match[3] ?? 'show'};
}

export function paymentEditorPath(billId, paymentId = 'new') {
  if (!/^\d+$/.test(String(billId)) || (paymentId !== 'new' && !/^\d+$/.test(String(paymentId)))) {
    throw new Error('Invalid bill or payment identity');
  }
  return `/accounting/bills/${billId}/payments/${paymentId === 'new' ? 'create' : `${paymentId}/edit`}`;
}