// 🇧🇫 Faso QUIZ — Toutes les questions centralisées
import { QUESTIONS } from './questions';
import { QUESTIONS_EXTRA } from './questions_extra';
import { QUESTIONS_PREMIUM_CONCOURS } from './questions_concours';

// Pool Burkina complet : 100 + 100 = 200 questions (mode rapide)
export const TOUTES_QUESTIONS_BURKINA = [...QUESTIONS, ...QUESTIONS_EXTRA];

// Questions concours premium
export { QUESTIONS_PREMIUM_CONCOURS };

// Mélanger un tableau
export const melanger = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Configuration des modes de jeu
export const CONFIG_MODES = {
  rapide: { questions: 200, nom: "Mode Rapide" },
  normal: { questions: 300, nom: "Mode Normal" },
  expert: { questions: 500, nom: "Mode Expert" },
  marathon: { questions: 800, nom: "Mode Marathon" },
  concours: { questions: 1000, nom: "Mode Concours" }
};

// N questions aléatoires selon le mode
export const getQuestionsMode = (mode = 'rapide') => {
  const config = CONFIG_MODES[mode];
  const questionsDisponibles = [...QUESTIONS]; // 200 questions disponibles actuellement
  
  // Si on demande plus de questions que disponibles, on duplique et mélange
  if (config.questions > questionsDisponibles.length) {
    const repetitions = Math.ceil(config.questions / questionsDisponibles.length);
    let questionsEtendues = [];
    for (let i = 0; i < repetitions; i++) {
      questionsEtendues = [...questionsEtendues, ...melanger(questionsDisponibles)];
    }
    return melanger(questionsEtendues).slice(0, config.questions);
  }
  
  return melanger(questionsDisponibles).slice(0, config.questions);
};

// Questions concours par catégorie
export const getQuestionsConcours = (categorieId, n = 50) => {
  const MAP = {
    mathematiques: 'Mathématiques',
    sciences: 'Sciences',
    histoire_geo: 'Histoire-Géographie',
    francais: 'Français',
    logique: 'Logique',
  };
  
  // Nombres réels de questions par catégorie
  const NOMBRES_REELS = {
    mathematiques: 109,
    sciences: 133,
    histoire_geo: 100,
    francais: 105,
    logique: 50,
    mixte: 497,
  };
  
  if (categorieId === 'mixte') {
    return melanger(QUESTIONS_PREMIUM_CONCOURS).slice(0, NOMBRES_REELS[categorieId]);
  }
  
  const cat = MAP[categorieId];
  const filtrees = QUESTIONS_PREMIUM_CONCOURS.filter(q => q.categorie === cat);
  return melanger(filtrees).slice(0, NOMBRES_REELS[categorieId]);
};
