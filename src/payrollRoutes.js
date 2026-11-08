export function payrollRoute(path) {
  const match = /^\/reports\/payrolls(?:\/(create|\d+)(?:\/edit)?)?\/?$/.exec(path);
  if (!match || (match[1] === 'create' && path.includes('/edit'))) return null;
  return {identity: match[1] && match[1] !== 'create' ? match[1] : null, action: match[1] === 'create' ? 'create' : (match[1] ? 'edit' : 'create')};
}