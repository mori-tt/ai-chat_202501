import Chat from "@/components/Chat";
import { notFound } from "next/navigation";

const CHatRoomPage = async ({
  params,
}: {
  params: Promise<{ chatType: string; chatId: string }>;
}) => {
  const { chatType, chatId } = await params;
  // console.log("chatId", chatId);
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

  return <Chat initialChatId={chatId} chatType={chatType} />;
};

export default CHatRoomPage;
