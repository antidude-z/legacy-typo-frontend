export function canEditPayroll(data) {
  return data?.can_edit === true && data?.item?.status !== 'paid';
}