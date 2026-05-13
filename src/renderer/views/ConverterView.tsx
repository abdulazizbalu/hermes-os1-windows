import { ReactElement, useState } from "react";
import { SectionFrame } from "../components/SectionFrame";
import {
  CurrencyDef,
  FileSizeUnit,
  TempUnit,
  UnitCategory,
  UnitDef,
  convertCurrency,
  convertFileSize,
  convertTemperature,
  convertUnit,
  currencies,
  formatNumber,
  unitCategories
} from "../utils/converters";
import { numberToWordsRu, numberToWordsUz } from "../utils/numberToWords";

type Tab = "units" | "temperature" | "currency" | "filesize" | "words";

const tabs: { id: Tab; label: string }[] = [
  { id: "units", label: "Единицы" },
  { id: "temperature", label: "Температура" },
  { id: "currency", label: "Валюты" },
  { id: "filesize", label: "Размер файла" },
  { id: "words", label: "Число прописью" }
];

export function ConverterView(): ReactElement {
  const [tab, setTab] = useState<Tab>("units");

  return (
    <SectionFrame
      eyebrow="Конвертер"
      title="Конвертеры для работы"
      description="Единицы, валюты, размеры файлов, число прописью. Всё работает локально, без интернета."
    >
      <div className="converter-shell">
        <nav className="converter-tabs" aria-label="Категории конвертера">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`converter-tab ${tab === t.id ? "converter-tab--selected" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="converter-body">
          {tab === "units" ? <UnitsConverter /> : null}
          {tab === "temperature" ? <TemperatureConverter /> : null}
          {tab === "currency" ? <CurrencyConverter /> : null}
          {tab === "filesize" ? <FileSizeConverter /> : null}
          {tab === "words" ? <NumberToWordsConverter /> : null}
        </div>
      </div>
    </SectionFrame>
  );
}

function UnitsConverter(): ReactElement {
  const [categoryId, setCategoryId] = useState<string>(unitCategories[0]!.id);
  const category: UnitCategory = unitCategories.find((c) => c.id === categoryId) ?? unitCategories[0]!;
  const [fromId, setFromId] = useState<string>(category.units[0]!.id);
  const [toId, setToId] = useState<string>(category.units[1]!.id);
  const [value, setValue] = useState("1");

  function selectCategory(id: string): void {
    const next = unitCategories.find((c) => c.id === id) ?? unitCategories[0]!;
    setCategoryId(id);
    setFromId(next.units[0]!.id);
    setToId(next.units[1]!.id);
  }

  const from: UnitDef = category.units.find((u) => u.id === fromId) ?? category.units[0]!;
  const to: UnitDef = category.units.find((u) => u.id === toId) ?? category.units[1]!;
  const parsed = Number(value.replace(",", "."));
  const result = Number.isFinite(parsed) ? convertUnit(parsed, from, to) : Number.NaN;

  return (
    <div className="converter-form">
      <label>
        <span>Категория</span>
        <select value={categoryId} onChange={(e) => selectCategory(e.target.value)}>
          {unitCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <ConverterRow
        value={value}
        onValueChange={setValue}
        fromOptions={category.units}
        fromValue={fromId}
        onFromChange={setFromId}
        toOptions={category.units}
        toValue={toId}
        onToChange={setToId}
        result={formatNumber(result)}
      />
    </div>
  );
}

function TemperatureConverter(): ReactElement {
  const [from, setFrom] = useState<TempUnit>("c");
  const [to, setTo] = useState<TempUnit>("f");
  const [value, setValue] = useState("20");
  const parsed = Number(value.replace(",", "."));
  const result = Number.isFinite(parsed) ? convertTemperature(parsed, from, to) : Number.NaN;
  const tempOpts = [
    { id: "c" as const, label: "Цельсий (°C)" },
    { id: "f" as const, label: "Фаренгейт (°F)" },
    { id: "k" as const, label: "Кельвин (K)" }
  ];

  return (
    <div className="converter-form">
      <ConverterRow
        value={value}
        onValueChange={setValue}
        fromOptions={tempOpts.map((t) => ({ id: t.id, label: t.label, toBase: 1 }))}
        fromValue={from}
        onFromChange={(id) => setFrom(id as TempUnit)}
        toOptions={tempOpts.map((t) => ({ id: t.id, label: t.label, toBase: 1 }))}
        toValue={to}
        onToChange={(id) => setTo(id as TempUnit)}
        result={formatNumber(result)}
      />
    </div>
  );
}

function CurrencyConverter(): ReactElement {
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("UZS");
  const [value, setValue] = useState("100");

  const from: CurrencyDef = currencies.find((c) => c.code === fromCode) ?? currencies[0]!;
  const to: CurrencyDef = currencies.find((c) => c.code === toCode) ?? currencies[1]!;
  const parsed = Number(value.replace(",", "."));
  const result = Number.isFinite(parsed) ? convertCurrency(parsed, from, to) : Number.NaN;

  return (
    <div className="converter-form">
      <ConverterRow
        value={value}
        onValueChange={setValue}
        fromOptions={currencies.map((c) => ({ id: c.code, label: c.label, toBase: 1 }))}
        fromValue={fromCode}
        onFromChange={setFromCode}
        toOptions={currencies.map((c) => ({ id: c.code, label: c.label, toBase: 1 }))}
        toValue={toCode}
        onToChange={setToCode}
        result={formatNumber(result)}
      />
      <p className="converter-note">
        Курсы статичные, для ориентира. Дата: май 2026. Для точных расчётов сверяйтесь с банком.
      </p>
    </div>
  );
}

function FileSizeConverter(): ReactElement {
  const [from, setFrom] = useState<FileSizeUnit>("MB");
  const [to, setTo] = useState<FileSizeUnit>("GB");
  const [value, setValue] = useState("1024");
  const parsed = Number(value.replace(",", "."));
  const result = Number.isFinite(parsed) ? convertFileSize(parsed, from, to) : Number.NaN;
  const fsUnits: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB"];

  return (
    <div className="converter-form">
      <ConverterRow
        value={value}
        onValueChange={setValue}
        fromOptions={fsUnits.map((u) => ({ id: u, label: u, toBase: 1 }))}
        fromValue={from}
        onFromChange={(id) => setFrom(id as FileSizeUnit)}
        toOptions={fsUnits.map((u) => ({ id: u, label: u, toBase: 1 }))}
        toValue={to}
        onToChange={(id) => setTo(id as FileSizeUnit)}
        result={formatNumber(result)}
      />
    </div>
  );
}

function NumberToWordsConverter(): ReactElement {
  const [value, setValue] = useState("1234567");
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  const valid = Number.isFinite(parsed);

  return (
    <div className="converter-form">
      <label>
        <span>Число</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Введите число"
        />
      </label>
      <div className="converter-result-pair">
        <div className="converter-result-block">
          <span className="converter-result-label">Русский</span>
          <p>{valid ? numberToWordsRu(parsed) : "—"}</p>
        </div>
        <div className="converter-result-block">
          <span className="converter-result-label">Узбекский</span>
          <p>{valid ? numberToWordsUz(parsed) : "—"}</p>
        </div>
      </div>
    </div>
  );
}

interface ConverterRowProps {
  value: string;
  onValueChange(value: string): void;
  fromOptions: { id: string; label: string }[];
  fromValue: string;
  onFromChange(id: string): void;
  toOptions: { id: string; label: string }[];
  toValue: string;
  onToChange(id: string): void;
  result: string;
}

function ConverterRow({
  value,
  onValueChange,
  fromOptions,
  fromValue,
  onFromChange,
  toOptions,
  toValue,
  onToChange,
  result
}: ConverterRowProps): ReactElement {
  return (
    <>
      <div className="converter-row">
        <label>
          <span>Значение</span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          <span>Из</span>
          <select value={fromValue} onChange={(e) => onFromChange(e.target.value)}>
            {fromOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>В</span>
          <select value={toValue} onChange={(e) => onToChange(e.target.value)}>
            {toOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="converter-result">
        <span className="converter-result-label">Результат</span>
        <p>{result}</p>
      </div>
    </>
  );
}
