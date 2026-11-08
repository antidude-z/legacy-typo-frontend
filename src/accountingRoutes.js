export function payerRoute(path) {
  const match = /^\/accounting\/payers(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match || (match[1] === 'create' && match[2])) return null;
  return {identity: match[1] && match[1] !== 'create' ? match[1] : null,
    action: match[1] === 'create' ? 'create' : match[2] ?? (match[1] ? 'show' : 'list')};
}