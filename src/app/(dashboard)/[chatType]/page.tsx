import Chat from "@/components/Chat";
import { notFound } from "next/navigation";
import React from "react";

const ChatTypePage = async ({
  params,
}: {
  params: Promise<{ chatType: string }>;
}) => {
  const { chatType } = await params;

  const allowedChatType = [
    "conversation",
    "image_generation",
    "text_to_speech",
    "speech_to_text",
    "image_analysis",
  ];

  if (!allowedChatType.includes(chatType)) {
    return notFound();
  }
  return (
    <>
      <Chat chatType={chatType} />
    </>
  );
};

export default ChatTypePage;
