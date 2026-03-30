import { useState, useCallback, useEffect, useRef } from "react";
import { catColors, allQuestions } from "./data/quizData.js";
import {
  shuffle,
  checkAnswer,
  selectQuestions,
  genId,
  lvlLabels,
  lvlEmojis,
  lvlPts,
} from "./data/utils.js";
import DetailCard from "./components/DetailCard.jsx";
import Confetti from "./components/Confetti.jsx";
import "./styles.css";

function loadLeaderboard() {
  try {
    const stored = JSON.parse(localStorage.getItem("quiz_lb") || "[]");
    stored.sort((a, b) => b.pct - a.pct || b.score - a.score);
    return stored;
  } catch {
    return [];
  }
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState("");
  const [selOpt, setSelOpt] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [results, setResults] = useState([]);
  const [qCount, setQCount] = useState(0);
  const [lb, setLb] = useState([]);
  const [pName, setPName] = useState("");
  const [nameOk, setNameOk] = useState(false);
  const [pRank, setPRank] = useState(null);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [shuffledIntrus, setShuffledIntrus] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const revealCalledRef = useRef(false);

  const TIMER_DURATION = { 1: 20, 2: 30, 3: 40 };

  useEffect(() => {
    if (screen === "quiz" && questions[idx]?.type === "jesuis" && !revealed) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [screen, idx, revealed, questions]);

  // Timer
  useEffect(() => {
    if (!timerEnabled || revealed || screen !== "quiz") return;
    const q = questions[idx];
    if (!q) return;
    revealCalledRef.current = false;
    setTimer(TIMER_DURATION[q.level]);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!revealCalledRef.current) {
            revealCalledRef.current = true;
            setRevealed(true);
            // Record 0 points
            const pts = lvlPts[q.level];
            setMaxScore((m) => m + pts);
            setResults((r) => [...r, { ...q, userAnswer: "⏱️ Temps ecoulé", correct: false, pts: 0, answer: q.answer || q.intrus }]);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, timerEnabled, revealed, screen, questions]);

  const prepQ = useCallback((q) => {
    if (q.type === "qcm") setShuffledOpts(shuffle(q.options));
    if (q.type === "intrus") setShuffledIntrus(shuffle(q.items));
  }, []);

  const startQuiz = useCallback((c) => {
    const qs = selectQuestions(allQuestions, catColors, c);
    setQCount(c);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setMaxScore(0);
    setResults([]);
    setAns("");
    setSelOpt(null);
    setRevealed(false);
    setPName("");
    setNameOk(false);
    setPRank(null);
    setReviewMode(false);
    setReviewIdx(0);
    setShowConfetti(false);
    if (qs[0]) prepQ(qs[0]);
    setScreen("quiz");
  }, [prepQ]);

  const q = questions[idx];

  const handleReveal = () => {
    if (!q || revealed) return;
    clearInterval(timerRef.current);
    setRevealed(true);
    if (q.type === "qcm") {
      const ok = selOpt === q.answer;
      setScore((s) => s + (ok ? 1 : 0));
      setMaxScore((m) => m + 1);
      setResults((r) => [...r, { ...q, userAnswer: selOpt, correct: ok, pts: ok ? 1 : 0 }]);
    } else if (q.type === "jesuis") {
      const ok = checkAnswer(ans, q.answer, q.acceptAlt);
      setScore((s) => s + (ok ? 2 : 0));
      setMaxScore((m) => m + 2);
      setResults((r) => [...r, { ...q, userAnswer: ans, correct: ok, pts: ok ? 2 : 0 }]);
    } else if (q.type === "intrus") {
      const ok = selOpt === q.intrus;
      setScore((s) => s + (ok ? 3 : 0));
      setMaxScore((m) => m + 3);
      setResults((r) => [...r, { ...q, userAnswer: selOpt, correct: ok, pts: ok ? 3 : 0, answer: q.intrus }]);
    }
  };

  const nextQ = () => {
    if (idx + 1 >= questions.length) {
      setScreen("results");
      setLb(loadLeaderboard());
      const finalPct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      if (finalPct >= 75) setShowConfetti(true);
      return;
    }
    const ni = idx + 1;
    setIdx(ni);
    setAns("");
    setSelOpt(null);
    setRevealed(false);
    if (questions[ni]) prepQ(questions[ni]);
  };

  const handleNameSubmit = () => {
    if (!pName.trim()) return;
    setNameOk(true);
    const pctVal = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const entry = { name: pName.trim(), score, max: maxScore, pct: pctVal, count: qCount, date: new Date().toISOString().slice(0, 10), id: genId() };
    try {
      const stored2 = JSON.parse(localStorage.getItem("quiz_lb") || "[]");
      stored2.push(entry);
      localStorage.setItem("quiz_lb", JSON.stringify(stored2));
    } catch {}
    const freshLb = loadLeaderboard();
    setLb(freshLb);
    setPRank(freshLb.findIndex((e) => e.id === entry.id) + 1);
  };

  const handleShare = async () => {
    const pctVal = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const text = `\u{1F9E0} Quiz des 100 Concepts\n\u{1F4CA} Score : ${score}/${maxScore} (${pctVal}%)\n\u{1F4DD} ${qCount} questions\n\nTu peux faire mieux ?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Quiz des 100 Concepts", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const lastR = results.length > 0 ? results[results.length - 1] : null;
  const wrongResults = results.filter((r) => !r.correct);

  // ===== HOME =====
  if (screen === "home") {
    return (
      <div className="app">
        <div className="home">
          <div className="home-icon">🧠</div>
          <h1 className="home-title">Quiz des 100 Concepts</h1>
          <p className="home-subtitle">Teste tes connaissances sur les concepts les plus puissants</p>
          <p className="home-label">Combien de questions ?</p>
          {[
            { n: 30, e: "⚡", cls: "btn-30", s: "~15 min" },
            { n: 50, e: "🔥", cls: "btn-50", s: "~25 min" },
            { n: 100, e: "🏆", cls: "btn-100", s: "~45 min" },
          ].map(({ n, e, cls, s }, i) => (
            <button key={n} className={`btn ${cls} animate-in stagger-${i + 1}`} onClick={() => startQuiz(n)}>
              {n} questions {e}
              <div className="btn-sub">{s}</div>
            </button>
          ))}
          <button className="share-btn" style={{ margin: "24px auto 0", display: "flex" }} onClick={() => setTimerEnabled((t) => !t)}>
            {timerEnabled ? "⏱️ Timer activé" : "⏱️ Activer le timer"}
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: timerEnabled ? "#2ecc71" : "#666", marginLeft: 4 }} />
          </button>
          <div className="levels-box animate-in stagger-4">
            <p className="levels-title">3 niveaux :</p>
            <div className="levels-list">
              <div>🟢 <b>Facile</b> — QCM (1 pt)</div>
              <div>🟡 <b>Moyen</b> — « Je suis... » (2 pts)</div>
              <div>🔴 <b>Expert</b> — L'intrus (3 pts)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== REVIEW MODE =====
  if (screen === "review") {
    const wr = wrongResults[reviewIdx];
    if (!wr) { setScreen("results"); return null; }
    return (
      <div className="app">
        <div className="progress-bar">
          <div className="progress-top">
            <span className="progress-count">Révision {reviewIdx + 1}/{wrongResults.length}</span>
            <button className="share-btn" style={{ margin: 0, padding: "4px 12px", fontSize: 12 }} onClick={() => setScreen("results")}>← Retour</button>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((reviewIdx + 1) / wrongResults.length) * 100}%` }} />
          </div>
        </div>
        <div className="q-card animate-scale" style={{ borderLeft: `4px solid ${catColors[wr.theme]}` }}>
          <div className="q-header">
            <span className="q-theme" style={{ color: catColors[wr.theme], background: `${catColors[wr.theme]}22` }}>{wr.theme}</span>
          </div>
          <p className="q-text">{wr.question || `Trouve l'intrus parmi : ${wr.items?.join(", ")}`}</p>
          <div className="feedback-box wrong">
            <div className="feedback-title" style={{ color: "var(--red)" }}>Ta réponse : {wr.userAnswer || "—"}</div>
            <div className="feedback-answer">Bonne réponse : <b>{wr.answer || wr.intrus}</b></div>
            {wr.explain && <p className="feedback-explain">{wr.explain}</p>}
          </div>
          <DetailCard q={wr} />
        </div>
        <div className="actions">
          <button className="btn-success" onClick={() => {
            if (reviewIdx + 1 >= wrongResults.length) setScreen("results");
            else setReviewIdx((i) => i + 1);
          }}>
            {reviewIdx + 1 >= wrongResults.length ? "Terminer la révision ✓" : "Suivant →"}
          </button>
        </div>
      </div>
    );
  }

  // ===== RESULTS =====
  if (screen === "results") {
    const grade = pct >= 90 ? { e: "🏆", l: "Extraordinaire !", c: "#f5a623" } : pct >= 75 ? { e: "🌟", l: "Excellent !", c: "#2ecc71" } : pct >= 60 ? { e: "👏", l: "Très bien !", c: "#4ecdc4" } : pct >= 40 ? { e: "💪", l: "Pas mal !", c: "#7b61ff" } : { e: "📚", l: "Continue !", c: "#e8453c" };
    const themeScores = {};
    results.forEach((r) => {
      if (!themeScores[r.theme]) themeScores[r.theme] = { s: 0, m: 0 };
      themeScores[r.theme].s += r.pts;
      themeScores[r.theme].m += lvlPts[r.level];
    });

    return (
      <div className="app results">
        <Confetti active={showConfetti} />
        <div className="results-header">
          <div className="results-grade-icon">{grade.e}</div>
          <h2 className="results-grade-label" style={{ color: grade.c }}>{grade.l}</h2>
          <div className="results-score">{score}<span>/{maxScore} pts</span></div>
          <div className="results-pct">{pct}%</div>
          <button className={`share-btn ${copied ? "copied" : ""}`} onClick={handleShare}>
            {copied ? "✓ Copié !" : "📤 Partager mon score"}
          </button>
        </div>

        <div className="lb-section animate-in">
          <h3 className="lb-title">🏅 Classement</h3>
          {!nameOk ? (
            <div>
              <p style={{ color: "#aaa", fontSize: 13, marginBottom: 10, textAlign: "center" }}>Entre ton nom :</p>
              <div className="lb-input-row">
                <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()} placeholder="Prénom..." maxLength={20} className="lb-input" />
                <button onClick={handleNameSubmit} disabled={!pName.trim()} className="lb-submit" style={{ background: pName.trim() ? "var(--gradient-main)" : undefined, color: pName.trim() ? "#fff" : undefined }}>OK</button>
              </div>
            </div>
          ) : (
            <div>
              {pRank && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: "#aaa" }}>Tu es classé</div>
                  <div className="animate-bounce" style={{ fontSize: 36, fontWeight: 800, color: pRank <= 3 ? "#f5a623" : "#7b61ff" }}>
                    {pRank <= 3 ? ["🥇", "🥈", "🥉"][pRank - 1] : `#${pRank}`}
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>sur {lb.length} joueur{lb.length > 1 ? "s" : ""}</div>
                </div>
              )}
              {lb.slice(0, 15).map((e, i) => {
                const isMe = e.name === pName.trim() && e.score === score;
                return (
                  <div key={i} className={`lb-entry ${isMe ? "me" : ""}`}>
                    <span className="lb-rank" style={{ color: i < 3 ? "#f5a623" : "#666" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                    <span className="lb-name" style={{ color: isMe ? "#fff" : "#ccc", fontWeight: isMe ? 700 : 400 }}>{e.name}</span>
                    <span className="lb-pct" style={{ color: e.pct >= 75 ? "#2ecc71" : e.pct >= 50 ? "#f5a623" : "#e8453c" }}>{e.pct}%</span>
                    <span className="lb-detail">{e.score}/{e.max}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {wrongResults.length > 0 && (
          <div style={{ padding: "12px 16px 0" }}>
            <button className="review-btn" onClick={() => { setReviewIdx(0); setScreen("review"); }}>
              📖 Réviser mes {wrongResults.length} erreur{wrongResults.length > 1 ? "s" : ""}
            </button>
          </div>
        )}

        <div className="theme-section">
          <h3 className="theme-title">Par thème</h3>
          {Object.entries(themeScores).map(([t, d]) => {
            const tp = d.m > 0 ? Math.round((d.s / d.m) * 100) : 0;
            return (
              <div key={t} className="theme-row">
                <div className="theme-row-header">
                  <span className="theme-name" style={{ color: catColors[t] }}>{t}</span>
                  <span>{d.s}/{d.m} ({tp}%)</span>
                </div>
                <div className="theme-bar">
                  <div className="theme-bar-fill" style={{ width: `${tp}%`, background: catColors[t] }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "8px 16px" }}>
          <h3 className="theme-title">Détail</h3>
          {results.map((r, i) => (
            <div key={i} className="result-item" style={{ borderLeft: `3px solid ${r.correct ? "#2ecc71" : "#e8453c"}` }}>
              <div className="result-item-header">
                <span className="result-concept">{lvlEmojis[r.level]} {r.answer || r.intrus}</span>
                <span className="result-pts" style={{ color: r.correct ? "#2ecc71" : "#e8453c" }}>{r.correct ? `+${r.pts}pt${r.pts > 1 ? "s" : ""}` : "0pt"}</span>
              </div>
              {!r.correct && <div className="result-wrong">Ta réponse : <span>{r.userAnswer || "—"}</span></div>}
              {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="result-link" style={{ color: catColors[r.theme] }}>📖 En savoir plus →</a>}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 16px 40px", textAlign: "center" }}>
          <button className="btn-primary" onClick={() => setScreen("home")}>Rejouer 🔄</button>
        </div>
      </div>
    );
  }

  // ===== QUIZ =====
  if (!q) return null;
  const prog = ((idx + 1) / questions.length) * 100;

  return (
    <div className="app">
      <div className="progress-bar">
        <div className="progress-top">
          <span className="progress-count">{idx + 1}/{questions.length}</span>
          {timerEnabled && !revealed && timer !== null && (
            <div className="timer">
              <div className="timer-circle" style={{
                borderColor: timer > 10 ? "#2ecc71" : timer > 5 ? "#f5a623" : "#e8453c",
                color: timer > 10 ? "#2ecc71" : timer > 5 ? "#f5a623" : "#e8453c",
                animation: timer <= 5 ? "pulse 0.5s ease infinite" : "none",
              }}>{timer}</div>
            </div>
          )}
          <div className="progress-score">{score} <span>pts</span></div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${prog}%` }} />
        </div>
      </div>

      <div className="q-card animate-scale" key={idx} style={{ borderLeft: `4px solid ${catColors[q.theme]}` }}>
        <div className="q-header">
          <span className="q-theme" style={{ color: catColors[q.theme], background: `${catColors[q.theme]}22` }}>{q.theme}</span>
          <span className="q-level" style={{ color: q.level === 1 ? "#2ecc71" : q.level === 2 ? "#f5a623" : "#e8453c" }}>
            {lvlEmojis[q.level]} {lvlLabels[q.level]} · {lvlPts[q.level]}pt{lvlPts[q.level] > 1 ? "s" : ""}
          </span>
        </div>
        <div className="q-type">{q.type === "qcm" ? "QCM" : q.type === "jesuis" ? "Devinette « Je suis... »" : "🧩 Trouve l'intrus"}</div>

        {/* QCM */}
        {q.type === "qcm" && (
          <>
            <p className="q-text">{q.question}</p>
            {shuffledOpts.map((opt, i) => {
              const isSel = selOpt === opt;
              const isOk = revealed && opt === q.answer;
              const isBad = revealed && isSel && opt !== q.answer;
              let cls = "option-btn";
              if (isOk) cls += " correct";
              else if (isBad) cls += " wrong";
              else if (isSel) cls += " selected";
              return (
                <button key={i} className={`${cls} animate-in stagger-${i + 1}`} onClick={() => !revealed && setSelOpt(opt)} disabled={revealed}>
                  <span className="option-letter">{String.fromCharCode(65 + i)}.</span>{opt}{isOk && " ✓"}{isBad && " ✗"}
                </button>
              );
            })}
          </>
        )}

        {/* JE SUIS */}
        {q.type === "jesuis" && (
          <>
            <p className="q-text">{q.question}</p>
            <input ref={inputRef} type="text" value={ans} onChange={(e) => setAns(e.target.value)} placeholder="Le nom du concept..." disabled={revealed} onKeyDown={(e) => e.key === "Enter" && !revealed && ans.trim() && handleReveal()} autoComplete="off" spellCheck="false" className={`text-input ${revealed ? (lastR?.correct ? "correct" : "wrong") : ""}`} />
            <p className="text-hint">💡 L'orthographe approximative est acceptée</p>
          </>
        )}

        {/* INTRUS */}
        {q.type === "intrus" && (
          <>
            <p className="q-text">Lequel <b style={{ color: "#e8453c" }}>n'appartient pas</b> au groupe ?</p>
            <p style={{ color: "#666", fontSize: 12, marginBottom: 16 }}>3 partagent un thème. Un seul est l'intrus.</p>
            <div className="intrus-grid">
              {shuffledIntrus.map((item, i) => {
                const isSel = selOpt === item;
                const isIntrus = revealed && item === q.intrus;
                const isBad = revealed && isSel && item !== q.intrus;
                const isGood = revealed && !isSel && item !== q.intrus;
                let cls = "intrus-btn";
                if (isIntrus) cls += " is-intrus";
                else if (isBad) cls += " is-wrong";
                else if (isSel) cls += " selected";
                else if (isGood) cls += " is-good";
                return (
                  <button key={i} className={`${cls} animate-in stagger-${i + 1}`} onClick={() => !revealed && setSelOpt(item)} disabled={revealed}>
                    {item}{isIntrus && <div className="intrus-label">← L'intrus</div>}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className={`feedback-box ${lastR?.correct ? "correct" : "wrong"}`}>
                <div className="feedback-title" style={{ color: lastR?.correct ? "var(--green)" : "var(--red)" }}>{lastR?.correct ? "✓ Bien trouvé ! +3 pts" : "✗ Raté !"}</div>
                <p className="feedback-explain">{q.explain}</p>
              </div>
            )}
          </>
        )}

        {revealed && q.type === "jesuis" && (
          <div className={`feedback-box ${lastR?.correct ? "correct" : "wrong"}`}>
            <div className="feedback-title" style={{ color: lastR?.correct ? "var(--green)" : "var(--red)" }}>{lastR?.correct ? `✓ +${lastR.pts} pts` : "✗ Mauvaise réponse"}</div>
            <div className="feedback-answer">Réponse : <b>{q.answer}</b></div>
          </div>
        )}

        {revealed && q.type === "qcm" && (
          <div className={`feedback-box ${lastR?.correct ? "correct" : "wrong"} animate-in`} style={{ marginTop: 4 }}>
            <div className="feedback-title" style={{ color: lastR?.correct ? "var(--green)" : "var(--red)" }}>{lastR?.correct ? "✓ Bonne réponse ! +1 pt" : "✗ Raté !"}</div>
          </div>
        )}

        {revealed && <DetailCard q={q} />}
      </div>

      <div className="actions">
        {!revealed ? (
          <button className="btn-primary" onClick={handleReveal} disabled={q.type === "jesuis" ? !ans.trim() : !selOpt}>Valider ✓</button>
        ) : (
          <button className="btn-success" onClick={nextQ}>{idx + 1 >= questions.length ? "Voir les résultats 🏆" : "Suivante →"}</button>
        )}
      </div>
    </div>
  );
}
