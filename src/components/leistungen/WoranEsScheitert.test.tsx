import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WoranEsScheitert } from "./WoranEsScheitert";
import { woranEsScheitert } from "@/lib/leistungen-weg";

describe("WoranEsScheitert", () => {
  it("renders every objection with its named solution", () => {
    render(<WoranEsScheitert />);
    for (const row of woranEsScheitert.rows) {
      expect(screen.getByText(row.einwand)).toBeInTheDocument();
      expect(screen.getByText(row.loesungName)).toBeInTheDocument();
    }
  });

  it("links each row to its target", () => {
    render(<WoranEsScheitert />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(woranEsScheitert.rows.length);
    expect(links[0]).toHaveAttribute("href", "/prozess-check");
    expect(links[1]).toHaveAttribute("href", "#prozess-audit");
  });
});
