export function formatMoney(value?: number | null): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function formatMinutes(value?: number | null): string {
  const minutes = value || 0;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours.toString().padStart(2, '0')}h ${rest.toString().padStart(2, '0')}m` : `${rest} min`;
}

export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase();
}

export function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}
