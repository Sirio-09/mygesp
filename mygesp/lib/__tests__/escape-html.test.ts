import { describe, expect, it } from "vitest";
import { escapeHtml } from "../escape-html";

describe("escapeHtml", () => {
  it("neutralizza i caratteri che rompono il markup", () => {
    expect(escapeHtml('<img src="x" onerror="alert(1)">')).toBe(
      "&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;"
    );
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("lascia intatto il testo normale", () => {
    expect(escapeHtml("Muta Pinne 40cm")).toBe("Muta Pinne 40cm");
    expect(escapeHtml(42)).toBe("42");
  });

  it("gestisce valori vuoti", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml("")).toBe("");
  });
});
