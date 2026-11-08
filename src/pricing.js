export function displayDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? value.split('-').reverse().join('.') : '';
}

export function isoDate(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value ?? '');
  if (!match) return '';
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : '';
}

export function stepQuantity(value, direction) {
  const number = Number(value);
  return Math.min(10000, Math.max(0, (Number.isFinite(number) ? number : 0) + direction * 10));
}

export function priceError(status) {
  return ({
    401: 'Сеанс завершён. Войдите в систему.',
    403: 'Недостаточно прав для изменения цены.',
    404: 'Цена или объект не существует.',
    422: 'Проверьте цену, валюту, дату и целое количество.',
  })[status] ?? 'Не удалось выполнить запрос. Повторите попытку.';
}