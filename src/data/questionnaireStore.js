import { questionnaireSections } from './questionnaireData';

const CUSTOM_QUESTIONS_KEY = 'communicare_custom_questions';

function getStoredQuestions() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_QUESTIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getQuestionnaireSections() {
  const customQuestions = getStoredQuestions();

  return questionnaireSections.map((section) => ({
    ...section,
    questions: [
      ...section.questions,
      ...customQuestions
        .filter((q) => q.sectionId === section.id)
        .map((q) => ({
          id: q.id,
          leftLabel: q.leftLabel,
          rightLabel: q.rightLabel,
        })),
    ],
  }));
}

export function addCustomQuestion({ sectionId, leftLabel, rightLabel }) {
  const customQuestions = getStoredQuestions();

  const nextQuestion = {
    id: `custom-${Date.now()}`,
    sectionId,
    leftLabel,
    rightLabel,
  };

  localStorage.setItem(
    CUSTOM_QUESTIONS_KEY,
    JSON.stringify([...customQuestions, nextQuestion])
  );

  return nextQuestion;
}