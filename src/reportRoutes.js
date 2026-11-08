export function reportSettingsRoute(path) {
  const match = /^\/options\/reports(?:\/([a-zA-Z0-9_-]+)(?:\/params\/(\d+))?(?:\/edit)?)?\/?$/.exec(path);
  return match ? {identity:match[1] ?? null,paramId:match[2] ?? null} : null;
}