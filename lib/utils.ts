export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getDuration(
  clockIn: string,
  clockOut: string | null,
  referenceTime = Date.now()
): string {
  const start = new Date(clockIn).getTime();
  const end = clockOut ? new Date(clockOut).getTime() : referenceTime;
  const difference = Math.max(0, end - start);

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}
