import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 오늘 점심 추천 제목을 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "오늘 점심 뭐 먹지?" })
  ).toBeInTheDocument();
});
