"use client";
import { useState } from "react";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

interface ChatProps {
  initialChatId?: string;
  chatType: string;
}

const Chat = ({ initialChatId, chatType }: ChatProps) => {
  const [chatId, setChatId] = useState(initialChatId);
  return (
    <>
      <ChatMessage chatId={chatId} chatType={chatType} />
      <ChatForm chatId={chatId} setChatId={setChatId} chatType={chatType} />
    </>
  );
};

export default Chat;
