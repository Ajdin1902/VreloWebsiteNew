import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { BauplanPage } from "./BauplanPage";
import { bauplanPage } from "@/lib/bauplanPage";

it("renders the headline, the five stations and the six Merak points in order", () => {
  render(<BauplanPage data={bauplanPage} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Beziehung zu deinen Kunden/);
  const names = screen.getAllByTestId("station-name").map((n) => n.textContent);
  expect(names).toEqual(["Angebot", "Onboarding", "Skripte", "Texte", "Projektdoku"]);
  expect(screen.getAllByTestId("merak-punkt")).toHaveLength(6);
  expect(screen.queryByRole("link", { name: /Prozess-Check|Erstgespräch/ })).toBeNull();
});
