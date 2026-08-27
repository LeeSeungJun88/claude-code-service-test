import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LunchRecommendation } from "@/lib/lunch-recommendation/types";

import { LunchRecommendationSection } from "./lunch-recommendation-section";

const sampleRecommendation: LunchRecommendation = {
  weather: {
    temperatureCelsius: 30,
    precipitationType: "none",
    observedAt: "2026-08-27T12:00:00.000Z",
  },
  matchedRule: "heatwave",
  keywords: ["냉면", "냉국수"],
  restaurants: [
    {
      id: "1",
      name: "동네 냉면집",
      categoryName: "음식점 > 한식 > 면요리",
      address: "서울 강남구 어딘가 1",
      roadAddress: "서울 강남구 어딘가로 1",
      distanceMeters: 250,
      phone: "02-1234-5678",
      placeUrl: "https://place.map.kakao.com/1",
    },
  ],
};

function mockGeolocation(
  getCurrentPosition: (
    success: (position: GeolocationPosition) => void,
    error?: (error: GeolocationPositionError) => void,
  ) => void,
) {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition: vi.fn(getCurrentPosition) },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: undefined,
  });
});

describe("LunchRecommendationSection", () => {
  it("브라우저가 위치 정보를 지원하지 않으면 안내 문구를 보여준다", async () => {
    render(<LunchRecommendationSection />);

    expect(await screen.findByText(/위치 접근을 허용하면/)).toBeInTheDocument();
  });

  it("위치 접근을 거부하면 안내 문구를 보여준다", async () => {
    mockGeolocation((_success, error) => {
      error?.({ code: 1, message: "denied" } as GeolocationPositionError);
    });

    render(<LunchRecommendationSection />);

    expect(await screen.findByText(/위치 접근을 허용하면/)).toBeInTheDocument();
  });

  it("위치 접근을 허용하면 후보 목록을 보여준다", async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 37.5665, longitude: 126.978 },
      } as GeolocationPosition);
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleRecommendation,
      }),
    );

    render(<LunchRecommendationSection />);

    expect(await screen.findByText("동네 냉면집")).toBeInTheDocument();
    expect(screen.getByText(/냉면, 냉국수/)).toBeInTheDocument();
  });

  it("조건에 맞는 음식점이 없으면 안내 문구를 보여준다", async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 37.5665, longitude: 126.978 },
      } as GeolocationPosition);
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...sampleRecommendation, restaurants: [] }),
      }),
    );

    render(<LunchRecommendationSection />);

    expect(
      await screen.findByText("조건에 맞는 음식점을 찾지 못했습니다."),
    ).toBeInTheDocument();
  });

  it("추천 조회가 실패하면 에러 문구를 보여준다", async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 37.5665, longitude: 126.978 },
      } as GeolocationPosition);
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<LunchRecommendationSection />);

    expect(
      await screen.findByText(/추천 정보를 가져오지 못했습니다/),
    ).toBeInTheDocument();
  });
});
