"use client";
import { useState } from "react";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import { ChatType } from "@/types";

interface ChatProps {
  initialChatId?: string;
  chatType: ChatType;
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
