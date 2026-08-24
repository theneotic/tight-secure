/**
 * Petal Instrument Panel: an asymmetric, calm security workspace with frosted tactile cards.
 * Light pastel imagery always carries dark slate type; dark mode uses equal visual depth, never neon.
 */
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lightbulb,
  LockKeyhole,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  UnlockKeyhole,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

type Palette = { name: string; color: string; soft: string };

const palettes: Palette[] = [
  { name: "Petal Blue", color: "#7DA7D8", soft: "#DDEEFF" },
  { name: "Red", color: "#F66D68", soft: "#FFE0DF" },
  { name: "Grey", color: "#7D818A", soft: "#E6E8EB" },
  { name: "Purple", color: "#A871D6", soft: "#EEE0FA" },
  { name: "Green", color: "#39B866", soft: "#DDF5E5" },
  { name: "Cyan", color: "#3BA7C9", soft: "#DDF4FA" },
  { name: "Orange", color: "#E89B2B", soft: "#FDECCF" },
  { name: "Teal", color: "#318D9B", soft: "#DDF2F3" },
  { name: "Yellow", color: "#C8AE35", soft: "#FCF5CE" },
  { name: "Magenta", color: "#CD5B8F", soft: "#F9DFEB" },
];

const contexts = [
  { id: "email", label: "Email", note: "Account recovery & personal records", target: 68, icon: "✉" },
  { id: "phone", label: "Phone", note: "Device unlock & private messages", target: 76, icon: "◉" },
  { id: "app", label: "App", note: "Everyday services & saved settings", target: 62, icon: "▦" },
  { id: "instagram", label: "Instagram", note: "Social identity & connected accounts", target: 70, icon: "◎" },
  { id: "tiktok", label: "TikTok", note: "Social content & creator access", target: 66, icon: "◌" },
  { id: "banking", label: "Banking", note: "Financial and identity data", target: 88, icon: "◇" },
];

const commonPasswords = ["1234", "12345", "123456", "12345678", "password", "password1", "qwerty", "qwerty123", "letmein", "admin", "iloveyou", "welcome", "abc123"];

function analysePassword(password: string) {
  const lower = password.toLowerCase();
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const unique = new Set(password).size;
  const common = commonPasswords.some((item) => lower === item || lower.includes(item));
  const sequence = /(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|abcd|bcde|cdef|defg|qwerty|asdf|zxcv)/i.test(password);
  const repetition = /(.)\1\1/.test(password);
  const types = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  const lengthScore = Math.min(38, length * 3.1);
  const varietyScore = types * 11;
  const uniquenessScore = length ? Math.min(18, (unique / length) * 20) : 0;
  let score = Math.round(lengthScore + varietyScore + uniquenessScore - (common ? 44 : 0) - (sequence ? 18 : 0) - (repetition ? 10 : 0));
  if (length === 0) score = 0;
  score = Math.max(0, Math.min(100, score));
  const label = score < 35 ? "Very weak" : score < 55 ? "Needs work" : score < 75 ? "Solid start" : score < 90 ? "Strong" : "Excellent";
  const status = score < 35 ? "weak" : score < 75 ? "medium" : "strong";
  const alphabet = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSymbol ? 32 : 0);
  const bits = alphabet && length ? Math.round(length * Math.log2(alphabet)) : 0;
  const crackTime = score < 25 ? "less than a second" : score < 45 ? "a few minutes" : score < 60 ? "several days" : score < 75 ? "months" : score < 88 ? "centuries" : "many lifetimes";

  const checks = [
    { label: "12+ characters", pass: length >= 12, value: `${length}/12` },
    { label: "Upper & lower case", pass: hasLower && hasUpper, value: hasLower && hasUpper ? "mixed" : "missing" },
    { label: "Numbers with intent", pass: hasNumber && !sequence, value: hasNumber && !sequence ? "present" : "missing" },
    { label: "Special characters", pass: hasSymbol, value: hasSymbol ? "present" : "missing" },
  ];

  const issues: string[] = [];
  if (common) issues.push("It matches a common pattern attackers try immediately.");
  if (sequence) issues.push("A predictable sequence makes the characters easier to guess.");
  if (repetition) issues.push("Repeated characters reduce the number of meaningful combinations.");
  if (length < 12) issues.push(`At ${length || 0} characters, it needs more room for unpredictability.`);
  if (!hasSymbol) issues.push("One or two unusual separators can make a phrase much less predictable.");
  if (!issues.length) issues.push("No obvious common pattern was detected in this local check.");

  return { score, label, status, bits, crackTime, checks, issues, types, length, hasSymbol, hasNumber, hasUpper, hasLower };
}

