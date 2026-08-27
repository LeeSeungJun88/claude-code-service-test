// 기상청 단기예보 API 활용가이드에 명시된 위경도 ↔ 격자좌표(Lambert Conformal Conic) 변환 공식.
const EARTH_RADIUS_KM = 6371.00877;
const GRID_SPACING_KM = 5.0;
const STANDARD_LAT1_DEG = 30.0;
const STANDARD_LAT2_DEG = 60.0;
const ORIGIN_LON_DEG = 126.0;
const ORIGIN_LAT_DEG = 38.0;
const ORIGIN_X = 43;
const ORIGIN_Y = 136;

const DEG_TO_RAD = Math.PI / 180.0;

export type KmaGrid = { nx: number; ny: number };

export function toKmaGrid(latitude: number, longitude: number): KmaGrid {
  const re = EARTH_RADIUS_KM / GRID_SPACING_KM;
  const slat1 = STANDARD_LAT1_DEG * DEG_TO_RAD;
  const slat2 = STANDARD_LAT2_DEG * DEG_TO_RAD;
  const olon = ORIGIN_LON_DEG * DEG_TO_RAD;
  const olat = ORIGIN_LAT_DEG * DEG_TO_RAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  const ra0 = Math.tan(Math.PI * 0.25 + (latitude * DEG_TO_RAD) * 0.5);
  const ra = (re * sf) / Math.pow(ra0, sn);
  let theta = longitude * DEG_TO_RAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + ORIGIN_X + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + ORIGIN_Y + 0.5);

  return { nx, ny };
}
