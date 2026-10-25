// Convert a saved IANA birth time to the existing astrology engines' fixed offset input.
import {parseCivilTime} from './bazi/core/time.js';
export function birthOffset(input){const seconds=parseCivilTime(input.date,input.time,input.timezoneId).offsetSeconds;const minutes=Math.round(seconds/60),absolute=Math.abs(minutes);return (minutes<0?'-':'+')+String(Math.floor(absolute/60)).padStart(2,'0')+':'+String(absolute%60).padStart(2,'0');}
