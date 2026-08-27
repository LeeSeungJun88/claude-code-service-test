import "server-only";

import type { Restaurant } from "./types";

const KAKAO_KEYWORD_SEARCH_ENDPOINT = "https://dapi.kakao.com/v2/local/search/keyword.json";
const FOOD_CATEGORY_GROUP_CODE = "FD6";
const SEARCH_RADIUS_METERS = 1000;
const RESULTS_PER_KEYWORD = 15;

type KakaoDocument = {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  distance: string;
  phone: string;
  place_url: string;
};

export async function searchRestaurantsByKeyword(
  keyword: string,
  latitude: number,
  longitude: number,
): Promise<Restaurant[]> {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    throw new Error("KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const url = new URL(KAKAO_KEYWORD_SEARCH_ENDPOINT);
  url.searchParams.set("query", keyword);
  url.searchParams.set("category_group_code", FOOD_CATEGORY_GROUP_CODE);
  // 카카오 로컬 API는 x=경도(longitude), y=위도(latitude) 순서를 쓴다.
  url.searchParams.set("x", String(longitude));
  url.searchParams.set("y", String(latitude));
  url.searchParams.set("radius", String(SEARCH_RADIUS_METERS));
  url.searchParams.set("sort", "distance");
  url.searchParams.set("size", String(RESULTS_PER_KEYWORD));

  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${restApiKey}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`카카오 로컬 API 요청이 실패했습니다 (status ${response.status}).`);
  }

  const payload = await response.json();
  const documents: KakaoDocument[] = payload?.documents ?? [];

  return documents.map((doc) => ({
    id: doc.id,
    name: doc.place_name,
    categoryName: doc.category_name,
    address: doc.address_name,
    roadAddress: doc.road_address_name,
    distanceMeters: doc.distance ? Number(doc.distance) : null,
    phone: doc.phone,
    placeUrl: doc.place_url,
  }));
}
