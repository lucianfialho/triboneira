/**
 * Content Generation Service
 * Main export file
 */

// Types
export * from './types';

// Core services
export { ContentGenerator, getContentGenerator, enableVisualGeneration } from './content-generator';
export { ContentQueue, getContentQueue } from './content-queue';
export { VisualGenerator, getVisualGenerator } from './visual-generator';

// Event handlers
export {
  handleMatchFinished,
  handleDailyRecap,
  handlePlayerPerformance,
  handleEventStarting,
  processContentQueue,
} from './event-handlers';

// Templates
export { matchResultTemplates } from './templates/match-result';
export { upsetTemplates } from './templates/upset';
