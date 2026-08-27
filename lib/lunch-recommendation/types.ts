export type PrecipitationType = "none" | "rain" | "rainSnow" | "snow";

export type WeatherSnapshot = {
  temperatureCelsius: number;
  precipitationType: PrecipitationType;
  observedAt: string;
};

export type Restaurant = {
  id: string;
  name: string;
  categoryName: string;
  address: string;
  roadAddress: string;
  distanceMeters: number | null;
  phone: string;
  placeUrl: string;
};

export type FoodRuleId = "rainy" | "heatwave" | "coldwave" | "normal";

export type LunchRecommendation = {
  weather: WeatherSnapshot;
  matchedRule: FoodRuleId;
  keywords: string[];
  restaurants: Restaurant[];
};
