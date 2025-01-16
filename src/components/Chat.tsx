import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

interface ChatProps {
  chatId?: string;
  chatType: string;
}

const Chat = ({ chatId, chatType }: ChatProps) => {
  return (
    <>
      <ChatMessage chatId={chatId} chatType={chatType} />
      <ChatForm />
    </>
  );
};

export default Chat;
