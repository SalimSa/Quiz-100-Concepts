export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function norm(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      );
  return d[m][n];
}

export function checkAnswer(userInput, answer, alts = []) {
  const un = norm(userInput);
  if (!un) return false;
  const targets = [norm(answer), ...(alts || []).map(norm)];
  for (const t of targets) {
    if (un === t) return true;
    if (t.includes(un) && un.length >= 3) return true;
    if (un.includes(t) && t.length >= 3) return true;
    const maxDist = t.length <= 5 ? 1 : t.length <= 10 ? 2 : 3;
    if (lev(un, t) <= maxDist) return true;
  }
  return false;
}

export function selectQuestions(allQuestions, catColors, count) {
  const themes = Object.keys(catColors);
  const perTheme = Math.floor(count / themes.length);
  const sel = [];
  for (const t of themes) {
    const tq = allQuestions.filter((q) => q.theme === t);
    const easy = shuffle(tq.filter((q) => q.level === 1));
    const med = shuffle(tq.filter((q) => q.level === 2));
    const hard = shuffle(tq.filter((q) => q.level === 3));
    let ec, mc, hc;
    if (perTheme <= 3) { ec = 1; mc = 1; hc = 1; }
    else if (perTheme <= 5) { ec = 2; mc = 2; hc = 1; }
    else { ec = 4; mc = 4; hc = 2; }
    sel.push(...easy.slice(0, ec), ...med.slice(0, mc), ...hard.slice(0, hc));
  }
  return shuffle(sel).slice(0, count);
}

export function getDetail(conceptDetails, q) {
  const key = q.concept || q.answer || q.intrus;
  return (
    conceptDetails[key] || {
      visual: "📚",
      title: key,
      detail: `Concept clé dans la catégorie ${q.theme}. Explore le lien ci-dessous pour en savoir plus.`,
    }
  );
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const lvlLabels = { 1: "Facile", 2: "Moyen", 3: "Expert" };
export const lvlEmojis = { 1: "🟢", 2: "🟡", 3: "🔴" };
export const lvlPts = { 1: 1, 2: 2, 3: 3 };
