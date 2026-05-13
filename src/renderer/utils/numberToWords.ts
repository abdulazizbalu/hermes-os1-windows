// Russian "число прописью" — handles 0 to 999_999_999_999.
// Grammatical case: nominative (e.g. "две тысячи рублей", not "двух тысяч").

const unitsMale = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const unitsFem = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const teens = [
  "десять",
  "одиннадцать",
  "двенадцать",
  "тринадцать",
  "четырнадцать",
  "пятнадцать",
  "шестнадцать",
  "семнадцать",
  "восемнадцать",
  "девятнадцать"
];
const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

function chunkToWordsRu(n: number, feminine: boolean): string {
  if (n === 0) return "";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (h > 0 && hundreds[h]) parts.push(hundreds[h]!);
  if (t === 1 && teens[u]) {
    parts.push(teens[u]!);
  } else {
    if (t > 0 && tens[t]) parts.push(tens[t]!);
    if (u > 0) {
      const arr = feminine ? unitsFem : unitsMale;
      if (arr[u]) parts.push(arr[u]!);
    }
  }
  return parts.join(" ");
}

// Russian plural rule for nouns paired with numbers.
function pluralRu(n: number, [one, few, many]: [string, string, string]): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

const thousands: [string, string, string] = ["тысяча", "тысячи", "тысяч"];
const millions: [string, string, string] = ["миллион", "миллиона", "миллионов"];
const billions: [string, string, string] = ["миллиард", "миллиарда", "миллиардов"];

export function numberToWordsRu(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "ноль";

  const negative = n < 0;
  let value = Math.floor(Math.abs(n));

  const groups: number[] = [];
  while (value > 0) {
    groups.push(value % 1000);
    value = Math.floor(value / 1000);
  }

  const labels: { word: string; plural?: [string, string, string]; feminine: boolean }[] = [
    { word: "", feminine: false },
    { word: "", plural: thousands, feminine: true },
    { word: "", plural: millions, feminine: false },
    { word: "", plural: billions, feminine: false }
  ];

  const result: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const chunk = groups[i] ?? 0;
    if (chunk === 0) continue;
    const meta = labels[i];
    if (!meta) continue;
    const words = chunkToWordsRu(chunk, meta.feminine);
    result.push(words);
    if (meta.plural) {
      result.push(pluralRu(chunk, meta.plural));
    }
  }

  return (negative ? "минус " : "") + result.join(" ");
}

// Uzbek "raqamlarni so'z bilan" (latin) — simpler structure since Uzbek doesn't have
// the same grammatical case rules. Supports 0 to 999_999_999.
const uzUnits = ["", "bir", "ikki", "uch", "toʻrt", "besh", "olti", "yetti", "sakkiz", "toʻqqiz"];
const uzTens = ["", "oʻn", "yigirma", "oʻttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "toʻqson"];

function chunkToWordsUz(n: number): string {
  if (n === 0) return "";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (h > 0) {
    parts.push(h === 1 ? "bir yuz" : `${uzUnits[h]} yuz`);
  }
  if (t > 0) parts.push(uzTens[t] ?? "");
  if (u > 0) parts.push(uzUnits[u] ?? "");
  return parts.filter(Boolean).join(" ");
}

export function numberToWordsUz(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "nol";

  const negative = n < 0;
  let value = Math.floor(Math.abs(n));

  const groups: number[] = [];
  while (value > 0) {
    groups.push(value % 1000);
    value = Math.floor(value / 1000);
  }

  const scales = ["", "ming", "million", "milliard"];
  const result: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const chunk = groups[i] ?? 0;
    if (chunk === 0) continue;
    const words = chunkToWordsUz(chunk);
    result.push(words);
    const scale = scales[i];
    if (scale) result.push(scale);
  }

  return (negative ? "minus " : "") + result.join(" ");
}
