import '@js-joda/timezone';
import { LocalDateTime, ZoneId } from '@js-joda/core';

const pad = n => String(n).padStart(2, '0');

export function parseCivilTime(date, time, timezoneId) {
  const localText = `${date}T${time.length === 5 ? time + ':00' : time}`;
  const zoned = LocalDateTime.parse(localText).atZone(ZoneId.of(timezoneId));
  const instant = new Date(zoned.toInstant().toEpochMilli());
  return { localText, zoned, instant, offsetSeconds: zoned.offset().totalSeconds() };
}

export function partsFromDate(date) {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), hour: date.getUTCHours(), minute: date.getUTCMinutes(), second: date.getUTCSeconds() };
}

export function localParts(parsed) {
  const d = parsed.zoned.toLocalDateTime();
  return { year:d.year(), month:d.monthValue(), day:d.dayOfMonth(), hour:d.hour(), minute:d.minute(), second:d.second() };
}

export function formatParts(p) {
  return `${p.year}-${pad(p.month)}-${pad(p.day)} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second || 0)}`;
}

function dayOfYear(p) {
  return Math.floor((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 1)) / 86400000) + 1;
}

export function equationOfTimeMinutes(p) {
  const days = new Date(Date.UTC(p.year, 1, 29)).getUTCDate() === 29 ? 366 : 365;
  const gamma = 2 * Math.PI / days * (dayOfYear(p) - 1 + (p.hour - 12 + p.minute / 60) / 24);
  return 229.18 * (0.000075 + 0.001868*Math.cos(gamma) - 0.032077*Math.sin(gamma) - 0.014615*Math.cos(2*gamma) - 0.040849*Math.sin(2*gamma));
}

export function applyTrueSolarTime(parsed, longitude) {
  const original = localParts(parsed);
  const offsetHours = parsed.offsetSeconds / 3600;
  const standardMeridian = offsetHours * 15;
  const longitudeCorrectionMinutes = (longitude - standardMeridian) * 4;
  const eotMinutes = equationOfTimeMinutes(original);
  const correctionMinutes = longitudeCorrectionMinutes + eotMinutes;
  const civilAsUtc = Date.UTC(original.year, original.month-1, original.day, original.hour, original.minute, original.second);
  const corrected = partsFromDate(new Date(civilAsUtc + correctionMinutes * 60000));
  return { original, corrected, standardMeridian, longitudeCorrectionMinutes, equationOfTimeMinutes:eotMinutes, correctionMinutes };
}
