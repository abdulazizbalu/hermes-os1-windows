// All units are converted via a base unit (e.g. metres, grams, litres, etc.).
// Pure data + math; no AI calls here.

export interface UnitDef {
  id: string;
  label: string;
  toBase: number;
}

export interface UnitCategory {
  id: string;
  label: string;
  units: UnitDef[];
}

export const unitCategories: UnitCategory[] = [
  {
    id: "length",
    label: "Длина",
    units: [
      { id: "mm", label: "Миллиметр (мм)", toBase: 0.001 },
      { id: "cm", label: "Сантиметр (см)", toBase: 0.01 },
      { id: "m", label: "Метр (м)", toBase: 1 },
      { id: "km", label: "Километр (км)", toBase: 1000 },
      { id: "in", label: "Дюйм", toBase: 0.0254 },
      { id: "ft", label: "Фут", toBase: 0.3048 },
      { id: "yd", label: "Ярд", toBase: 0.9144 },
      { id: "mi", label: "Миля", toBase: 1609.344 }
    ]
  },
  {
    id: "mass",
    label: "Вес",
    units: [
      { id: "mg", label: "Миллиграмм (мг)", toBase: 0.001 },
      { id: "g", label: "Грамм (г)", toBase: 1 },
      { id: "kg", label: "Килограмм (кг)", toBase: 1000 },
      { id: "t", label: "Тонна (т)", toBase: 1_000_000 },
      { id: "oz", label: "Унция", toBase: 28.3495 },
      { id: "lb", label: "Фунт", toBase: 453.592 }
    ]
  },
  {
    id: "volume",
    label: "Объём",
    units: [
      { id: "ml", label: "Миллилитр (мл)", toBase: 0.001 },
      { id: "l", label: "Литр (л)", toBase: 1 },
      { id: "m3", label: "Кубометр (м³)", toBase: 1000 },
      { id: "gal", label: "Галлон (США)", toBase: 3.78541 },
      { id: "cup", label: "Чашка", toBase: 0.24 }
    ]
  },
  {
    id: "area",
    label: "Площадь",
    units: [
      { id: "cm2", label: "см²", toBase: 0.0001 },
      { id: "m2", label: "м²", toBase: 1 },
      { id: "ha", label: "Гектар", toBase: 10_000 },
      { id: "km2", label: "км²", toBase: 1_000_000 },
      { id: "ft2", label: "фут²", toBase: 0.092903 },
      { id: "acre", label: "Акр", toBase: 4046.86 }
    ]
  }
];

export function convertUnit(value: number, from: UnitDef, to: UnitDef): number {
  return (value * from.toBase) / to.toBase;
}

// Temperature is non-linear — handle separately.
export type TempUnit = "c" | "f" | "k";

export function convertTemperature(value: number, from: TempUnit, to: TempUnit): number {
  let celsius: number;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

// Static currency rates (last updated: 2026-05). User can edit in settings later.
// Rates are USD-based: 1 USD = X currency.
export interface CurrencyDef {
  code: string;
  label: string;
  usdRate: number;
}

export const currencies: CurrencyDef[] = [
  { code: "USD", label: "Доллар США (USD)", usdRate: 1 },
  { code: "EUR", label: "Евро (EUR)", usdRate: 0.92 },
  { code: "RUB", label: "Российский рубль (RUB)", usdRate: 89.5 },
  { code: "UZS", label: "Узбекский сум (UZS)", usdRate: 12_650 },
  { code: "KZT", label: "Казахстанский тенге (KZT)", usdRate: 510 },
  { code: "GBP", label: "Британский фунт (GBP)", usdRate: 0.79 },
  { code: "TRY", label: "Турецкая лира (TRY)", usdRate: 39.2 },
  { code: "CNY", label: "Юань (CNY)", usdRate: 7.18 }
];

export function convertCurrency(value: number, from: CurrencyDef, to: CurrencyDef): number {
  const usd = value / from.usdRate;
  return usd * to.usdRate;
}

// File sizes.
export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

const fileSizeFactor: Record<FileSizeUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4
};

export function convertFileSize(value: number, from: FileSizeUnit, to: FileSizeUnit): number {
  return (value * fileSizeFactor[from]) / fileSizeFactor[to];
}

// Format a number for display — trim trailing zeros, limit precision.
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
    return value.toExponential(4);
  }
  const fixed = value.toFixed(6);
  return fixed.replace(/\.?0+$/, "");
}
