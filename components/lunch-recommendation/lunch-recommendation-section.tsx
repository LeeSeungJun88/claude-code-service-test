"use client";

import { useEffect, useState } from "react";

import type { LunchRecommendation } from "@/lib/lunch-recommendation/types";

type Status =
  | "locating"
  | "loading"
  | "ready"
  | "empty"
  | "locationDenied"
  | "error";

function supportsGeolocation(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function LunchRecommendationSection() {
  // navigator.geolocation 지원 여부는 서버에서 알 수 없으므로, 서버·클라이언트
  // 최초 렌더링 모두 "locating"으로 통일해 하이드레이션 불일치를 피한다. 실제
  // 지원 여부는 마운트 이후 이 효과 안에서만 판정한다.
  const [status, setStatus] = useState<Status>("locating");
  const [recommendation, setRecommendation] = useState<LunchRecommendation | null>(null);

  useEffect(() => {
    if (!supportsGeolocation()) {
      // 렌더링 중 동기적으로 연쇄 렌더링을 일으키지 않도록 다음 틱으로 미뤄서 반영한다.
      const timeoutId = setTimeout(() => setStatus("locationDenied"), 0);
      return () => clearTimeout(timeoutId);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus("loading");
        fetch("/api/lunch-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              setStatus("error");
              return;
            }
            const data = (await response.json()) as LunchRecommendation;
            setRecommendation(data);
            setStatus(data.restaurants.length > 0 ? "ready" : "empty");
          })
          .catch(() => setStatus("error"));
      },
      () => setStatus("locationDenied"),
    );
  }, []);

  if (status === "locating" || status === "loading") {
    return (
      <p role="status" className="text-zinc-600 dark:text-zinc-400">
        오늘의 점심 추천을 준비하고 있습니다…
      </p>
    );
  }

  if (status === "locationDenied") {
    return (
      <p role="alert" className="text-zinc-600 dark:text-zinc-400">
        위치 접근을 허용하면 주변 맛집을 추천해드릴 수 있습니다. 브라우저 설정에서 위치 권한을 허용한 뒤 새로고침해주세요.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p role="alert" className="text-zinc-600 dark:text-zinc-400">
        추천 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  if (status === "empty") {
    return (
      <p role="status" className="text-zinc-600 dark:text-zinc-400">
        조건에 맞는 음식점을 찾지 못했습니다.
      </p>
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        오늘 기온 {recommendation.weather.temperatureCelsius}°C 기준, {recommendation.keywords.join(", ")} 추천
      </p>
      <ul className="flex flex-col gap-3">
        {recommendation.restaurants.map((restaurant) => (
          <li
            key={restaurant.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="font-medium text-black dark:text-zinc-50">{restaurant.name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{restaurant.categoryName}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {restaurant.roadAddress || restaurant.address}
            </p>
            {restaurant.distanceMeters !== null && (
              <p className="text-sm text-zinc-500">{restaurant.distanceMeters}m</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
