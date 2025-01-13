import { notFound } from "next/navigation";
import React from "react";

const CHatRoomPage = async ({
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

  return <div>CHatRoomPage</div>;
};

export default CHatRoomPage;
