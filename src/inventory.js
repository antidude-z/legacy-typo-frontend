export function inventoryRoute(path) {
  const match = /^\/references\/(paper|materials)(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/.exec(path);
  if (!match || (match[2] === 'create' && match[3])) return null;
  return { kind: match[1], identity: match[2] && match[2] !== 'create' ? match[2] : null,
    action: match[2] === 'create' ? 'create' : match[3] ?? (match[2] ? 'show' : 'list') };
}

export function inventoryError(status, code) {
  if (code === 'paper_type_or_format_required') return 'Сначала создайте вид и формат бумаги.';
  return ({401: 'Сеанс завершён. Войдите в систему.', 403: 'Недостаточно прав для этого действия.',
    404: 'Запись не существует или недоступна.', 422: 'Проверьте поля формы и выбранные справочники.'})[status]
    ?? 'Ошибка соединения. Повторите попытку.';
}