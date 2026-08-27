import "server-only";

import { resolveUltraSrtNcstBaseTime } from "./kma-base-time";
import { toKmaGrid } from "./kma-grid";
import type { PrecipitationType, WeatherSnapshot } from "./types";

const KMA_ULTRA_SRT_NCST_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

// 초단기실황(getUltraSrtNcst) 응답의 PTY(강수형태) 코드.
// 0:없음 1:비 2:비/눈 3:눈 5:빗방울 6:빗방울눈날림 7:눈날림
const PTY_TO_PRECIPITATION: Record<string, PrecipitationType> = {
  "0": "none",
  "1": "rain",
  "2": "rainSnow",
  "3": "snow",
  "5": "rain",
  "6": "rainSnow",
  "7": "snow",
};

type KmaItem = { category: string; obsrValue: string };

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherSnapshot> {
  const serviceKey = process.env.KMA_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error("KMA_SERVICE_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const { nx, ny } = toKmaGrid(latitude, longitude);
  const { baseDate, baseTime } = resolveUltraSrtNcstBaseTime(new Date());

  const url = new URL(KMA_ULTRA_SRT_NCST_ENDPOINT);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("base_date", baseDate);
  url.searchParams.set("base_time", baseTime);
  url.searchParams.set("nx", String(nx));
  url.searchParams.set("ny", String(ny));
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("pageNo", "1");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`기상청 API 요청이 실패했습니다 (status ${response.status}).`);
  }

  const payload = await response.json();
  const header = payload?.response?.header;
  if (header && header.resultCode !== "00") {
    throw new Error(`기상청 API가 오류를 반환했습니다: ${header.resultMsg ?? header.resultCode}`);
  }

  const items: KmaItem[] = payload?.response?.body?.items?.item ?? [];
  const readValue = (category: string) =>
    items.find((item) => item.category === category)?.obsrValue;

  const temperature = readValue("T1H");
  const pty = readValue("PTY");

  if (temperature === undefined) {
    throw new Error("기상청 API 응답에서 기온(T1H) 값을 찾을 수 없습니다.");
  }

  return {
    temperatureCelsius: Number(temperature),
    precipitationType: PTY_TO_PRECIPITATION[pty ?? "0"] ?? "none",
    observedAt: new Date().toISOString(),
  };
}
