// Russian Cyrillic → Latin (BGN/PCGN-inspired, simplified for everyday use).
const ruCyrToLatMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
};

function applyCase(source: string, target: string): string {
  if (target.length === 0) return target;
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    // Single uppercase source letter → title-case the target (Щ → Shch, not SHCH).
    // Multi-char uppercase source (rare here) → uppercase the whole target.
    if (source.length === 1) {
      return target[0]!.toUpperCase() + target.slice(1);
    }
    return target.toUpperCase();
  }
  return target;
}

export function transliterateRuToLat(input: string): string {
  let result = "";
  for (const ch of input) {
    const lower = ch.toLowerCase();
    const mapped = ruCyrToLatMap[lower];
    if (mapped !== undefined) {
      result += applyCase(ch, mapped);
    } else {
      result += ch;
    }
  }
  return result;
}

// Uzbek Cyrillic → Latin (official 2019 alphabet, with oʻ/gʻ as digraphs with ʻ).
const uzCyrToLatMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ч: "ch", ш: "sh", ъ: "ʼ", ь: "",
  э: "e", ю: "yu", я: "ya",
  қ: "q", ғ: "gʻ", ў: "oʻ", ҳ: "h"
};

const uzLatToCyrMap: Record<string, string> = {
  a: "а", b: "б", v: "в", g: "г", d: "д", e: "е", j: "ж", z: "з",
  i: "и", y: "й", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", r: "р",
  s: "с", t: "т", u: "у", f: "ф", x: "х", q: "қ", h: "ҳ",
  yo: "ё", sh: "ш", ch: "ч", yu: "ю", ya: "я",
  "gʻ": "ғ", "oʻ": "ў",
  "gʼ": "ғ", "oʼ": "ў",
  "g'": "ғ", "o'": "ў",
  "ʼ": "ъ"
};

export function transliterateUzCyrToLat(input: string): string {
  let result = "";
  for (const ch of input) {
    const lower = ch.toLowerCase();
    const mapped = uzCyrToLatMap[lower];
    if (mapped !== undefined) {
      result += applyCase(ch, mapped);
    } else {
      result += ch;
    }
  }
  return result;
}

// Uzbek Latin → Cyrillic.
// Tricky because of digraphs (sh, ch, oʻ, gʻ, yo, yu, ya). Scan longest-match-first.
export function transliterateUzLatToCyr(input: string): string {
  const digraphs = ["yo", "sh", "ch", "yu", "ya", "oʻ", "gʻ", "oʼ", "gʼ", "o'", "g'"];
  let result = "";
  let i = 0;
  while (i < input.length) {
    let matched = false;
    // Try digraph first
    for (const dg of digraphs) {
      const slice = input.substring(i, i + dg.length);
      if (slice.toLowerCase() === dg) {
        const target = uzLatToCyrMap[dg] ?? "";
        result += applyCase(slice, target);
        i += dg.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = input.charAt(i);
    const lower = ch.toLowerCase();
    const mapped = uzLatToCyrMap[lower];
    if (mapped !== undefined) {
      result += applyCase(ch, mapped);
    } else {
      result += ch;
    }
    i++;
  }
  return result;
}
