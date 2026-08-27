// 기상청 초단기실황은 매시 정각 관측을 40분에 생성해 그 이후부터 제공한다.
// 정각 이후 45분이 지나기 전에는 아직 최신 자료가 없을 수 있어 한 시간 전 자료를 요청한다.
const PROVIDED_AFTER_MINUTE = 45;

export type KmaBaseTime = { baseDate: string; baseTime: string };

function toKst(date: Date): Date {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function resolveUltraSrtNcstBaseTime(now: Date): KmaBaseTime {
  const kst = toKst(now);

  let effectiveDate = new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()),
  );
  let hour = kst.getUTCHours();

  if (kst.getUTCMinutes() < PROVIDED_AFTER_MINUTE) {
    hour -= 1;
    if (hour < 0) {
      hour = 23;
      effectiveDate = new Date(effectiveDate.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  const baseDate = `${effectiveDate.getUTCFullYear()}${pad2(effectiveDate.getUTCMonth() + 1)}${pad2(effectiveDate.getUTCDate())}`;
  const baseTime = `${pad2(hour)}00`;

  return { baseDate, baseTime };
}
