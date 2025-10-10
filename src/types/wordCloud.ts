export interface WordCloudData {
  text: string;
  weight: number;
  color?: string;
}

export interface WordCloudConfig {
  width: number;
  height: number;
  padding: number;
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  minFontSize: number;
  maxFontSize: number;
  maxWords: number;
  rotationAngles: number[];
  colors: string[];
  backgroundColor: string;
  spiral: 'archimedean' | 'rectangular';
}

export interface WordCloudSettings {
  title: string;
  description: string;
  dataSource: 'manual' | 'api';
  apiEndpoint?: string;
  config: WordCloudConfig;
}

export interface ConversationMessage {
  id: string;
  content: string;
  timestamp?: string;
  author?: string;
}

export interface ConversationData {
  conversation_id: string;
  active: boolean;
  messages: ConversationMessage[];
  title?: string;
  lastUpdated?: string;
}

export interface ConversationState {
  conversations: ConversationData[];
  isLoading: boolean;
  error: string | null;
}

export interface StopWordsState {
  stopWords: Set<string>;
  isLoading: boolean;
  error: string | null;
}
