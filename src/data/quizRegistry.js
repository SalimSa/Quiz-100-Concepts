import { catColors, allQuestions, conceptDetails } from "./quizData.js";
import { dzCatColors, dzQuestions } from "./quizDZ.js";
import { dzConceptDetails } from "./dzConceptDetails.js";

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
    gradient: "linear-gradient(135deg, #1B6B3A, #2D8B55)",
    catColors: dzCatColors,
    allQuestions: dzQuestions,
    conceptDetails: dzConceptDetails,
    questionCounts: [30, 50, 100, 300],
    hasDetailCards: true,
    questionTypes: "QCM · Qui suis-je · Expert",
  },
];

export function getQuiz(id) {
  return quizzes.find((q) => q.id === id);
}
