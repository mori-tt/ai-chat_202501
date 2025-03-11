import { Timestamp } from "firebase/firestore";

export type ChatFormData = {
  prompt: string | undefined;
  amount: string;
  size: string;
  file: File;
  files: File[];
};

export type ChatType =
  | "conversation"
  | "image_generation"
  | "text_to_speech"
  | "speech_to_text"
  | "image_analysis";

export interface ChatRoom {
  id: string;
  first_message: string;
  type: string;
  user_id: string;
  last_updated: Timestamp;
}

export interface TextMessage {
  id: string;
  content: string;
  type: "text";
  created_at: Timestamp;
  sender: "user" | "assistant";
}

export interface ImageMessage {
  id: string;
  content: string[];
  type: "image";
  created_at: Timestamp;
  sender: "user" | "assistant";
}

export interface AudioMessage {
  id: string;
  content: string;
  type: "audio";
  created_at: Timestamp;
  sender: "user" | "assistant";
}

export interface ImageAnalysisMessage {
  id: string;
  content: { imageUrl: string[]; text: string };
  type: "image_analysis";
  created_at: Timestamp;
  sender: "user" | "assistant";
}
export type Message =
  | TextMessage
  | ImageMessage
  | AudioMessage
  | ImageAnalysisMessage;
