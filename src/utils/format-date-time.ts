export function formatDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata", 
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}