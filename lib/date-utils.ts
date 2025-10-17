import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatEventDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'MMMM d, yyyy');
}

export function formatShortDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'MMM d, yyyy');
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateRange(startDate: string | Date, endDate?: string | Date | null): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;

  if (!endDate) {
    return format(start, 'MMMM d, yyyy');
  }

  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
}
