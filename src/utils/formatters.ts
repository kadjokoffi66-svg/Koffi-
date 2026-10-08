export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' FCFA';
}

export function formatDateFR(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateId(prefix: string = 'tx'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

export function generateReferralCode(): string {
  return 'INV-' + Math.floor(100000 + Math.random() * 900000);
}

export function getTimeRemaining(endDateStr: string): {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  try {
    const end = new Date(endDateStr).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      return {
        totalMs: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formatted: 'Échu (À liquider)',
      };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let formatted = '';
    if (days > 0) formatted += `${days}j `;
    formatted += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

    return {
      totalMs: diff,
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      formatted: formatted.trim(),
    };
  } catch {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00h 00m 00s',
    };
  }
}
