import { CheckCircle2, Download, RotateCw } from "lucide-react";
import { ReactElement, useEffect, useRef, useState } from "react";
import { GemmaModelId, LocalAiStatus, PullModelProgress } from "../../shared/ipc";

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

const TARGET_MODEL: GemmaModelId = "gemma4:e4b";

interface WelcomeWizardProps {
  onComplete(): void;
}

export function WelcomeWizard({ onComplete }: WelcomeWizardProps): ReactElement {
  const [step, setStep] = useState<Step>("intro");
  const [progress, setProgress] = useState<PullModelProgress | null>(null);
  const [errorText, setErrorText] = useState<string>("");
  const [verifyAnswer, setVerifyAnswer] = useState<string>("");
  const startedRef = useRef(false);

  // Auto-run the setup pipeline starting from "checking"
  useEffect(() => {
    if (step === "checking" && !startedRef.current) {
      startedRef.current = true;
      void runSetup();
    }
  }, [step]);

  async function runSetup(): Promise<void> {
    try {
      let status = await window.os1.localAi.status();

      // Step: Ollama installed?
      if (!status.ollamaInstalled) {
        setStep("need-ollama");
        return;
      }

      // Step: Ollama running? If not, try to start.
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

      // Step: Model installed?
      const modelInstalled =
        status.models.find((m) => m.name === TARGET_MODEL)?.installed ?? false;

      if (!modelInstalled) {
        setStep("downloading-model");
        try {
          await window.os1.localAi.pullModelStream({ model: TARGET_MODEL }, (p) => setProgress(p));
        } catch (err) {
          setErrorText(err instanceof Error ? err.message : "Не удалось скачать модель.");
          setStep("verify-failed");
          return;
        }
      }

      // Step: Verify Russian response.
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

        {step === "intro" ? <IntroStep onStart={() => setStep("checking")} /> : null}

        {step === "checking" ? <BusyStep title="Проверяю..." subtitle="Смотрю, что уже готово." /> : null}

        {step === "starting-ollama" ? (
          <BusyStep title="Запускаю движок..." subtitle="Это займёт пару секунд." />
        ) : null}

        {step === "need-ollama" ? (
          <NeedOllamaStep onDownload={openOllamaDownload} onContinue={continueAfterOllamaInstall} />
        ) : null}

        {step === "ollama-failed" ? (
          <ErrorStep
            title="Не получилось запустить движок"
            message={errorText}
            onRetry={retry}
            onSkip={onComplete}
          />
        ) : null}

        {step === "downloading-model" ? <DownloadingStep progress={progress} /> : null}

        {step === "verifying" ? (
          <BusyStep title="Готовлю ответы на русском..." subtitle="Последний шаг — проверка." />
        ) : null}

        {step === "verify-failed" ? (
          <ErrorStep
            title="Не удалось завершить настройку"
            message={errorText}
            onRetry={retry}
            onSkip={onComplete}
          />
        ) : null}

        {step === "done" ? <DoneStep verifyAnswer={verifyAnswer} onContinue={onComplete} /> : null}
      </div>
    </main>
  );
}

function IntroStep({ onStart }: { onStart(): void }): ReactElement {
  return (
    <>
      <div className="welcome__body">
        <h2>Сейчас всё подготовлю</h2>
        <p>
          Nur работает прямо на вашем компьютере — без облака, без подписки, без передачи ваших данных
          в интернет. Для этого нужно один раз скачать модель (около 9 ГБ). Обычно занимает 10–20 минут.
        </p>
        <ul className="welcome__steps-list">
          <li>Проверю движок</li>
          <li>Скачаю мозги</li>
          <li>Проверю русский</li>
        </ul>
      </div>
      <button className="welcome__primary" type="button" onClick={onStart}>
        Поехали
      </button>
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
  onContinue
}: {
  onDownload(): void;
  onContinue(): void;
}): ReactElement {
  return (
    <>
      <div className="welcome__body">
        <h2>Нужно установить движок</h2>
        <p>
          Это бесплатная программа Ollama, которая запускает модель локально на вашем компьютере.
          Просто скачайте, дважды кликните — и вернитесь сюда.
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
      </div>
    </>
  );
}

function DownloadingStep({ progress }: { progress: PullModelProgress | null }): ReactElement {
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
      <p className="welcome__hint">Не закрывайте окно. Это самый долгий шаг, дальше всё мгновенно.</p>
    </div>
  );
}

function ErrorStep({
  title,
  message,
  onRetry,
  onSkip
}: {
  title: string;
  message: string;
  onRetry(): void;
  onSkip(): void;
}): ReactElement {
  return (
    <>
      <div className="welcome__body">
        <h2>{title}</h2>
        <p className="welcome__error">{message}</p>
        <p>Попробуйте ещё раз. Если не получается — можно пропустить и настроить позже в разделе «Настройки».</p>
      </div>
      <div className="welcome__actions">
        <button className="welcome__primary" type="button" onClick={onRetry}>
          Попробовать снова
        </button>
        <button className="welcome__secondary" type="button" onClick={onSkip}>
          Пропустить
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
