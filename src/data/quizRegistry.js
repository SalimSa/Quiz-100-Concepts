import { catColors, allQuestions, conceptDetails } from "./quizData.js";
import { dzCatColors, dzQuestions, dzThemeUrls } from "./quizDZ.js";

// Add URLs to DZ questions based on theme
const dzQuestionsWithUrls = dzQuestions.map((q) => {
  const urls = dzThemeUrls[q.theme];
  return urls ? { ...q, url: urls[Math.floor(Math.random() * urls.length)] } : q;
});

export const quizzes = [
  {
    id: "concepts",
    title: "100 Concepts Puissants",
    icon: "🧠",
    description: "Philosophie, psychologie & business",
    gradient: "linear-gradient(135deg, #7b61ff, #e8453c)",
    catColors,
    allQuestions,
    conceptDetails,
    questionCounts: [30, 50, 100],
    hasDetailCards: true,
    questionTypes: "QCM · Devinette · Intrus",
  },
  {
    id: "dz",
    title: "Quiz DZ — Cards DZ",
    icon: "🇩🇿",
    description: "Culture, histoire & patrimoine algérien",
    gradient: "linear-gradient(135deg, #2ecc71, #e67e22)",
    catColors: dzCatColors,
    allQuestions: dzQuestionsWithUrls,
    conceptDetails: {},
    questionCounts: [30, 50, 100],
    hasDetailCards: false,
    questionTypes: "QCM · Qui suis-je · Expert",
  },
];

export function getQuiz(id) {
  return quizzes.find((q) => q.id === id);
}
