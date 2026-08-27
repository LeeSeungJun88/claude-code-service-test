import { NextResponse } from "next/server";

import { getLunchRecommendation } from "@/lib/lunch-recommendation/get-recommendations";

type RequestBody = { latitude?: unknown; longitude?: unknown };

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  const { latitude, longitude } = body;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "위치 정보(latitude, longitude)가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const recommendation = await getLunchRecommendation(latitude, longitude);
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("점심 추천 조회 실패:", error);
    return NextResponse.json(
      { error: "추천 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 },
    );
  }
}
