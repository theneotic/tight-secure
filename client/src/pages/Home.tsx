import { useMemo, useState } from "react";
import { type ThemePreference, useTheme } from "@/contexts/ThemeContext";

type ContextId = "email" | "device" | "social" | "banking" | "work";
type CommandView = "inspect" | "advice" | "privacy";

const contexts: Array<{ id: ContextId; label: string; threshold: number }> = [
  { id: "email", label: "Email", threshold: 70 },
  { id: "device", label: "Device", threshold: 78 },
  { id: "social", label: "Social", threshold: 65 },
  { id: "banking", label: "Banking", threshold: 88 },
  { id: "work", label: "Work", threshold: 80 },
];

const commonPasswords = [
  "1234",
  "12345",
  "123456",
  "12345678",
  "password",
  "password1",
  "qwerty",
  "qwerty123",
  "letmein",
  "admin",
  "welcome",
  "abc123",
];

export function analysePassword(password: string) {
  const lower = password.toLowerCase();
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const unique = new Set(password).size;
  const common = commonPasswords.some(item => lower === item || lower.includes(item));
  const sequence = /(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|abcd|bcde|cdef|defg|qwerty|asdf|zxcv)/i.test(password);
  const repetition = /(.)\1\1/.test(password);
  const types = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  const lengthScore = Math.min(38, length * 3.1);
  const varietyScore = types * 11;
  const uniquenessScore = length ? Math.min(18, (unique / length) * 20) : 0;
  let score = Math.round(lengthScore + varietyScore + uniquenessScore - (common ? 44 : 0) - (sequence ? 18 : 0) - (repetition ? 10 : 0));
  score = Math.max(0, Math.min(100, score));

  const label = score < 35 ? "Weak" : score < 55 ? "Limited" : score < 75 ? "Usable" : score < 90 ? "Strong" : "Very strong";
  const alphabet = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSymbol ? 32 : 0);
  const bits = alphabet && length ? Math.round(length * Math.log2(alphabet)) : 0;
  const issues: string[] = [];

  if (common) issues.push("It contains a common pattern attackers try early.");
  if (sequence) issues.push("It uses a predictable sequence.");
  if (repetition) issues.push("Repeated characters reduce meaningful variation.");
  if (length < 12) issues.push("It needs more length. Aim for at least 12 characters.");
  if (!hasSymbol) issues.push("A separator can make a long passphrase less predictable.");
  if (!issues.length) issues.push("No obvious common pattern was detected by this local check.");

  return {
    score,
    label,
    bits,
    issues,
    checks: [
      { label: "12 or more characters", pass: length >= 12 },
      { label: "Upper and lower case", pass: hasLower && hasUpper },
      { label: "Numbers without a sequence", pass: hasNumber && !sequence },
      { label: "A non-alphanumeric character", pass: hasSymbol },
      { label: "No common password match", pass: !common },
    ],
  };
}

function generatePassword() {
  const words = ["harbor", "marble", "copper", "meadow", "cabin", "raven", "wicket", "maple", "window", "thistle", "orchard", "paper"];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(20 + Math.random() * 80);
  return `${pick()[0].toUpperCase()}${pick().slice(1)}-${pick()}-${number}`;
}

function scoreTone(score: number) {
  if (score < 35) return "risk";
  if (score < 75) return "watch";
  return "ready";
}