function generatePassword() {
  const words = ["petal", "ripple", "candle", "violet", "harbor", "lantern", "moss", "orbit", "paper", "mural", "drift", "bramble"];
  const choose = () => words[Math.floor(Math.random() * words.length)];
  const punctuation = ["!", "#", "?", "+", "="];
  return `${choose()[0].toUpperCase()}${choose().slice(1)}${punctuation[Math.floor(Math.random() * punctuation.length)]}${choose()}${Math.floor(20 + Math.random() * 80)}`;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const circumference = 301.6;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative grid h-[120px] w-[120px] place-items-center sm:h-[138px] sm:w-[138px]" aria-label={`Password score ${score} out of 100`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-200/70 dark:text-slate-600/50" />
        <circle cx="56" cy="56" r="48" fill="none" stroke={color} strokeLinecap="round" strokeWidth="7" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 550ms cubic-bezier(0.23,1,0.32,1)" }} />
      </svg>
      <div className="text-center">
        <div className="display-face text-3xl leading-none text-slate-800 sm:text-4xl dark:text-slate-100">{score}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">score / 100</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [password, setPassword] = useState("m0on!drift/2026");
  const [shown, setShown] = useState(false);
  const [context, setContext] = useState("email");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const insight = useMemo(() => analysePassword(password), [password]);
  const activeContext = contexts.find((item) => item.id === context) ?? contexts[0];
  const activePalette = palettes[paletteIndex];
  const contextGap = Math.max(0, activeContext.target - insight.score);
  const ringColor = insight.status === "weak" ? "#E6817B" : insight.status === "medium" ? "#D5A333" : activePalette.color;
  const style = { "--brand": activePalette.color, "--brand-soft": activePalette.soft } as React.CSSProperties;

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    toast.success("Copied locally — paste it where you need it.");
  };

  const makePassword = () => {
    setPassword(generatePassword());
    setShown(true);
    toast.success("A longer mixed passphrase is ready to review.");
  };

  return (
    <div className="atlas-shell relative overflow-x-hidden" style={style}>
      <div className="relative z-10 mx-auto max-w-[1480px] px-3 pb-10 pt-3 sm:px-7 sm:pb-12 sm:pt-4 lg:px-10">
        <header className="glass-card float-in flex items-center justify-between rounded-[1.35rem] px-3 py-2.5 sm:rounded-[1.5rem] sm:px-5 sm:py-3">
          <a href="#top" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Password Atlas home">
            <span className="brand-seal grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl p-1 sm:h-11 sm:w-11 sm:rounded-2xl dark:bg-slate-100/10">
              <img src="/manus-storage/password-atlas-logo_611bd469.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span>
              <span className="display-face block text-[17px] leading-none text-slate-800 sm:text-xl dark:text-slate-100">Password Atlas</span>
              <span className="mt-1 block truncate text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:text-[9px] sm:tracking-[0.18em] dark:text-slate-400">Private strength reading</span>
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/35 p-1 text-xs font-bold text-slate-600 shadow-inner dark:border-white/10 dark:bg-slate-950/20 dark:text-slate-300 md:flex">
              <ShieldCheck className="ml-2 h-3.5 w-3.5" style={{ color: activePalette.color }} />
              <span className="mr-2">Nothing leaves this screen</span>
            </div>
            <button onClick={toggleTheme} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/70 bg-white/40 text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" aria-label="Toggle light or dark mode">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main id="top" className="pt-5 sm:pt-10">
          <section className="relative overflow-hidden rounded-[1.65rem] border border-white/75 bg-[#e9e7eb] px-5 py-7 shadow-[18px_20px_44px_rgba(71,73,106,0.12)] sm:rounded-[2.1rem] sm:px-10 sm:py-10 lg:px-12">
            <img src="/manus-storage/password-atlas-hero_98f58810.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply dark:opacity-25 dark:mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/72 to-white/28 dark:from-[#191d2a]/92 dark:via-[#191d2a]/74 dark:to-[#191d2a]/36" />
            <div className="relative grid gap-6 sm:gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="float-in flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-600 sm:text-[11px] sm:tracking-[0.17em] dark:text-slate-300"><span className="h-px w-6 bg-current sm:w-8" />Password intelligence, in context</p>
                <h1 className="display-face float-in delay-1 mt-3 max-w-[15ch] text-[2.55rem] leading-[0.94] text-slate-800 sm:mt-4 sm:text-6xl lg:text-7xl dark:text-white">Read the signals before you reuse a secret.</h1>
                <p className="float-in delay-2 mt-4 max-w-xl text-[13px] leading-5 text-slate-600 sm:mt-5 sm:text-base sm:leading-6 dark:text-slate-300">A private, on-device reading for the password you are considering — measured against the importance of what it protects.</p>
              </div>
              <div className="float-in delay-3 flex items-end justify-between gap-3 rounded-[1.35rem] border border-white/70 bg-white/40 p-4 shadow-[inset_1px_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md sm:gap-5 sm:rounded-[1.6rem] dark:border-white/10 dark:bg-slate-950/20">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Today’s principle</p>
                  <p className="display-face mt-2 max-w-[21ch] text-lg leading-tight text-slate-800 sm:max-w-[23ch] sm:text-xl dark:text-white">A memorable phrase is stronger than a clever-looking pattern.</p>
                </div>
                <img src="/manus-storage/password-atlas-orb_32a566bf.png" alt="Abstract frosted security orb" className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_12px_12px_rgba(80,92,124,0.2)] sm:h-24 sm:w-24" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 sm:mt-7 sm:gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.8fr)]">
            <article className="glass-card petal-grid float-in delay-1 rounded-[1.65rem] p-4 sm:rounded-[2rem] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">01 / read your password</p>
                  <h2 className="display-face mt-2 text-3xl text-slate-800 dark:text-white">Place the password in the lens.</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/40 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-black/15 dark:text-slate-300"><LockKeyhole className="h-3.5 w-3.5" style={{ color: activePalette.color }} />Local-only analysis</span>
              </div>

              <div className="inset-well mt-6 flex min-h-[62px] items-center gap-2 rounded-[1.25rem] border border-white/65 px-3 py-2.5 sm:mt-7 sm:gap-3 sm:rounded-[1.5rem] sm:px-4 sm:py-3 dark:border-white/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/60 shadow-sm dark:bg-white/10"><KeyRound className="h-5 w-5" style={{ color: activePalette.color }} /></span>
                <label className="sr-only" htmlFor="password-input">Password to analyse</label>
                <input id="password-input" value={password} onChange={(event) => setPassword(event.target.value)} type={shown ? "text" : "password"} placeholder="Try a password…" autoComplete="off" spellCheck="false" className="min-w-0 flex-1 bg-transparent text-base font-bold tracking-[0.08em] text-slate-800 outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 dark:text-slate-100" />
                <button onClick={() => setShown((value) => !value)} aria-label={shown ? "Hide password" : "Show password"} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">{shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={copyPassword} aria-label="Copy password" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"><Copy className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                {insight.checks.map((check) => <span key={check.label} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${check.pass ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-200/65 text-slate-500 dark:bg-white/8 dark:text-slate-400"}`}><span className={`grid h-4 w-4 place-items-center rounded-full ${check.pass ? "bg-emerald-500 text-white" : "border border-current"}`}>{check.pass && <Check className="h-3 w-3" />}</span>{check.label}</span>)}
              </div>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="data-lens rounded-[1.5rem] border border-white/70 p-5 dark:border-white/10">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Signal breakdown</span><CircleHelp className="h-4 w-4 text-slate-400" /></div>
                  <div className="mt-5 space-y-4">
                    {[{ label: "Length", value: Math.min(100, insight.length * 8.33) }, { label: "Character mix", value: insight.types * 25 }, { label: "Pattern resistance", value: Math.max(8, insight.score - 10) }].map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300"><span>{item.label}</span><span>{Math.round(item.value)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/65 shadow-inner dark:bg-black/20"><div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: activePalette.color, transition: "width 500ms cubic-bezier(0.23,1,0.32,1)" }} /></div></div>)}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-slate-900 p-5 text-white shadow-[inset_1px_1px_0_rgba(255,255,255,0.12)]">
                  <img src="/manus-storage/password-atlas-texture_7b4d391a.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen" />
                  <div className="relative"><p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-300">Straight answer</p><p className="display-face mt-2 text-2xl leading-tight">{insight.issues[0]}</p><p className="mt-3 text-xs leading-5 text-slate-300">This reading catches familiar weak patterns. It does not send, save, or validate your password anywhere.</p></div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/75 pt-5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"><UnlockKeyhole className="h-4 w-4" style={{ color: activePalette.color }} />If this password is reused, change it first where the risk is highest.</p>
                <button onClick={makePassword} className="tactile-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white sm:min-h-0 sm:w-auto" style={{ backgroundColor: activePalette.color }}><RefreshCw className="h-4 w-4" />Generate a stronger one</button>
              </div>
              <div className="mt-6 hidden grid-cols-3 gap-3 border-t border-slate-200/60 pt-5 xl:grid dark:border-white/10">
                {[{ label: "Reusable?", value: "Avoid it", note: "Keep this password unique." }, { label: "Sensitive use", value: activeContext.label, note: `${activeContext.target}+ is the right target.` }, { label: "Next move", value: insight.score < activeContext.target ? "Strengthen it" : "Store it", note: insight.score < activeContext.target ? "Add length before complexity." : "Use a password manager." }].map((item) => <div key={item.label} className="rounded-2xl border border-white/60 bg-white/25 p-4 dark:border-white/10 dark:bg-white/5"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-100">{item.value}</p><p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{item.note}</p></div>)}
              </div>
            </article>

            <aside className="space-y-5 sm:space-y-6">
              <section className="glass-card petal-grid float-in delay-2 rounded-[1.65rem] p-4 sm:rounded-[2rem] sm:p-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">02 / choose what it protects</p>
                <h2 className="display-face mt-2 text-3xl text-slate-800 dark:text-white">Context changes the bar.</h2>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
                  {contexts.map((item) => <button key={item.id} onClick={() => setContext(item.id)} className={`min-h-[92px] rounded-2xl border p-3 text-left transition ${context === item.id ? "border-transparent bg-[color:var(--brand-soft)]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(70,75,108,0.11)]" : "border-white/65 bg-white/25 hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}><span className="mb-2 block text-xl" aria-hidden="true">{item.icon}</span><span className="block text-xs font-extrabold text-slate-700 dark:text-slate-100">{item.label}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">Target {item.target}</span></button>)}
                </div>
                <div className="mt-5 rounded-2xl border border-white/70 bg-white/35 p-4 dark:border-white/10 dark:bg-black/10"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-extrabold text-slate-700 dark:text-slate-100">{activeContext.label}</p><p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{activeContext.note}</p></div><span className="rounded-full px-2.5 py-1 text-[10px] font-extrabold" style={{ backgroundColor: activePalette.soft, color: activePalette.color }}>{activeContext.target}+ target</span></div></div>
              </section>

              <section className="glass-card float-in delay-3 rounded-[1.65rem] p-4 sm:rounded-[2rem] sm:p-6">
                <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">03 / your reading</p><h2 className="display-face mt-2 text-3xl text-slate-800 dark:text-white">{insight.label}</h2></div><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/55 shadow-sm dark:bg-white/10"><Sparkles className="h-5 w-5" style={{ color: ringColor }} /></span></div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 sm:gap-4"><ScoreRing score={insight.score} color={ringColor} /><div className="min-w-[145px] flex-1"><p className="text-xs font-bold text-slate-600 dark:text-slate-300">Estimated guess resistance</p><p className="display-face mt-1 text-xl text-slate-800 sm:text-2xl dark:text-white">{insight.crackTime}</p><p className="mt-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">About {insight.bits} bits from length and character variety alone.</p></div></div>
                <div className="data-lens mt-5 rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-white"><div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-300"><span>Context fit</span><span>{contextGap ? `${contextGap} points short` : "meets target"}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (insight.score / activeContext.target) * 100)}%`, backgroundColor: ringColor, transition: "width 500ms cubic-bezier(0.23,1,0.32,1)" }} /></div></div>
              </section>
            </aside>
          </section>

          <section className="mt-5 grid gap-5 sm:mt-7 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="glass-card rounded-[1.65rem] p-4 sm:rounded-[2rem] sm:p-7">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">A small principle</p><h2 className="display-face mt-2 text-3xl leading-tight text-slate-800 dark:text-white">Mixing is useful when it has a job.</h2></div><Lightbulb className="h-6 w-6 shrink-0" style={{ color: activePalette.color }} /></div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">Instead of swapping <strong>e</strong> for <strong>3</strong> in a short word, use a long, memorable phrase with punctuation that separates ideas. Length creates room; varied characters help prevent predictable guessing.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="inset-well rounded-2xl p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-500">Predictable</p><p className="mt-1 font-bold text-rose-500">Summer123!</p><p className="mt-1 text-[10px] text-slate-500">Common word + sequence</p></div><div className="rounded-2xl bg-[color:var(--brand-soft)]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.75)]"><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-500">Thoughtful</p><p className="mt-1 font-bold text-slate-800 dark:text-slate-100">Moss!Lantern47</p><p className="mt-1 text-[10px] text-slate-500">Longer, mixed, personal</p></div></div>
            </article>

            <article className="glass-card rounded-[1.65rem] p-4 sm:rounded-[2rem] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Your safer routine</p><h2 className="display-face mt-2 text-3xl text-slate-800 dark:text-white">Make the strong choice easier to repeat.</h2></div><button onClick={() => setMoreOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-xl border border-white/70 bg-white/30 px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">Details <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} /></button></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">{[{ n: "01", t: "Use a manager", d: "Let it remember unique long passwords." }, { n: "02", t: "Keep secrets unique", d: "One leaked password should stay isolated." }, { n: "03", t: "Add two-step sign-in", d: "A second proof reduces takeover risk." }].map((item) => <div key={item.n} className="rounded-2xl border border-white/65 bg-white/25 p-4 dark:border-white/10 dark:bg-white/5"><span className="text-xs font-extrabold" style={{ color: activePalette.color }}>{item.n}</span><p className="mt-4 text-sm font-extrabold text-slate-700 dark:text-slate-100">{item.t}</p><p className="mt-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{item.d}</p></div>)}</div>
              {moreOpen && <div className="mt-4 rounded-2xl border border-dashed border-slate-300/80 bg-white/30 p-4 text-xs leading-5 text-slate-600 dark:border-slate-600 dark:bg-black/10 dark:text-slate-300">Password Atlas does not replace a password manager’s breach monitoring. Its purpose is to help you spot easy-to-avoid patterns before you use a password.</div>}
            </article>
          </section>
        </main>

        <footer className="mt-5 flex flex-col gap-4 border-t border-slate-300/60 py-6 text-[11px] text-slate-500 sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:py-7 dark:border-white/10 dark:text-slate-400"><p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0" style={{ color: activePalette.color }} />Passwords are analysed in your browser. They are never submitted.</p><div className="flex flex-wrap items-center gap-2"><span className="mr-1 font-bold uppercase tracking-[0.14em]">Accent</span>{palettes.map((palette, index) => <button key={palette.name} onClick={() => setPaletteIndex(index)} title={`${palette.name} palette`} aria-label={`Use ${palette.name} palette`} className={`h-6 w-6 rounded-full border-2 transition hover:scale-110 sm:h-5 sm:w-5 ${paletteIndex === index ? "border-slate-700 dark:border-white" : "border-white/80 dark:border-white/20"}`} style={{ backgroundColor: palette.color }} />)}</div><p>Made for mindful secrets.</p></footer>
      </div>
    </div>
  );
}
