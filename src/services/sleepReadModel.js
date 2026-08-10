export function formatSleepMinutes(value) {
  if (value === null || value === undefined || value === '') return null;
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours && remainder) return `${hours} h ${remainder} min`;
  if (hours) return `${hours} h`;
  return `${remainder} min`;
}

export function currentSleepEntry(state) {
  const latest = state?.latest;
  if (!latest || latest.date !== state.today || formatSleepMinutes(latest.minutes) === null) return null;
  return latest;
}
