import { useState } from "react";
import { createRoot } from "react-dom/client";
import Breadcrumb from "../shared/Breadcrumb.jsx";
import "../../Stanfords/InferenceTimeCalc/InferenceTimeCalc.css";

const need = (p, t) => {
  if (p <= 0 || p >= 1) return NaN;
  let n = Math.max(1, Math.ceil(Math.log(1 - t) / Math.log(1 - p) - 1e-9));
  while (n > 1 && (1 - p) ** (n - 1) <= 1 - t) n--;
  while ((1 - p) ** n > 1 - t) n++;
  return n;
};
const success = (p, n) => 1 - (1 - p) ** n;
const pct = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const tp = (value) => `${(value * 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
const nf = (value, digits) => Number(value).toFixed(digits);

function Fraction({ top, bottom }) {
  return <span className="fr"><span>{top}</span><span>{bottom}</span></span>;
}

function FormulaRow({ symbol, children, why }) {
  return (
    <div className="row">
      <div className="sym">{symbol}</div>
      <div><div className="mt">{children}</div>{why && <div className="why">{why}</div>}</div>
    </div>
  );
}

function CalculatorChart({ p, t, n, N, target }) {
  const W = 640, H = 260, L = 44, R = 14, top = 12, B = 30;
  const maxN = Math.max(20, Math.ceil(N * 1.25), n);
  const x = (i) => L + ((W - L - R) * i) / maxN;
  const y = (v) => top + (H - top - B) * (1 - v);
  const step = Math.ceil(maxN / 8);
  const path = Array.from({ length: maxN + 1 }, (_, k) =>
    `${k ? "L" : "M"}${x(k).toFixed(1)} ${y(success(p, k)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Chart of copies against probability of at least one success">
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke="var(--line)" />
          <text x={L - 6} y={y(g) + 4} textAnchor="end">{Math.round(g * 100)}%</text>
        </g>
      ))}
      {Array.from({ length: Math.floor(maxN / step) + 1 }, (_, k) => k * step).map((i) =>
        <text key={i} x={x(i)} y={H - 10} textAnchor="middle">{i}</text>)}
      <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--warn)" strokeDasharray="5 4" />
      <text x={W - R} y={y(t) - 5} textAnchor="end">target {target}%</text>
      <path d={path} fill="none" stroke="var(--acc)" strokeWidth="2.5" />
      <circle cx={x(N)} cy={y(success(p, N))} r="5" fill="var(--ok)" />
      <text x={x(N) + 8} y={y(success(p, N)) + 16}>{N} copies</text>
      <circle cx={x(n)} cy={y(success(p, n))} r="4" fill="var(--card)" stroke="var(--acc)" strokeWidth="2" />
    </svg>
  );
}

function ThemeButton() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", current === "dark" ? "light" : "dark");
  };
  return <button id="theme" aria-label="Toggle theme" onClick={toggleTheme}>◐</button>;
}