export default function Home() {
  const { preference, setPreference } = useTheme();
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [context, setContext] = useState<ContextId>("email");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "unavailable">("idle");
  const [commandView, setCommandView] = useState<CommandView>("inspect");
  const result = useMemo(() => analysePassword(password), [password]);
  const activeContext = contexts.find(item => item.id === context) ?? contexts[0];
  const hasPassword = password.length > 0;
  const tone = scoreTone(result.score);
  const filledSegments = Math.ceil(result.score / 10);
  const missingChecks = result.checks.filter(check => !check.pass).map(check => check.label.toLowerCase());

  const commandOutput = useMemo(() => {
    const target = activeContext.label.toLowerCase();
    const header = "tightsecure / local mode";

    if (commandView === "privacy") {
      return [header, "$ privacy --explain", "input: processed in this browser", "network: no password request", "storage: no password history", "clipboard: used only after Copy is selected"];
    }

    if (!hasPassword) {
      return [header, `$ ${commandView} --target ${target}`, "status: waiting for local input", "note: the password text will never appear here"];
    }

    if (commandView === "advice") {
      return [header, `$ advice --target ${target}`, `target score: ${activeContext.threshold}+`, `current score: ${result.score}`, `next move: ${missingChecks.length ? missingChecks[0] : "keep this password unique"}`, "reminder: use a password manager for storage"];
    }

    return [header, `$ inspect --target ${target}`, `score: ${result.score}/100 (${result.label.toLowerCase()})`, `length: ${password.length} characters`, `checks met: ${result.checks.filter(check => check.pass).length}/${result.checks.length}`, "password text: withheld locally"];
  }, [activeContext.label, activeContext.threshold, commandView, hasPassword, missingChecks, password.length, result.checks, result.label, result.score]);

  const copyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopyState("copied");
    } catch {
      setCopyState("unavailable");
    }
  };

  const useGeneratedPassword = () => {
    setPassword(generatePassword());
    setShown(true);
    setCopyState("idle");
  };

  return (
    <div className="secure-page">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Tight Secure home">TIGHT SECURE</a>
        <div className="header-actions">
          <span className="local-mark">Local check</span>
          <div className="appearance-control" role="group" aria-label="Color mode">
            {(["system", "light", "dark"] as ThemePreference[]).map(mode => (
              <button
                type="button"
                key={mode}
                className={preference === mode ? "is-active" : ""}
                onClick={() => setPreference?.(mode)}
                aria-pressed={preference === mode}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="top" className="workbench">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Password check / 01</p>
          <h1 id="page-title">Check a password before it becomes a problem.</h1>
          <p className="intro-copy">Tight Secure reads common patterns on this device. It does not submit, save, or validate the password you enter.</p>
        </section>

        <section className="analysis-panel" aria-labelledby="analysis-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Input</p>
              <h2 id="analysis-title">Run a local check</h2>
            </div>
            <p className="quiet-note">Nothing is sent to a server.</p>
          </div>

          <label className="field-label" htmlFor="password-input">Password</label>
          <div className="password-field">
            <input
              id="password-input"
              value={password}
              onChange={event => {
                setPassword(event.target.value);
                setCopyState("idle");
              }}
              type={shown ? "text" : "password"}
              placeholder="Type a password to check"
              autoComplete="off"
              spellCheck="false"
            />
            <button type="button" onClick={() => setShown(value => !value)}>{shown ? "Hide" : "Show"}</button>
          </div>

          <div className="field-actions">
            <button type="button" className="primary-button" onClick={useGeneratedPassword}>Generate an example</button>
            <button type="button" className="plain-button" onClick={copyPassword} disabled={!password}>Copy</button>
            <span className="copy-state" aria-live="polite">
              {copyState === "copied" ? "Copied to your clipboard." : copyState === "unavailable" ? "Clipboard access was unavailable." : ""}
            </span>
          </div>

          <div className="context-row" role="group" aria-label="What this password protects">
            <span className="field-label">Used for</span>
            <div className="context-options">
              {contexts.map(item => (
                <button
                  className={context === item.id ? "context-option is-selected" : "context-option"}
                  type="button"
                  key={item.id}
                  onClick={() => setContext(item.id)}
                  aria-pressed={context === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="result-panel" aria-labelledby="result-title" aria-live="polite">
          <div className="result-head">
            <div>
              <p className="eyebrow">Reading</p>
              <h2 id="result-title">{hasPassword ? result.label : "Waiting for input"}</h2>
            </div>
            {hasPassword && <p className="score-number"><strong>{result.score}</strong><span>/ 100</span></p>}
          </div>

          {hasPassword ? (
            <>
              <div className={`score-rule ${tone}`} aria-label={`Password score ${result.score} out of 100`}>
                {Array.from({ length: 10 }, (_, index) => <span className={index < filledSegments ? "is-filled" : ""} key={index} />)}
              </div>
              <div className="result-summary">
                <p>{result.issues[0]}</p>
                <p className="threshold-note">For {activeContext.label.toLowerCase()}, aim for {activeContext.threshold} or higher. This reading estimates {result.bits} bits from length and character variety.</p>
              </div>
              <ul className="check-list" aria-label="Password checks">
                {result.checks.map(check => (
                  <li key={check.label} data-pass={check.pass}>{check.label}<span>{check.pass ? "Met" : "Missing"}</span></li>
                ))}
              </ul>
            </>
          ) : (
            <div className="empty-reading">
              <p>Enter a password above to see the specific patterns this tool can identify.</p>
              <p>This is a teaching tool, not a password manager or breach monitor.</p>
            </div>
          )}
        </section>

        <section className="command-section" aria-labelledby="command-title">
          <div className="command-header">
            <div>
              <p className="eyebrow">Local command preview</p>
              <h2 id="command-title">See what the check is reading.</h2>
            </div>
            <p>This is a transcript of local metadata. It never prints the password itself.</p>
          </div>
          <div className="command-tabs" role="tablist" aria-label="Command preview options">
            {(["inspect", "advice", "privacy"] as CommandView[]).map(view => (
              <button
                type="button"
                role="tab"
                key={view}
                aria-selected={commandView === view}
                className={commandView === view ? "is-active" : ""}
                onClick={() => setCommandView(view)}
              >
                {view}
              </button>
            ))}
          </div>
          <pre className="command-output" aria-live="polite">{commandOutput.join("\n")}</pre>
        </section>

        <section className="method-section" aria-labelledby="method-title">
          <div>
            <p className="eyebrow">How to use the result</p>
            <h2 id="method-title">Prefer length, uniqueness, and a password manager.</h2>
          </div>
          <div className="method-copy">
            <p>A long, unique passphrase is usually more useful than a short password covered in substitutions. Do not reuse the same password across email, banking, work, or social accounts.</p>
            <p>Use this score as a prompt to improve a password, not as proof that it is safe forever.</p>
          </div>
        </section>

        <section className="legal-grid" aria-label="Privacy and terms">
          <article id="privacy">
            <p className="eyebrow">Privacy</p>
            <h2>Your password stays in the browser.</h2>
            <p>Tight Secure does not collect the text you type into the password field. The optional copy action uses your device clipboard only after you choose it.</p>
          </article>
          <article id="terms">
            <p className="eyebrow">Terms</p>
            <h2>Use the result as guidance.</h2>
            <p>This tool cannot verify breach history, account settings, or future attack methods. Keep your recovery information private and use multi-factor authentication where available.</p>
          </article>
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 Tight Secure</span>
        <span>Local password pattern check</span>
        <span><a href="#privacy">Privacy</a> / <a href="#terms">Terms</a></span>
      </footer>
    </div>
  );
}
