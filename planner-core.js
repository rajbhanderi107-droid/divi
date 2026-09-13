export const eventDays=Object.freeze(Array.from({length:10},(_,i)=>11+i));
export function parseNights(value){return [...new Set(String(value||'').split(',').filter(v=>/^\d{2}$/.test(v)&&eventDays.includes(Number(v))).map(Number))].sort((a,b)=>a-b)}
export function buildShareUrl(base,days){const url=new URL(base);url.search='';const valid=parseNights(days.join(','));if(valid.length)url.searchParams.set('nights',valid.join(','));url.hash='plan';return url.href}
const escapeICS=value=>value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
export function foldICS(line){let result='',length=0;const encoder=new TextEncoder();for(const ch of line){const bytes=encoder.encode(ch).length;if(length+bytes>75){result+='\r\n ';length=1}result+=ch;length+=bytes}return result}
export function buildCalendar(days,now=new Date()){
 const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Divi Garba//Event Planner//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 for(const day of parseNights(days.join(','))){lines.push('BEGIN:VEVENT',`UID:divi-202610${day}@divigarba.com`,`DTSTAMP:${stamp}`,`DTSTART:202610${day}T143000Z`,'SUMMARY:Divi Garba',`LOCATION:${escapeICS('Master Farm, B/s Sardardham, Vaishnodevi Circle')}`,`DESCRIPTION:${escapeICS('Gates open at 8:00 PM IST. Last entry 2:00 AM IST. No re-entry allowed. A valid event pass is required. This calendar entry is not a ticket or reservation. Event end time is not specified.')}`,'BEGIN:VALARM','TRIGGER:-PT2H','ACTION:DISPLAY','DESCRIPTION:Divi Garba starts in two hours','END:VALARM','END:VEVENT')}
 lines.push('END:VCALENDAR');return lines.map(foldICS).join('\r\n')+'\r\n';
}
