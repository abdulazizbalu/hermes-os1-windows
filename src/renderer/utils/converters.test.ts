import { describe, expect, it } from "vitest";
import {
  convertCurrency,
  convertFileSize,
  convertTemperature,
  convertUnit,
  currencies,
  formatNumber,
  unitCategories
} from "./converters";

describe("convertUnit", () => {
  it("converts metres to kilometres", () => {
    const length = unitCategories.find((c) => c.id === "length")!;
    const m = length.units.find((u) => u.id === "m")!;
    const km = length.units.find((u) => u.id === "km")!;
    expect(convertUnit(1500, m, km)).toBeCloseTo(1.5);
  });

  it("converts kilograms to pounds", () => {
    const mass = unitCategories.find((c) => c.id === "mass")!;
    const kg = mass.units.find((u) => u.id === "kg")!;
    const lb = mass.units.find((u) => u.id === "lb")!;
    expect(convertUnit(1, kg, lb)).toBeCloseTo(2.20462, 4);
  });
});

describe("convertTemperature", () => {
  it("converts Celsius to Fahrenheit", () => {
    expect(convertTemperature(0, "c", "f")).toBeCloseTo(32);
    expect(convertTemperature(100, "c", "f")).toBeCloseTo(212);
  });

  it("converts Kelvin to Celsius", () => {
    expect(convertTemperature(273.15, "k", "c")).toBeCloseTo(0);
  });
});

describe("convertCurrency", () => {
  it("converts USD to UZS using static rate", () => {
    const usd = currencies.find((c) => c.code === "USD")!;
    const uzs = currencies.find((c) => c.code === "UZS")!;
    expect(convertCurrency(1, usd, uzs)).toBeCloseTo(12650);
  });
});

describe("convertFileSize", () => {
  it("converts 1024 MB to GB", () => {
    expect(convertFileSize(1024, "MB", "GB")).toBeCloseTo(1);
  });

  it("converts GB to bytes", () => {
    expect(convertFileSize(1, "GB", "B")).toBe(1024 ** 3);
  });
});

describe("formatNumber", () => {
  it("trims trailing zeros", () => {
    expect(formatNumber(1.5)).toBe("1.5");
    expect(formatNumber(2)).toBe("2");
  });

  it("returns em dash for non-finite", () => {
    expect(formatNumber(Number.NaN)).toBe("—");
  });
});
