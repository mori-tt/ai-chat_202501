import Chat from "@/components/Chat";
import { ChatType } from "@/types";
import { notFound } from "next/navigation";
import React from "react";

const ChatTypePage = async ({
  params,
}: {
  params: Promise<{ chatType: string }>;
}) => {
  const { chatType } = await params;

  // 型ガード関数
  const isChatTypeKey = (key: string): key is ChatType =>
    [
      "conversation",
      "image_generation",
      "text_to_speech",
      "speech_to_text",
      "image_analysis",
    ].includes(key);

  if (!isChatTypeKey(chatType)) {
    return notFound();
  }

  return (
    <>
      <Chat chatType={chatType} />
    </>
  );
};

export default ChatTypePage;
