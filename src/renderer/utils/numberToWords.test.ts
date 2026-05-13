import { describe, expect, it } from "vitest";
import { numberToWordsRu, numberToWordsUz } from "./numberToWords";

describe("numberToWordsRu", () => {
  it("handles zero", () => {
    expect(numberToWordsRu(0)).toBe("ноль");
  });

  it("handles small numbers", () => {
    expect(numberToWordsRu(7)).toBe("семь");
    expect(numberToWordsRu(15)).toBe("пятнадцать");
    expect(numberToWordsRu(42)).toBe("сорок два");
  });

  it("applies feminine for thousands", () => {
    expect(numberToWordsRu(2000)).toBe("две тысячи");
    expect(numberToWordsRu(21000)).toBe("двадцать одна тысяча");
  });

  it("handles millions", () => {
    expect(numberToWordsRu(1_234_567)).toBe(
      "один миллион двести тридцать четыре тысячи пятьсот шестьдесят семь"
    );
  });

  it("handles negative numbers", () => {
    expect(numberToWordsRu(-5)).toBe("минус пять");
  });
});

describe("numberToWordsUz", () => {
  it("handles zero", () => {
    expect(numberToWordsUz(0)).toBe("nol");
  });

  it("handles small numbers", () => {
    expect(numberToWordsUz(7)).toBe("yetti");
    expect(numberToWordsUz(42)).toBe("qirq ikki");
  });

  it("handles thousands and millions", () => {
    expect(numberToWordsUz(1000)).toBe("bir ming");
    expect(numberToWordsUz(2_500_000)).toBe("ikki million besh yuz ming");
  });
});
