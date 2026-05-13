import { describe, expect, it } from "vitest";
import { transliterateRuToLat, transliterateUzCyrToLat, transliterateUzLatToCyr } from "./transliterate";

describe("transliterateRuToLat", () => {
  it("transliterates Russian Cyrillic to Latin", () => {
    expect(transliterateRuToLat("привет")).toBe("privet");
    expect(transliterateRuToLat("Москва")).toBe("Moskva");
  });

  it("handles uppercase digraphs", () => {
    expect(transliterateRuToLat("Щука")).toBe("Shchuka");
  });

  it("preserves non-Cyrillic characters", () => {
    expect(transliterateRuToLat("ID-2024 привет")).toBe("ID-2024 privet");
  });
});

describe("transliterateUzCyrToLat", () => {
  it("converts Uzbek-specific letters", () => {
    expect(transliterateUzCyrToLat("ўзбек")).toBe("oʻzbek");
    expect(transliterateUzCyrToLat("қанд")).toBe("qand");
    expect(transliterateUzCyrToLat("ғоз")).toBe("gʻoz");
  });
});

describe("transliterateUzLatToCyr", () => {
  it("converts Latin oʻ/gʻ digraphs to Cyrillic", () => {
    expect(transliterateUzLatToCyr("oʻzbek")).toBe("ўзбек");
    expect(transliterateUzLatToCyr("gʻoz")).toBe("ғоз");
  });

  it("handles common ASCII apostrophe variants", () => {
    expect(transliterateUzLatToCyr("o'zbek")).toBe("ўзбек");
  });

  it("handles digraphs sh, ch, yo", () => {
    expect(transliterateUzLatToCyr("shahar")).toBe("шаҳар");
    expect(transliterateUzLatToCyr("choy")).toBe("чой");
  });
});