function InferenceTimeCalc() {
  const [probability, setProbability] = useState(15.9);
  const [target, setTarget] = useState(99.9);
  const [copies, setCopies] = useState(10);
  const p = probability / 100, t = target / 100, N = need(p, t), q = 1 - p;
  const e = success(p, copies), f = 1 - t;
  const pp = nf(p, 3), qq = nf(q, 3), fs = String(+f.toPrecision(6)), ts = String(+t.toPrecision(6));
  const lnf = Math.log(f), lnq = Math.log(q), raw = lnf / lnq;
  const setFromRange = (value) => setProbability(Math.min(99, Math.max(0.1, Number(value) || 0.1)));
  const setFromNumber = (value) => setProbability(Math.min(99, Math.max(0.1, Number(value) || 0.1)));
  const calculations = [
    { symbol: "E", body: <>at least one copy fixes the bug</>, why: "what we want: P(E)" },
    { symbol: <>F<sub>1</sub></>, body: <>copy 1 fixes the bug</>, why: `P(F₁) = ${pp}` },
    { symbol: <>F<sub>2</sub></>, body: <>copy 2 fixes the bug</>, why: `P(F₂) = ${pp}` },
    { symbol: "⋮", body: <>one event per copy</>, why: `P(Fᵢ) = ${pp} for every copy` },
    { symbol: "OR", body: <>E = F<sub>1</sub> or F<sub>2</sub> or ⋯ or F<sub>n</sub></>, why: "OR is easy only when the events can’t both happen. Two copies can both fix the bug, so adding counts “both” twice." },
    { symbol: "AND", body: <>E<sup>C</sup> = F<sub>1</sub><sup>C</sup> and F<sub>2</sub><sup>C</sup> and ⋯ and F<sub>n</sub><sup>C</sup></>, why: <>at least one fixes it = not all fail, so P(E) = 1 − P(E<sup>C</sup>)</> },
    { symbol: "×", body: <>P(E<sup>C</sup>) = P(F<sub>1</sub><sup>C</sup>)·P(F<sub>2</sub><sup>C</sup>)⋯P(F<sub>n</sub><sup>C</sup>) = (1 − {pp})<sup>n</sup> = {qq}<sup>n</sup></>, why: "independent: multiply" },
    { symbol: "=", body: <>P(E) = 1 − {qq}<sup>n</sup></> },
  ];
  const steps = [
    { symbol: "1", body: <>P(E) = 1 − {qq}<sup>n</sup> ≥ {ts}</>, why: "our rule, at least your target" },
    { symbol: "2", body: <>{qq}<sup>n</sup> ≤ {fs}</>, why: `the chance that all n copies fail can be at most ${fs}` },
    { symbol: "3", body: <>n ≥ log<sub>{qq}</sub> {fs}</>, why: `the logarithm counts how many times you multiply by ${qq} to get from 1 down to ${fs}` },
    { symbol: "4", body: <>n = ⌈ <Fraction top={`ln ${fs}`} bottom={`ln ${qq}`} /> ⌉ = ⌈ <Fraction top={nf(lnf, 4)} bottom={nf(lnq, 4)} /> ⌉ = ⌈ {nf(raw, 1)} ⌉ = <b>{N}</b></>, why: "any log button works if you divide; round up, since you need at least the target" },
    { symbol: "★", body: <>n = ⌈ <Fraction top="ln(1 − target)" bottom={<>ln(1 − P(F<sub>i</sub>))</>} /> ⌉</>, why: "for any inputs: this is what the calculator computes" },
  ];
  const rows = Array.from({ length: N }, (_, index) => {
    const k = index + 1, failed = q ** k;
    return { k, failed };
  });
  const shownRows = N <= 9 ? rows : [...rows.slice(0, 5), null, ...rows.slice(-3)];
  const scenarios = [["Your case", p, t], ["A better model", 0.3, t], ["Target 99%", p, 0.99], ["Target 99.9%", p, 0.999]];

  return (
    <main>
      <div className="top"><Breadcrumb current="Inference Time Calculator" /><ThemeButton /></div>
      <header>
        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <rect width="52" height="52" rx="14" fill="var(--acc)" />
          <path d="M9 40 C20 38 24 20 43 11" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="43" cy="11" r="3.5" fill="#fff" />
        </svg>
        <h1>Inference Time Calculator</h1>
      </header>
      <p className="lead">How many copies of an AI model should you run so that <b>at least one</b> of them solves the problem? Set how often one copy succeeds and how sure you want to be.</p>
      <article className="art">
        <p className="kick">Inference time</p>
        <h2>How many copies of an AI model until one fixes the bug?</h2>
        <p className="sub">A small calculator, and the one idea behind it: at least one success means not every attempt fails.</p>
        <p className="by">A short explainer with a working tool. Free, no sign-up, and everything runs in your browser.</p>
        <p>Point a language model at a real bug and it will often get it wrong. Then comes the obvious question: if one attempt only works some of the time, how many attempts should I run?</p>
        <p>Retrying, adding context and rewording the prompt all keep the same model and spend more effort while it answers. That effort is called <i>inference time</i>. The simplest way to spend it is to run several independent copies at once and stop the moment one of them works. I built this calculator to turn “one copy fixes this about 16% of the time” into a concrete number of copies, with every step visible so you can check it yourself.</p>
        <h3>The idea in one line</h3>
        <p>Getting at least one fix is the opposite of every copy failing. If one copy succeeds with probability p, and the copies don’t influence each other, the chance that all n of them fail is (1 − p) multiplied by itself n times. Take that away from 1 and you have the answer.</p>
        <blockquote><span className="f">P(at least one fix) = 1 − (1 − p)<sup>n</sup></span><span className="f">n = ⌈ ln(1 − target) / ln(1 − p) ⌉</span></blockquote>
        <p>The second line solves the first for n. It is rounded up because you can only run whole copies, and you need to at least reach your target.</p>
        <h3>The numbers behind it</h3>
        <p>The default p of 0.159 is the one-try rate of DeepSeek-Coder-V2-Instruct on real GitHub bugs (SWE-bench Lite), reported in Brown et al., “Large Language Monkeys” (2024). With it, the page shows the full derivation in events, the algebra, a table of copies against failure chance, and a graph with your target drawn as a line.</p>
        <h3>What surprised me</h3>
        <ul><li>“One in six, so six copies” is wrong. At 0.159, six copies give about 64.6%, not 100%.</li><li>Each extra copy helps less than the one before, and no number of copies ever reaches 100%.</li><li>A better model pays off quickly. For a 99.9% target you need 40 copies at 0.159 but only 20 at 0.300.</li></ul>
        <h3>Where the model breaks down</h3>
        <ul><li><b>Independence is an assumption.</b> If the model keeps making the same mistake, extra copies are not fresh tries, and real results will be worse than the formula says.</li><li><b>One p for every bug is a simplification.</b> Real problems vary in difficulty, so real curves are usually shallower than this idealized one.</li><li><b>You still need a way to pick the winner.</b> The calculator tells you when a correct answer probably exists among the copies, not which one it is. Tests or another verifier turn that into an actual fix.</li><li><b>Cost grows with the number of copies.</b> It counts attempts, not dollars or waiting time.</li></ul>
        <p>If you have measured p on your own code, I would like to hear what you found.</p>
        <a className="go" href="#p">Try the calculator ↓</a><hr />
      </article>
      <div className="grid">
        <div className="card">
          <h2>Your inputs</h2>
          <label htmlFor="p">Chance one copy succeeds (p) <b>{pct(p)}</b></label>
          <input type="range" id="p" min="1" max="95" value={Math.min(95, probability)} step="0.1" onChange={(event) => setFromRange(event.target.value)} />
          <label htmlFor="pn">…or type it as a percentage</label>
          <input type="number" id="pn" min="0.1" max="99" step="0.1" value={probability} onChange={(event) => setFromNumber(event.target.value)} />
          <label>How sure do you want to be? <b>{target}%</b></label>
          <div className="seg">{[90, 95, 99, 99.9].map((value) => <button key={value} className={target === value ? "on" : ""} onClick={() => setTarget(value)}>{value}%</button>)}</div>
          <label htmlFor="n">Try a number of copies <b>{copies}</b></label>
          <input type="range" id="n" min="1" max="100" value={copies} step="1" onChange={(event) => setCopies(Number(event.target.value))} />
          <p className="src">0.159 is the one-try rate of DeepSeek-Coder-V2-Instruct on real GitHub bugs (SWE-bench Lite), from Brown et al., “Large Language Monkeys,” 2024.</p>
        </div>
        <div className="card">
          <h2>Result</h2>
          <div className="ans"><div><small>Smallest number of copies</small><div className="big">{N}</div></div><div><small>With {copies} copies</small><div className="big" style={{ fontSize: "clamp(30px, 7vw, 44px)" }}>{pct(e)}</div></div></div>
          <p style={{ margin: "14px 0 0" }}><span className="pill" style={{ background: e >= t ? "var(--ok)" : "var(--warn)", color: "#fff" }}>{e >= t ? "Target met" : "Below target"}</span>{" "}{e >= t ? `${copies} copies reach your ${target}% target.` : `${copies} copies give ${pct(e)}, short of ${target}%. You need ${N}.`}</p>
          <p className="note">Assumes every copy is an independent try. If the model repeats the same mistake, real results will be worse than this.</p>
        </div>
      </div>
      <div className="card"><h2>Chance that at least one copy succeeds</h2><CalculatorChart p={p} t={t} n={copies} N={N} target={target} /></div>
      <div className="card">
        <h2>Write it in events</h2>
        {calculations.map((row, i) => <FormulaRow key={i} symbol={row.symbol} why={row.why}>{row.body}</FormulaRow>)}
        <div className="m" style={{ whiteSpace: "normal", marginTop: 12 }}>With <b>{copies}</b> copies: P(E) = 1 − (1 − {pp})<sup>{copies}</sup> = 1 − {nf(q ** copies, 4)} = <b>{nf(e, 4)}</b><br />Expected number of fixes: {copies} × {pp} = {nf(copies * p, 2)} (an average, not a guarantee).</div>
      </div>
      <div className="card"><h2>The formula, step by step</h2>{steps.map((row, i) => <FormulaRow key={i} symbol={row.symbol} why={row.why}>{row.body}</FormulaRow>)}</div>
      <div className="card">
        <h2>The same count, written out</h2>
        <p className="note" style={{ margin: "0 0 8px" }}>Keep multiplying the chance that every copy so far has failed by {qq}, and stop at the first row at or below {nf(f * 100, 2)}%.</p>
        <table><thead><tr><th>Copies</th><th>All have failed</th><th>At least one fixes it</th><th></th></tr></thead><tbody>
          {shownRows.map((row, i) => row ? <tr key={row.k} className={row.k === N ? "hl" : ""}><td>{row.k}</td><td>{nf(row.failed * 100, 2)}%</td><td>{nf((1 - row.failed) * 100, 2)}%</td><td>{row.k === N ? `✓ at ${nf(f * 100, 2)}%` : ""}</td></tr> : <tr key={`ellipsis-${i}`}><td colSpan="4" style={{ textAlign: "center" }}>⋮</td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <h2>Poke the inputs</h2>
        <table><thead><tr><th>Scenario</th><th>p</th><th>Target</th><th>Copies</th></tr></thead><tbody>{scenarios.map(([name, chance, goal]) => <tr key={name}><td>{name}</td><td>{pct(chance)}</td><td>{tp(goal)}</td><td><b>{need(chance, goal)}</b></td></tr>)}</tbody></table>
        <p className="note">A better model needs fewer copies. Every extra “9” in the target needs many more, and no number of copies reaches 100%.</p>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<InferenceTimeCalc />);
