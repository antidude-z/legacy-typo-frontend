export function permissionRoute(path) {
  if (path === '/options/permissions' || path === '/options/permissions/') return { action: 'edit' };
  return null;
}