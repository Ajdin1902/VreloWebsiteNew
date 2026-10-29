import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { ElektroBauplanPage } from "./ElektroBauplanPage";
import { elektroBauplanPage } from "@/lib/elektroBauplanPage";

it("renders pain, solution, value and form in that order, the form last", () => {
  const { container } = render(<ElektroBauplanPage data={elektroBauplanPage} form={<div data-testid="slot" />} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mehr Büro als Baustelle?");
  const ids = [...container.querySelectorAll("section[id]")].map((s) => s.id);
  expect(ids).toEqual(["schmerz", "loesung", "inhalt", "pdf"]);
  expect(container.querySelector("#pdf")).toContainElement(screen.getByTestId("slot"));
  expect(container.querySelector("#pdf")!.nextElementSibling).toBeNull();
});

it("jumps from the hero to the form and links the source", () => {
  render(<ElektroBauplanPage data={elektroBauplanPage} />);
  expect(screen.getByRole("link", { name: "Bauplan kostenlos anfordern" })).toHaveAttribute("href", "#pdf");
  expect(screen.getByRole("link", { name: "hwk-do.de" })).toHaveAttribute("href", elektroBauplanPage.schmerz.quelleLink.href);
  expect(screen.getByText(/61/)).toBeInTheDocument();
  expect(screen.getAllByTestId("inhalt-punkt")).toHaveLength(4);
});
