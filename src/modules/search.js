// Query building and search keyword generation

import { detectLanguage } from './translate.js';

export function buildSearchContext(query) {
  const lang = detectLanguage(query);
  const isEnglish = lang.code === 'EN';

  return {
    query,
    language: lang,
    searchLanguages: isEnglish
      ? ['EN']
      : ['EN', lang.code],
    requiresTranslation: !isEnglish,
  };
}

export function getLoadingSteps(context) {
  const steps = ['Identifying region and language...'];

  if (context.requiresTranslation) {
    steps.push(
      'Searching English-language sources...',
      `Searching ${context.language.name}-language sources...`,
      'Translating and summarizing...',
    );
  } else {
    steps.push('Searching open-source databases...');
  }

  steps.push('Running intelligence analysis...', 'Building report...');
  return steps;
}
