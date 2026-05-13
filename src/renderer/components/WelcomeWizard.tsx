import { CheckCircle2, Download, RotateCw } from "lucide-react";
import { ReactElement, useEffect, useRef, useState } from "react";
import { GemmaModelId, PullModelProgress } from "../../shared/ipc";

type Step =
  | "intro"
  | "checking"
  | "need-ollama"
  | "starting-ollama"
  | "ollama-failed"
  | "downloading-model"
  | "verifying"
  | "verify-failed"
  | "done";

const TARGET_MODEL: GemmaModelId = "gemma4:e2b";
const APPROX_DOWNLOAD_GB = "≈ 2 ГБ";

interface WelcomeWizardProps {
  onComplete(): void;
  onSkip?(): void;
}

interface DownloadStats {
  bytesPerSecond: number;
  etaSeconds: number;
}

export function WelcomeWizard({ onComplete, onSkip }: WelcomeWizardProps): ReactElement {
  const [step, setStep] = useState<Step>("intro");
  const [progress, setProgress] = useState<PullModelProgress | null>(null);
  const [downloadStats, setDownloadStats] = useState<DownloadStats | null>(null);
  const [errorText, setErrorText] = useState<string>("");
  const [verifyAnswer, setVerifyAnswer] = useState<string>("");
  const startedRef = useRef(false);
  const sampleRef = useRef<{ time: number; completed: number } | null>(null);

  useEffect(() => {
    if (step === "checking" && !startedRef.current) {
      startedRef.current = true;
      void runSetup();
    }
  }, [step]);

  function trackProgress(p: PullModelProgress): void {
    setProgress(p);
    const now = Date.now();
    if (p.completed && p.total) {
      const prev = sampleRef.current;
      if (prev && now - prev.time > 1000) {
        const deltaBytes = p.completed - prev.completed;
        const deltaSeconds = (now - prev.time) / 1000;
        if (deltaBytes > 0 && deltaSeconds > 0) {
          const bps = deltaBytes / deltaSeconds;
          const remaining = p.total - p.completed;
          const eta = remaining > 0 ? remaining / bps : 0;
          setDownloadStats({ bytesPerSecond: bps, etaSeconds: eta });
        }
        sampleRef.current = { time: now, completed: p.completed };
      } else if (!prev) {
        sampleRef.current = { time: now, completed: p.completed };
      }
    }
  }

  async function runSetup(): Promise<void> {
    try {
      let status = await window.os1.localAi.status();

      if (!status.ollamaInstalled) {
        setStep("need-ollama");
        return;
      }

      if (!status.ollamaRunning) {
        setStep("starting-ollama");
        try {
          status = await window.os1.localAi.startOllama();
        } catch (err) {
          setErrorText(err instanceof Error ? err.message : "Не удалось запустить движок.");
          setStep("ollama-failed");
          return;
        }
        if (!status.ollamaRunning) {
          setErrorText("Движок не отвечает. Попробуйте перезапустить компьютер.");
          setStep("ollama-failed");
          return;
        }
      }

      const modelInstalled =
        status.models.find((m) => m.name === TARGET_MODEL)?.installed ?? false;

      if (!modelInstalled) {
        setStep("downloading-model");
        sampleRef.current = null;
        setDownloadStats(null);
        try {
          await window.os1.localAi.pullModelStream({ model: TARGET_MODEL }, trackProgress);
        } catch (err) {
          setErrorText(err instanceof Error ? err.message : "Не удалось скачать модель.");
          setStep("verify-failed");
          return;
        }
      }

      setStep("verifying");
      try {
        const result = await window.os1.localAi.generateText({
          model: TARGET_MODEL,
          prompt: "Поздоровайся одним коротким предложением на русском."
        });
        setVerifyAnswer(result.response.trim());
        setStep("done");
      } catch (err) {
        setErrorText(err instanceof Error ? err.message : "Не удалось проверить модель.");
        setStep("verify-failed");
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Что-то пошло не так.");
      setStep("verify-failed");
    }
  }

  function retry(): void {
    setErrorText("");
    setProgress(null);
    setDownloadStats(null);
    sampleRef.current = null;
    startedRef.current = false;
    setStep("checking");
  }

  function openOllamaDownload(): void {
    window.open("https://ollama.com/download/windows", "_blank", "noopener,noreferrer");
  }

  function continueAfterOllamaInstall(): void {
    setErrorText("");
    startedRef.current = false;
    setStep("checking");
  }

  return (
    <main className="welcome">
      <div className="welcome__card">
        <div className="welcome__brand">
          <div className="brand-mark brand-mark--large" aria-hidden="true">
            <span />
            <span />
          </div>
          <h1>Nur</h1>
          <p className="welcome__tagline">Ваш AI-помощник для офисных задач</p>
        </div>

        {step === "intro" ? <IntroStep onStart={() => setStep("checking")} onSkip={onSkip} /> : null}

        {step === "checking" ? <BusyStep title="Проверяю..." subtitle="Смотрю, что уже готово." /> : null}

        {step === "starting-ollama" ? (
          <BusyStep title="Запускаю движок..." subtitle="Это займёт пару секунд." />
        ) : null}

        {step === "need-ollama" ? (
          <NeedOllamaStep onDownload={openOllamaDownload} onContinue={continueAfterOllamaInstall} onSkip={onSkip} />
        ) : null}

        {step === "ollama-failed" ? (
          <ErrorStep
            title="Не получилось запустить движок"
            message={errorText}
            onRetry={retry}
            onSkip={onSkip ?? onComplete}
            skipLabel={onSkip ? "Использовать позже" : "Пропустить"}
          />
        ) : null}

        {step === "downloading-model" ? (
          <DownloadingStep progress={progress} stats={downloadStats} onSkip={onSkip} />
        ) : null}

        {step === "verifying" ? (
          <BusyStep title="Готовлю ответы на русском..." subtitle="Последний шаг — проверка." />
        ) : null}

        {step === "verify-failed" ? (
          <ErrorStep
            title="Не удалось завершить настройку"
            message={errorText}
            onRetry={retry}
            onSkip={onSkip ?? onComplete}
            skipLabel={onSkip ? "Использовать позже" : "Пропустить"}
          />
        ) : null}

        {step === "done" ? <DoneStep verifyAnswer={verifyAnswer} onContinue={onComplete} /> : null}
      </div>
    </main>
  );
}

function IntroStep({ onStart, onSkip }: { onStart(): void; onSkip?: () => void }): ReactElement {
  return (
    <>
      <div className="welcome__body">
        <h2>Сейчас всё подготовлю</h2>
        <p>
          Nur работает прямо на вашем компьютере — без облака, без подписки, без передачи данных в
          интернет. Один раз скачаю небольшую модель ({APPROX_DOWNLOAD_GB}). Обычно 5–15 минут.
        </p>
        <ul className="welcome__steps-list">
          <li>Проверю движок</li>
          <li>Скачаю мозги</li>
          <li>Проверю русский</li>
        </ul>
      </div>
      <div className="welcome__actions">
        <button className="welcome__primary" type="button" onClick={onStart}>
          Поехали
        </button>
        {onSkip ? (
          <button className="welcome__secondary" type="button" onClick={onSkip}>
            Использовать позже
          </button>
        ) : null}
      </div>
      {onSkip ? (
        <p className="welcome__hint welcome__hint--center">
          Конвертер и Транслитерация работают сразу без скачивания. Чат и AI-задачи — после установки модели.
        </p>
      ) : null}
    </>
  );
}

function BusyStep({ title, subtitle }: { title: string; subtitle?: string }): ReactElement {
  return (
    <div className="welcome__body welcome__body--centered">
      <div className="welcome__spinner" aria-hidden="true">
        <RotateCw size={28} />
      </div>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

function NeedOllamaStep({
  onDownload,
  onContinue,
  onSkip
}: {
  onDownload(): void;
  onContinue(): void;
  onSkip?: () => void;
}): ReactElement {
  return (
    <>
      <div className="welcome__body">
        <h2>Нужно установить движок</h2>
        <p>
          Это бесплатная программа Ollama, которая запускает модель локально. Скачайте, установите
          двойным кликом — и вернитесь сюда.
        </p>
      </div>
      <div className="welcome__actions">
        <button className="welcome__primary" type="button" onClick={onDownload}>
          <Download size={16} aria-hidden="true" />
          Скачать Ollama
        </button>
        <button className="welcome__secondary" type="button" onClick={onContinue}>
          Я установил, продолжить
        </button>
        {onSkip ? (
          <button className="welcome__secondary" type="button" onClick={onSkip}>
            Использовать позже
          </button>
        ) : null}
      </div>
    </>
  );
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 60) return `${Math.round(seconds)} сек`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return remMin > 0 ? `${hours} ч ${remMin} мин` : `${hours} ч`;
}

function formatSpeed(bps: number): string {
  if (!Number.isFinite(bps) || bps <= 0) return "—";
  const mbps = bps / 1024 / 1024;
  if (mbps >= 1) return `${mbps.toFixed(1)} МБ/с`;
  const kbps = bps / 1024;
  return `${Math.round(kbps)} КБ/с`;
}

function DownloadingStep({
  progress,
  stats,
  onSkip
}: {
  progress: PullModelProgress | null;
  stats: DownloadStats | null;
  onSkip?: () => void;
}): ReactElement {
  const status = progress?.status ?? "Готовлюсь...";
  const completed = progress?.completed ?? 0;
  const total = progress?.total ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const completedMb = (completed / 1024 / 1024).toFixed(0);
  const totalGb = total > 0 ? (total / 1024 / 1024 / 1024).toFixed(1) : "—";

  let humanStatus = "Скачиваю модель...";
  if (status.startsWith("pulling manifest")) humanStatus = "Готовлюсь к скачиванию...";
  else if (status.startsWith("downloading") || status.startsWith("pulling")) humanStatus = "Скачиваю модель";
  else if (status.startsWith("verifying")) humanStatus = "Проверяю целостность...";
  else if (status === "success") humanStatus = "Готово!";

  return (
    <div className="welcome__body welcome__body--centered">
      <h2>{humanStatus}</h2>
      <div className="welcome__progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="welcome__progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="welcome__progress-meta">
        {total > 0 ? `${completedMb} МБ из ${totalGb} ГБ · ${percent}%` : "Установка соединения..."}
      </p>
      {stats ? (
        <p className="welcome__progress-detail">
          {formatSpeed(stats.bytesPerSecond)} · осталось {formatDuration(stats.etaSeconds)}
        </p>
      ) : null}
      <p className="welcome__hint">Можно свернуть окно. Если закроете, скачивание продолжится при следующем запуске.</p>
      {onSkip ? (
        <button className="welcome__skip-link" type="button" onClick={onSkip}>
          Не ждать — продолжить без AI
        </button>
      ) : null}
    </div>
  );
}

function ErrorStep({
  title,
  message,
  onRetry,
  onSkip,
  skipLabel
}: {
  title: string;
  message: string;
  onRetry(): void;
  onSkip(): void;
  skipLabel: string;
}): ReactElement {
  return (
    <>
      <div className="welcome__body">
        <h2>{title}</h2>
        <p className="welcome__error">{message}</p>
        <p>Попробуйте ещё раз или продолжите без AI — Конвертер и Транслитерация работают и так.</p>
      </div>
      <div className="welcome__actions">
        <button className="welcome__primary" type="button" onClick={onRetry}>
          Попробовать снова
        </button>
        <button className="welcome__secondary" type="button" onClick={onSkip}>
          {skipLabel}
        </button>
      </div>
    </>
  );
}

function DoneStep({
  verifyAnswer,
  onContinue
}: {
  verifyAnswer: string;
  onContinue(): void;
}): ReactElement {
  return (
    <>
      <div className="welcome__body welcome__body--centered">
        <div className="welcome__check" aria-hidden="true">
          <CheckCircle2 size={48} />
        </div>
        <h2>Готово!</h2>
        {verifyAnswer ? (
          <blockquote className="welcome__verify">«{verifyAnswer}»</blockquote>
        ) : null}
        <p>Можно начинать. Спросите что угодно или попросите написать письмо.</p>
      </div>
      <button className="welcome__primary" type="button" onClick={onContinue}>
        Открыть Nur
      </button>
    </>
  );
}
