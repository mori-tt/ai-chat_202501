import Chat from "@/components/Chat";
import { ChatType } from "@/types";
import { notFound } from "next/navigation";

const CHatRoomPage = async ({
  params,
}: {
  params: Promise<{ chatType: string; chatId: string }>;
}) => {
  const { chatType, chatId } = await params;
  // console.log("chatId", chatId);
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

  return <Chat initialChatId={chatId} chatType={chatType} />;
};

export default CHatRoomPage;
