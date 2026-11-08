/**
 * index.ts
 * Point d'entrée public pour le module Chatbot Tfarhida.
 */

export { ChatbotScreenTab, default } from './ChatbotScreenTab';
export { ChatbotHeader } from './ui/ChatbotHeader';
export { ChatbotMessageBubble } from './ui/ChatbotMessageBubble';
export { ChatbotMessageList } from './ui/ChatbotMessageList';
export { ChatbotTypingIndicator } from './ui/ChatbotTypingIndicator';
export { ChatbotSuggestionChips } from './ui/ChatbotSuggestionChips';
export { ChatbotInputBar } from './ui/ChatbotInputBar';
export { ChatbotRecommendationCard } from './cards/ChatbotRecommendationCard';
export { ChatbotOutingPlanCard } from './cards/ChatbotOutingPlanCard';
export { ChatbotCardsCarousel } from './cards/ChatbotCardsCarousel';
export { useChatbot } from './hooks/useChatbot';
export * from './types/chatbot.types';

