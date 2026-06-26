const ACCRA_TZ = "Africa/Accra";
const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;

export function getAccraNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: ACCRA_TZ }));
}

export function isSalonOpen(now = getAccraNow()) {
  const hour = now.getHours();
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

export function salonHoursLabel() {
  return "8am–8pm";
}

export function salonStatusMessage(now = getAccraNow()) {
  if (isSalonOpen(now)) return "Open Now";
  const hour = now.getHours();
  if (hour < OPEN_HOUR) return "Opens 8am";
  return "Opens tomorrow 8am";
}
