export function printerChildRoute(path) {
  const stage = /^\/references\/printers\/(\d+)\/processes\/(\d+)\/stages(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  const child = /^\/references\/printers\/(\d+)\/(fields|processes)(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  const match = stage ?? child;
  if (!match || (match[3] === 'create' && match[4])) return null;
  return {printerId: match[1], processId: stage ? match[2] : null,
    kind: stage ? 'stages' : match[2], identity: match[3] && match[3] !== 'create' ? match[3] : null,
    action: match[3] === 'create' ? 'create' : match[4] ?? (match[3] ? 'show' : 'list')};
}