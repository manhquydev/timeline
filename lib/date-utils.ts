import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatEventDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'd MMMM, yyyy', { locale: vi });
}

export function formatShortDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'd MMM, yyyy', { locale: vi });
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

export function formatDateRange(startDate: string | Date, endDate?: string | Date | null): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;

  if (!endDate) {
    return format(start, 'd MMMM, yyyy', { locale: vi });
  }

  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${format(start, 'd MMM, yyyy', { locale: vi })} - ${format(end, 'd MMM, yyyy', { locale: vi })}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${format(start, 'd MMM', { locale: vi })} - ${format(end, 'd MMM, yyyy', { locale: vi })}`;
  }

  return `${format(start, 'd MMM', { locale: vi })} - ${format(end, 'd, yyyy', { locale: vi })}`;
}
