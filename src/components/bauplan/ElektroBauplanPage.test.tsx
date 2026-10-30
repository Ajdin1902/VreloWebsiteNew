import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { ElektroBauplanPage } from "./ElektroBauplanPage";
import { elektroBauplanPage } from "@/lib/elektroBauplanPage";

it("renders pain, solution, value, form and offer in that order, the offer last", () => {
  const { container } = render(<ElektroBauplanPage data={elektroBauplanPage} form={<div data-testid="slot" />} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mehr Büro als Baustelle?");
  const ids = [...container.querySelectorAll("section[id]")].map((s) => s.id);
  expect(ids).toEqual(["schmerz", "loesung", "inhalt", "pdf", "angebot"]);
  expect(container.querySelector("#pdf")).toContainElement(screen.getByTestId("slot"));
  expect(container.querySelector("#angebot")!.nextElementSibling).toBeNull();
});

it("shows the offer with its four steps, the guarantee and the booking button", () => {
  const { container } = render(<ElektroBauplanPage data={elektroBauplanPage} />);
  const angebot = container.querySelector("#angebot")!;
  expect(angebot.querySelector("h2")).toHaveTextContent(elektroBauplanPage.angebot.heading);
  const beweis = screen.getByTestId("angebot-beweis");
  expect(beweis).toHaveTextContent(elektroBauplanPage.angebot.beweis);
  expect(angebot.querySelector("h2")!.nextElementSibling).toBe(beweis);
  expect(angebot.querySelectorAll("ol > li")).toHaveLength(4);
  expect(angebot).toHaveTextContent(elektroBauplanPage.angebot.garantie.text);
  const knappheit = screen.getByText(elektroBauplanPage.angebot.knappheit);
  expect(knappheit.compareDocumentPosition(screen.getByText(elektroBauplanPage.angebot.frage)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const cta = screen.getByRole("link", { name: "30 Minuten Gespräch buchen" });
  expect(angebot).toContainElement(cta);
  expect(cta).toHaveAttribute("href", "/kontakt?src=bauplan-elektro");
});

it("jumps from the hero to the form and links the source", () => {
  render(<ElektroBauplanPage data={elektroBauplanPage} />);
  expect(screen.getByRole("link", { name: "Bauplan kostenlos anfordern" })).toHaveAttribute("href", "#pdf");
  expect(screen.getByRole("link", { name: "hwk-do.de" })).toHaveAttribute("href", elektroBauplanPage.schmerz.quelleLink.href);
  expect(screen.getByText(/61/)).toBeInTheDocument();
  expect(screen.getAllByTestId("inhalt-punkt")).toHaveLength(4);
});

it("shows the assistant picture between the sub-line and the four steps", () => {
  const { container } = render(<ElektroBauplanPage data={elektroBauplanPage} />);
  const img = screen.getByRole("img", { name: elektroBauplanPage.loesung.bild.alt });
  expect(img.getAttribute("src")).toContain(encodeURIComponent(elektroBauplanPage.loesung.bild.src));
  const loesung = container.querySelector("#loesung")!;
  expect(loesung).toContainElement(img);
  const ol = loesung.querySelector("ol")!;
  expect(img.compareDocumentPosition(ol) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
