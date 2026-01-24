
export interface UserProfile {
  id: string;
  name: string;
  neighborhood: string;
  avatar: string;
  joinedDate: string;
  score: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'neighbor';
  text: string;
  timestamp: Date;
  senderName?: string;
  avatar?: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  image: string;
  category: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  neighborhood: string;
  time: string;
  image: string;
  category: string;
}
