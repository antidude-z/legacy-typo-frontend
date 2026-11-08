export function workRoute(path) {
  const match = /^\/references\/(prepresses|redactions)(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match || (match[2] === 'create' && match[3])) return null;
  return {kind:match[1], identity:match[2] && match[2] !== 'create' ? match[2] : null,
    action:match[2] === 'create' ? 'create' : match[3] ?? (match[2] ? 'show' : 'list')};
}