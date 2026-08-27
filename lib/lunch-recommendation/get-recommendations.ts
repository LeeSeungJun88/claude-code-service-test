import "server-only";

import { fetchCurrentWeather } from "./weather-client";
import { matchFoodRule } from "./weather-food-rules";
import { searchRestaurantsByKeyword } from "./restaurant-client";
import type { LunchRecommendation, Restaurant } from "./types";

const MAX_RESTAURANTS = 10;

export async function getLunchRecommendation(
  latitude: number,
  longitude: number,
): Promise<LunchRecommendation> {
  const weather = await fetchCurrentWeather(latitude, longitude);
  const rule = matchFoodRule(weather);

  const resultsByKeyword = await Promise.all(
    rule.keywords.map((keyword) => searchRestaurantsByKeyword(keyword, latitude, longitude)),
  );

  const seenIds = new Set<string>();
  const restaurants: Restaurant[] = [];
  for (const results of resultsByKeyword) {
    for (const restaurant of results) {
      if (seenIds.has(restaurant.id)) continue;
      seenIds.add(restaurant.id);
      restaurants.push(restaurant);
    }
  }

  restaurants.sort(
    (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
  );

  return {
    weather,
    matchedRule: rule.id,
    keywords: rule.keywords,
    restaurants: restaurants.slice(0, MAX_RESTAURANTS),
  };
}
