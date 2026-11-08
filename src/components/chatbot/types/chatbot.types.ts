/**
 * chatbot.types.ts
 * Types et interfaces stricts pour le module KharjaBot IA.
 */

import type { ChatHistoryItem } from '../../../services/chatbotService';

export type { ChatHistoryItem };

export interface ChatCardItem {
  id: string;
  name: string;
  category?: string;
  city?: string;
  rating?: number;
  imageUrl?: string;
  priceLevel?: string | number;
  address?: string;
  amenities?: string[];
  matchScore?: number;
}

export interface OutingPlanStep {
  stepIndex?: number;
  category: string;
  activity?: ChatCardItem | null;
  activityId?: string | null;
  status?: 'done' | 'empty' | 'pending';
  relaxed?: string[];
}

export interface ChatbotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  suggestions?: string[];
  cards?: ChatCardItem[];
  planSteps?: OutingPlanStep[];
  isError?: boolean;
  showExploreAction?: boolean;
}

export interface ChatbotScreenProps {
  onNavigateToHome?: () => void;
  onSelectActivityId?: (activityId: string) => void;
}

export interface UseChatbotReturn {
  messages: ChatbotMessage[];
  isTyping: boolean;
  inputVal: string;
  setInputVal: (val: string) => void;
  activeSuggestions: string[];
  sendMessage: (textToSend?: string) => Promise<void>;
  resetChat: () => Promise<void>;
  historyVisible: boolean;
  conversations: ChatHistoryItem[];
  activeConversationId: string | null;
  openHistory: () => void;
  closeHistory: () => void;
  startNewChat: () => Promise<void>;
  resumeDiscussion: (item: ChatHistoryItem) => Promise<void>;
  deleteDiscussion: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}
