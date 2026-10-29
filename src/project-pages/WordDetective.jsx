import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Breadcrumb from "../shared/Breadcrumb.jsx";
import { EMBED } from "../../Stanfords/WordDetective/data.js";
import "../../Stanfords/WordDetective/WordDetective.css";

const DATA = EMBED.a.map((ai, index) => ({ q: EMBED.q[index], ai, human: EMBED.h[index] }));
const caches = {};
const stem = (word) => {
  if (word.length > 4 && /ing$/.test(word)) word = word.slice(0, -3);
  else if (word.length > 3 && /ed$/.test(word)) word = word.slice(0, -2);
  else if (word.length > 3 && /es$/.test(word) && /(s|x|ch|sh)es$/.test(word)) word = word.slice(0, -2);
  else if (word.length > 3 && /s$/.test(word) && !/ss$/.test(word)) word = word.slice(0, -1);
  if (/e$/.test(word) && word.length > 3) word = word.slice(0, -1);
  return word;
};
const norm = (word, mode) => {
  if (mode === "exact") return word;
  word = word.toLowerCase();
  if (mode === "case") return word;
  word = word.replace(/’/g, "'").replace(/'s$/, "");
  return stem(word);
};
const tokens = (text) => text.match(/[\w'’]+/g) || [];
function build(mode) {
  if (caches[mode]) return caches[mode];
  const counts = { ai: {}, hu: {}, nAI: 0, nHU: 0 };
  DATA.forEach(({ ai, human }) => {
    tokens(ai).forEach((word) => {
      const key = norm(word, mode);
      counts.ai[key] = (counts.ai[key] || 0) + 1;
      counts.nAI++;
    });
    tokens(human).forEach((word) => {
      const key = norm(word, mode);
      counts.hu[key] = (counts.hu[key] || 0) + 1;
      counts.nHU++;
    });
  });
  caches[mode] = counts;
  return counts;
}
const probs = (counts, word, smooth) => {
  const a = counts.ai[word] || 0, h = counts.hu[word] || 0;
  return smooth
    ? { a, h, pa: (a + 1) / (counts.nAI + 2), ph: (h + 1) / (counts.nHU + 2) }
    : { a, h, pa: a / (counts.nAI || 1), ph: h / (counts.nHU || 1) };
};
const pct = (value) => `${(value * 100).toFixed(value < 0.001 ? 3 : 2)}%`;

function Fraction({ top, bottom }) {
  return <span className="fr"><span>{top}</span><span>{bottom}</span></span>;
}

function ThemeButton() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", current === "dark" ? "light" : "dark");
  };
  return <button id="theme" aria-label="Toggle theme" onClick={toggleTheme}>◐</button>;
}

function WordDetective() {
  const [word, setWord] = useState("like");
  const [match, setMatch] = useState("canon");
  const [smooth, setSmooth] = useState(1);
  const [direction, setDirection] = useState("ai");
  const [query, setQuery] = useState("");
  const [minimum, setMinimum] = useState(5);
  const [questionQuery, setQuestionQuery] = useState("");
  const [questionLimit, setQuestionLimit] = useState(20);
  const counts = useMemo(() => build(match), [match]);
  const searchWord = word.trim(), key = norm(searchWord, match);
  const stats = searchWord ? probs(counts, key, smooth) : null;
  const ratio = stats && (stats.ph ? stats.pa / stats.ph : Infinity);
  const entries = useMemo(() => {
    const allWords = new Set([...Object.keys(counts.ai), ...Object.keys(counts.hu)]);
    const filtered = [...allWords].map((w) => {
      const result = probs(counts, w, smooth);
      return { ...result, w, gap: result.pa - result.ph };
    }).filter((result) => result.a + result.h >= minimum && (!query.trim() || result.w.includes(query.trim().toLowerCase())));
    filtered.sort((a, b) => direction === "ai" ? b.gap - a.gap : a.gap - b.gap);
    return filtered;
  }, [counts, smooth, minimum, query, direction]);
  const shownEntries = entries.slice(0, 25);
  const maxProbability = Math.max(0, ...shownEntries.flatMap((entry) => [entry.pa, entry.ph]));
  const questions = useMemo(() => {
    const term = questionQuery.trim().toLowerCase();
    return DATA.filter((record) => !term || `${record.q} ${record.ai} ${record.human}`.toLowerCase().includes(term));
  }, [questionQuery]);
  const questionRows = questions.slice(0, questionLimit);
  const formatFormula = (label, count, total, value, tone) => (
    <div className="fm" key={label}>
      <i>P(W | {label})</i> ≈ {smooth
        ? <><Fraction top={`count(W | ${label}) + 1`} bottom="n + 2" /> = <Fraction top={`${count} + 1`} bottom={`${total} + 2`} /></>
        : <><Fraction top={`count(W | ${label})`} bottom="n" /> = <Fraction top={count} bottom={total} /></>}
      {" = "}<b className={tone}>{value.toFixed(3)}</b>
    </div>
  );

  return (
    <>
      <nav><b>🔎 Word Detective</b><a href="#overview">Overview</a><a href="#how">How it works</a><a href="#explore">Explore words</a><a href="#questions">Questions</a><ThemeButton /></nav>
      <main>
        <Breadcrumb current="Word Detective" />
        <div className="hero" id="overview">
          <h1>Can you spot an AI by its words?</h1>
          <p>Word Detective compares how often each word shows up in AI-written answers versus human-written ones, then ranks the words that give the writer away.</p>
          <a className="btn" href="#explore">Start exploring</a>
        </div>
        <section id="how">
          <h2>How it works</h2><p className="sub">Three ideas, no heavy math required.</p>
          <div className="card">
            <p><b>1. Two events.</b> <code>AI</code> means “this word was written by an AI”; <code>Human</code> means “written by a person.” <code>W</code> means “the word is the one we’re studying.”</p>
            <p><b>2. Count every occurrence.</b> For each group we ask: out of all the words in these answers, what fraction is our word? That gives <code>P(W | AI)</code> and <code>P(W | Human)</code>.</p>
            <p><b>3. Smooth the extremes.</b> Laplace smoothing pretends we saw one extra “hit” and one extra “miss” in each group, so no word is ever literally impossible.</p>
            <p style={{ marginBottom: 0 }}><b>The recipe is identical for every word</b>; only the word being counted changes.</p>
          </div>
        </section>
        <section id="data">
          <h2>The answers we’re using</h2>
          <p className="sub">Each question has one human answer and one AI answer, labeled by author.</p>
          <div className="card"><div className="note" style={{ margin: 0 }}>Using the full dataset: {DATA.length.toLocaleString()} questions, each answered once by a human and once by an AI ({DATA.length.toLocaleString()} answers per group).</div></div>
        </section>
        <section id="explore">
          <h2>Explore words</h2><p className="sub">Pick a word and your counting rules, then see the fingerprint.</p>
          <div className="card">
            <div className="row">
              <label>Word<input type="text" value={word} autoComplete="off" autoCapitalize="none" onChange={(event) => setWord(event.target.value)} /></label>
              <label>Matching<select value={match} onChange={(event) => setMatch(event.target.value)}><option value="exact">Exact match</option><option value="case">Ignore case</option><option value="canon">Canonicalize (likes, liked…)</option></select></label>
              <label>Zeros and ones<select value={smooth} onChange={(event) => setSmooth(Number(event.target.value))}><option value="0">Leave as is</option><option value="1">Laplace smoothing</option></select></label>
            </div>
            <div className="stats">
              {!stats ? <p className="note">Type a word above.</p> : <>
                <div className="stat"><small>P(W | AI)</small><big className="ai">{pct(stats.pa)}</big><small>{stats.a} of {counts.nAI} AI words</small></div>
                <div className="stat"><small>P(W | Human)</small><big className="hu">{pct(stats.ph)}</big><small>{stats.h} of {counts.nHU} human words</small></div>
                <div className="stat"><small>Ratio AI ÷ Human</small><big>{Number.isFinite(ratio) ? `${ratio.toFixed(1)}×` : "∞"}</big><small>{ratio > 1 ? "AI uses it more" : ratio < 1 ? "Humans use it more" : "No difference"}</small></div>
              </>}
            </div>
            <div className="formula">
              <div className="legend"><i>AI</i> = text is AI-written &nbsp;·&nbsp; <i>Human</i> = text is human-written &nbsp;·&nbsp; <i>W</i> = the word we’re counting &nbsp;·&nbsp; <i>n</i> = total words in that group</div>
              {stats && <>{formatFormula("AI", stats.a, counts.nAI, stats.pa, "ai")}{formatFormula("Human", stats.h, counts.nHU, stats.ph, "hu")}</>}
              <div className="note">Course result on the full dataset: “like” appeared 1,006 times in 60,614 AI words and 192 times in 55,922 human words, so (1006 + 1) ÷ (60614 + 2) ≈ 0.017 versus (192 + 1) ÷ (55922 + 2) ≈ 0.003.</div>
            </div>
          </div>
        </section>
        <section id="results">
          <h2>All words: AI vs Human</h2><p className="sub">Sorted by the size of the gap between the two probabilities.</p>
          <div className="card">
            <div className="row" style={{ alignItems: "end" }}>
              <div className="seg"><button className={direction === "ai" ? "on" : ""} onClick={() => setDirection("ai")}>AI-leaning</button><button className={direction === "hu" ? "on" : ""} onClick={() => setDirection("hu")}>Human-leaning</button></div>
              <label>Search a word<input type="text" placeholder="e.g. imagine" value={query} autoComplete="off" autoCapitalize="none" onChange={(event) => setQuery(event.target.value)} /></label>
              <label>Minimum total uses<select value={minimum} onChange={(event) => setMinimum(Number(event.target.value))}><option value="1">1</option><option value="5">5</option><option value="20">20</option></select></label>
            </div>
            <div className="tw"><table><thead><tr><th>Word</th><th>P(W | AI)<small>Chance a word is this one in AI text</small></th><th>P(W | Human)<small>Same, in human text</small></th><th>Gap<small>AI minus Human</small></th><th>Leans</th><th style={{ minWidth: 110 }}>Chart</th></tr></thead>
              <tbody>{shownEntries.length ? shownEntries.map((entry) => <tr key={entry.w}>
                <td><b>{entry.w}</b></td><td>{pct(entry.pa)}</td><td>{pct(entry.ph)}</td><td>{entry.gap > 0 ? "+" : ""}{pct(entry.gap)}</td>
                <td>{entry.gap > 0 ? <span className="tag ai">AI</span> : entry.gap < 0 ? <span className="tag hu">Human</span> : "—"}</td>
                <td><div className="bar"><i style={{ width: `${maxProbability ? entry.pa / maxProbability * 100 : 0}%`, background: "var(--ai)" }} /><i style={{ width: `${maxProbability ? entry.ph / maxProbability * 100 : 0}%`, background: "var(--hu)" }} /></div></td>
              </tr>) : <tr><td colSpan="6">No words match.</td></tr>}</tbody>
              </table></div>
            <div className="note">Showing {shownEntries.length} of {entries.length} words. Orange bars are AI, teal bars are human.</div>
          </div>
        </section>
        <section id="questions">
          <h2>All the questions</h2><p className="sub">Every question in the dataset, with the human answer and the AI answer side by side.</p>
          <div className="card">
            <div className="row"><label>Search questions or answers<input type="text" placeholder="e.g. battery" value={questionQuery} autoComplete="off" autoCapitalize="none" onChange={(event) => { setQuestionQuery(event.target.value); setQuestionLimit(20); }} /></label></div>
            <div className="note" style={{ margin: "0 0 10px" }}>Showing {Math.min(questionLimit, questions.length)} of {questions.length} questions.</div>
            <div>{questionRows.length ? questionRows.map((record, index) => <div className="qi" key={`${index}-${record.q}`}><h3>{record.q}</h3><div className="qc"><div><b className="hu">HUMAN</b>{record.human}</div><div><b className="ai">AI</b>{record.ai}</div></div></div>) : <p className="note">No questions match.</p>}</div>
            {questionLimit < questions.length && <button className="btn" style={{ marginTop: 14 }} onClick={() => setQuestionLimit((limit) => limit + 20)}>Show more</button>}
          </div>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<WordDetective />);
