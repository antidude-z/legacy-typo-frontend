export function compileRoute(path) {
  const match = /^\/references\/compiles(?:\/(create|\d+)(?:\/stages\/(create|\d+)(?:\/materials\/(create|\d+))?)?(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match) return null;
  const [, identity, stage, material, suffix] = match;
  if (identity === 'create') return stage || material || suffix ? null : {identity:null, stageId:null, itemId:null, level:'definition', action:'create'};
  if ((stage === 'create' || material === 'create') && suffix) return null;
  if (stage === 'create' && material) return null;

  return { identity: identity ?? null, stageId: stage && stage !== 'create' ? stage : null,
    itemId: material && material !== 'create' ? material : null,
    level: material ? 'material' : stage ? 'stage' : identity ? 'definition' : 'list',
    action: stage === 'create' || material === 'create' ? 'create' : suffix ?? (identity ? 'show' : 'list') };
}