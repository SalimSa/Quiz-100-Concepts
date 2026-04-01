import { useState, useCallback, useEffect, useRef } from "react";
import { quizzes, getQuiz } from "./data/quizRegistry.js";
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

// ===== AUTH / PROFILE HELPERS =====
function loadUser() {
  try {
    return JSON.parse(localStorage.getItem("quiz_user"));
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("quiz_user", JSON.stringify(user));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("quiz_history") || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem("quiz_history", JSON.stringify(history));
}

function loadLeaderboard() {
  try {
    const stored = JSON.parse(localStorage.getItem("quiz_lb") || "[]");
    stored.sort((a, b) => b.pct - a.pct || b.score - a.score);
    return stored;
  } catch {
    return [];
  }
}

function loadSavedQuiz() {
  try {
    return JSON.parse(localStorage.getItem("quiz_saved"));
  } catch {
    return null;
  }
}

function saveSavedQuiz(data) {
  localStorage.setItem("quiz_saved", JSON.stringify(data));
}

function clearSavedQuiz() {
  localStorage.removeItem("quiz_saved");
}

export default function App() {
  // Auth
  const [user, setUser] = useState(loadUser);
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState("");

  // Navigation
  const [screen, setScreen] = useState(user ? "hub" : "login");
  const [activeQuizId, setActiveQuizId] = useState(null);

  // Quiz state
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

  // History & saved progress
  const [history, setHistory] = useState(loadHistory);
  const [showProfile, setShowProfile] = useState(false);
  const [savedQuiz, setSavedQuiz] = useState(loadSavedQuiz);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const TIMER_DURATION = { 1: 20, 2: 30, 3: 40 };

  const quiz = activeQuizId ? getQuiz(activeQuizId) : null;
  const catColors = quiz?.catColors || {};

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
            const pts = lvlPts[q.level];
            setMaxScore((m) => m + pts);
            setResults((r) => [...r, { ...q, userAnswer: "⏱️ Temps écoulé", correct: false, pts: 0, answer: q.answer || q.intrus }]);
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

  // ===== AUTH HANDLERS =====
  const handleLogin = () => {
    const name = loginName.trim();
    if (!name) { setLoginError("Entre ton prénom"); return; }
    if (name.length < 2) { setLoginError("Minimum 2 caractères"); return; }
    const u = { name, createdAt: new Date().toISOString() };
    saveUser(u);
    setUser(u);
    setLoginError("");
    setScreen("hub");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("quiz_user");
    setLoginName("");
    setScreen("login");
    setShowProfile(false);
  };

  // ===== SAVE & RESUME =====
  const handleSaveAndExit = () => {
    clearInterval(timerRef.current);
    const data = {
      quizId: activeQuizId,
      quizTitle: quiz?.title || "",
      questions,
      idx: revealed ? idx + 1 : idx, // If revealed, save next question index
      score,
      maxScore,
      results,
      qCount,
      timerEnabled,
      savedAt: new Date().toISOString(),
    };
    saveSavedQuiz(data);
    setSavedQuiz(data);
    setShowExitConfirm(false);
    setScreen("hub");
  };

  const resumeQuiz = (saved) => {
    const qz = getQuiz(saved.quizId);
    if (!qz) return;
    setActiveQuizId(saved.quizId);
    setQuestions(saved.questions);
    setIdx(saved.idx);
    setScore(saved.score);
    setMaxScore(saved.maxScore);
    setResults(saved.results);
    setQCount(saved.qCount);
    setTimerEnabled(saved.timerEnabled || false);
    setAns("");
    setSelOpt(null);
    setRevealed(false);
    setPRank(null);
    setReviewMode(false);
    setReviewIdx(0);
    setShowConfetti(false);
    setShowExitConfirm(false);
    if (saved.questions[saved.idx]) prepQ(saved.questions[saved.idx]);
    clearSavedQuiz();
    setSavedQuiz(null);
    setScreen("quiz");
  };

  const handleDiscardSaved = () => {
    clearSavedQuiz();
    setSavedQuiz(null);
  };

  // ===== QUIZ HANDLERS =====
  const startQuiz = useCallback((quizId, count) => {
    const qz = getQuiz(quizId);
    if (!qz) return;
    clearSavedQuiz();
    setSavedQuiz(null);
    setActiveQuizId(quizId);
    const qs = selectQuestions(qz.allQuestions, qz.catColors, count);
    setQCount(count);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setMaxScore(0);
    setResults([]);
    setAns("");
    setSelOpt(null);
    setRevealed(false);
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
      const pts = lvlPts[q.level];
      setScore((s) => s + (ok ? pts : 0));
      setMaxScore((m) => m + pts);
      setResults((r) => [...r, { ...q, userAnswer: ans, correct: ok, pts: ok ? pts : 0 }]);
    } else if (q.type === "intrus") {
      const ok = selOpt === q.intrus;
      setScore((s) => s + (ok ? 3 : 0));
      setMaxScore((m) => m + 3);
      setResults((r) => [...r, { ...q, userAnswer: selOpt, correct: ok, pts: ok ? 3 : 0, answer: q.intrus }]);
    }
  };

  const nextQ = () => {
    if (idx + 1 >= questions.length) {
      // Save to history
      const finalPct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const entry = {
        id: genId(),
        quizId: activeQuizId,
        quizTitle: quiz?.title || "",
        score,
        max: maxScore,
        pct: finalPct,
        count: qCount,
        date: new Date().toISOString().slice(0, 10),
        userName: user?.name || "",
      };
      const newHistory = [entry, ...loadHistory()].slice(0, 50);
      saveHistory(newHistory);
      setHistory(newHistory);

      // Save to leaderboard
      try {
        const stored = JSON.parse(localStorage.getItem("quiz_lb") || "[]");
        stored.push({ ...entry, name: user?.name || "Anonyme" });
        localStorage.setItem("quiz_lb", JSON.stringify(stored));
      } catch {}

      setScreen("results");
      setLb(loadLeaderboard());
      if (finalPct >= 75) setShowConfetti(true);

      const freshLb = loadLeaderboard();
      const rank = freshLb.findIndex((e) => e.id === entry.id) + 1;
      setPRank(rank || null);
      return;
    }
    const ni = idx + 1;
    setIdx(ni);
    setAns("");
    setSelOpt(null);
    setRevealed(false);
    if (questions[ni]) prepQ(questions[ni]);
  };

  const handleShare = async () => {
    const pctVal = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const title = quiz?.title || "Quiz";
    const text = `🧠 ${title}\n📊 Score : ${score}/${maxScore} (${pctVal}%)\n📝 ${qCount} questions\n\nTu peux faire mieux ?`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
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

  // ===== LOGIN SCREEN =====
  if (screen === "login") {
    return (
      <div className="app">
        <div className="login-screen">
          <div className="login-icon">🧠</div>
          <h1 className="login-title">Quiz Platform</h1>
          <p className="login-subtitle">Teste tes connaissances sur des quiz variés</p>
          <div className="login-card animate-in">
            <h2 className="login-card-title">Connexion</h2>
            <p className="login-card-desc">Entre ton prénom pour sauvegarder tes scores</p>
            <input
              type="text"
              value={loginName}
              onChange={(e) => { setLoginName(e.target.value); setLoginError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Ton prénom..."
              maxLength={20}
              className="login-input"
              autoFocus
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="login-btn" onClick={handleLogin} disabled={!loginName.trim()}>
              Commencer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PROFILE SCREEN =====
  if (showProfile) {
    const userHistory = history.filter((h) => h.userName === user?.name);
    const avgPct = userHistory.length > 0 ? Math.round(userHistory.reduce((s, h) => s + h.pct, 0) / userHistory.length) : 0;
    const totalGames = userHistory.length;
    const bestPct = userHistory.length > 0 ? Math.max(...userHistory.map((h) => h.pct)) : 0;

    return (
      <div className="app">
        <div className="profile-screen">
          <div className="profile-header">
            <button className="back-btn" onClick={() => setShowProfile(false)}>← Retour</button>
          </div>
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-since">Membre depuis le {user?.createdAt?.slice(0, 10)}</p>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-value">{totalGames}</div>
              <div className="stat-label">Parties</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgPct}%</div>
              <div className="stat-label">Moyenne</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{bestPct}%</div>
              <div className="stat-label">Meilleur</div>
            </div>
          </div>

          <div className="history-section">
            <h3 className="history-title">Historique</h3>
            {userHistory.length === 0 && (
              <p className="history-empty">Aucune partie jouée pour le moment</p>
            )}
            {userHistory.slice(0, 20).map((h, i) => (
              <div key={i} className="history-item animate-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="history-item-left">
                  <span className="history-quiz-icon">{quizzes.find((qz) => qz.id === h.quizId)?.icon || "📝"}</span>
                  <div>
                    <div className="history-quiz-name">{h.quizTitle || h.quizId}</div>
                    <div className="history-date">{h.date} · {h.count}q</div>
                  </div>
                </div>
                <div className="history-score" style={{ color: h.pct >= 75 ? "#2ecc71" : h.pct >= 50 ? "#f5a623" : "#e8453c" }}>
                  {h.pct}%
                </div>
              </div>
            ))}
          </div>

          <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
        </div>
      </div>
    );
  }

  // ===== QUIZ HUB =====
  if (screen === "hub") {
    return (
      <div className="app">
        <div className="hub-screen">
          <div className="hub-header">
            <div>
              <h1 className="hub-greeting">Salut, {user?.name} 👋</h1>
              <p className="hub-subtitle">Choisis un quiz</p>
            </div>
            <button className="hub-avatar" onClick={() => setShowProfile(true)}>
              {user?.name?.[0]?.toUpperCase() || "?"}
            </button>
          </div>

          {savedQuiz && (
            <div className="saved-quiz-card animate-in">
              <div className="saved-quiz-header">
                <span className="saved-quiz-badge">⏸️ En cours</span>
                <button className="saved-quiz-discard" onClick={handleDiscardSaved}>✕</button>
              </div>
              <div className="saved-quiz-body">
                <span className="saved-quiz-icon">{quizzes.find((qz) => qz.id === savedQuiz.quizId)?.icon || "📝"}</span>
                <div className="saved-quiz-info">
                  <div className="saved-quiz-title">{savedQuiz.quizTitle}</div>
                  <div className="saved-quiz-progress">
                    Question {savedQuiz.idx}/{savedQuiz.qCount} · {savedQuiz.score} pts
                  </div>
                </div>
              </div>
              <button className="saved-quiz-resume" onClick={() => resumeQuiz(savedQuiz)}>
                Reprendre →
              </button>
            </div>
          )}

          <div className="hub-quizzes">
            {quizzes.map((qz, i) => (
              <button
                key={qz.id}
                className={`hub-quiz-card animate-in stagger-${i + 1}`}
                onClick={() => { setActiveQuizId(qz.id); setScreen("home"); }}
              >
                <div className="hub-quiz-icon" style={{ background: qz.gradient }}>{qz.icon}</div>
                <div className="hub-quiz-info">
                  <h3 className="hub-quiz-title">{qz.title}</h3>
                  <p className="hub-quiz-desc">{qz.description}</p>
                  <div className="hub-quiz-meta">
                    <span>{Object.keys(qz.catColors).length} thèmes</span>
                    <span>·</span>
                    <span>{qz.allQuestions.length} questions</span>
                    <span>·</span>
                    <span>{qz.questionTypes}</span>
                  </div>
                </div>
                <span className="hub-quiz-arrow">→</span>
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="hub-recent">
              <h3 className="hub-recent-title">Dernières parties</h3>
              {history.filter((h) => h.userName === user?.name).slice(0, 3).map((h, i) => (
                <div key={i} className="history-item">
                  <div className="history-item-left">
                    <span className="history-quiz-icon">{quizzes.find((qz) => qz.id === h.quizId)?.icon || "📝"}</span>
                    <div>
                      <div className="history-quiz-name">{h.quizTitle}</div>
                      <div className="history-date">{h.date} · {h.count}q</div>
                    </div>
                  </div>
                  <div className="history-score" style={{ color: h.pct >= 75 ? "#2ecc71" : h.pct >= 50 ? "#f5a623" : "#e8453c" }}>
                    {h.pct}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== HOME (quiz config) =====
  if (screen === "home" && quiz) {
    return (
      <div className="app">
        <div className="home">
          <button className="back-btn" onClick={() => setScreen("hub")} style={{ marginBottom: 16 }}>← Retour aux quiz</button>
          <div className="home-icon">{quiz.icon}</div>
          <h1 className="home-title">{quiz.title}</h1>
          <p className="home-subtitle">{quiz.description}</p>
          <p className="home-label">Combien de questions ?</p>
          {quiz.questionCounts.map((n, i) => {
            const cls = ["btn-30", "btn-50", "btn-100", "btn-200"][i] || "btn-100";
            const labels = ["Facile", "Pro", "Expert", "Ultra"];
            const emojis = ["⚡", "🔥", "🏆", "💎"];
            return (
              <button key={n} className={`btn ${cls} animate-in stagger-${i + 1}`} onClick={() => startQuiz(quiz.id, n)}>
                {labels[i]} — {n} questions {emojis[i]}
              </button>
            );
          })}
          <button className="share-btn" style={{ margin: "24px auto 0", display: "flex" }} onClick={() => setTimerEnabled((t) => !t)}>
            {timerEnabled ? "⏱️ Timer activé" : "⏱️ Activer le timer"}
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: timerEnabled ? "#2ecc71" : "#666", marginLeft: 4 }} />
          </button>
          <div className="levels-box animate-in stagger-4">
            <p className="levels-title">3 niveaux :</p>
            <div className="levels-list">
              <div>🟢 <b>Facile</b> — QCM (1 pt)</div>
              <div>🟡 <b>Moyen</b> — « Je suis... » (2 pts)</div>
              <div>🔴 <b>Expert</b> — Question ouverte (3 pts)</div>
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
          {quiz?.hasDetailCards && <DetailCard q={wr} conceptDetails={quiz?.conceptDetails} catColors={catColors} />}
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
          {pRank && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#aaa" }}>{user?.name}, tu es classé</div>
              <div className="animate-bounce" style={{ fontSize: 36, fontWeight: 800, color: pRank <= 3 ? "#f5a623" : "#7b61ff" }}>
                {pRank <= 3 ? ["🥇", "🥈", "🥉"][pRank - 1] : `#${pRank}`}
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>sur {lb.length} joueur{lb.length > 1 ? "s" : ""}</div>
            </div>
          )}
          {lb.slice(0, 15).map((e, i) => {
            const isMe = e.name === user?.name && e.id === (pRank ? lb[pRank - 1]?.id : null);
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

        <div style={{ padding: "20px 16px 40px", textAlign: "center", display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => setScreen("home")}>Rejouer 🔄</button>
          <button className="btn-success" style={{ flex: 1 }} onClick={() => setScreen("hub")}>Autres quiz →</button>
        </div>
      </div>
    );
  }

  // ===== QUIZ =====
  if (!q) return null;
  const prog = ((idx + 1) / questions.length) * 100;

  return (
    <div className="app">
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Quitter le quiz ?</h3>
            <p className="modal-desc">Ta progression sera sauvegardée. Tu pourras reprendre plus tard.</p>
            <div className="modal-info">
              <span>Question {idx + 1}/{qCount}</span>
              <span>·</span>
              <span>{score} pts</span>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-save" onClick={handleSaveAndExit}>💾 Sauvegarder & quitter</button>
              <button className="modal-btn-cancel" onClick={() => setShowExitConfirm(false)}>Continuer le quiz</button>
            </div>
          </div>
        </div>
      )}

      <div className="progress-bar">
        <div className="progress-top">
          <button className="quiz-exit-btn" onClick={() => setShowExitConfirm(true)}>✕</button>
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
            <input ref={inputRef} type="text" value={ans} onChange={(e) => setAns(e.target.value)} placeholder="Ta réponse..." disabled={revealed} onKeyDown={(e) => e.key === "Enter" && !revealed && ans.trim() && handleReveal()} autoComplete="off" spellCheck="false" className={`text-input ${revealed ? (lastR?.correct ? "correct" : "wrong") : ""}`} />
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

        {revealed && quiz?.hasDetailCards && <DetailCard q={q} conceptDetails={quiz?.conceptDetails} catColors={catColors} />}

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
