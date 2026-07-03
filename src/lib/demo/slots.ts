const WEEKDAY = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const TIMES = ["10:00", "14:30", "16:00"];

/** Three deterministic weekday slots after `now`, formatted in German. */
export function sandboxSlots(now: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(now);
  let i = 0;
  while (out.length < 3) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow === 0 || dow === 6) continue; // skip Sun/Sat
    const label = `${WEEKDAY[dow]}, ${cursor.getDate()}.${cursor.getMonth() + 1}. um ${TIMES[i % TIMES.length]} Uhr`;
    out.push(label);
    i++;
  }
  return out;
}
