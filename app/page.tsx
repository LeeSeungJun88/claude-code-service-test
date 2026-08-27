import { LunchRecommendationSection } from "@/components/lunch-recommendation/lunch-recommendation-section";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-16 px-6 sm:px-16 bg-white dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            오늘 점심 뭐 먹지?
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            오늘의 날씨와 위치를 반영해 주변 맛집을 추천해드립니다.
          </p>
        </div>
        <LunchRecommendationSection />
      </main>
    </div>
  );
}
