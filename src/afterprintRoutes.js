export function afterprintRoute(path) {
  const match = /^\/references\/afterprints(?:\/(\d+)(?:\/stages\/(create|\d+)(?:\/materials\/(create|\d+))?)?(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match) return null;
  const [, identity, stage, material, suffix] = match;
  if ((stage === 'create' || material === 'create') && suffix) return null;
  if (stage === 'create' && material) return null;
  if (!stage && (suffix === 'delete' || suffix === 'restore')) return null;
  return { identity: identity ?? null, stageId: stage && stage !== 'create' ? stage : null,
    itemId: material && material !== 'create' ? material : null,
    level: material ? 'material' : stage ? 'stage' : identity ? 'definition' : 'list',
    action: stage === 'create' || material === 'create' ? 'create' : suffix ?? (identity ? 'show' : 'list') };
}