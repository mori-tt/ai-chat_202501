"use client";
import { useEffect, useRef, useState } from "react";
import BotAvatar from "./BotAvatar";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { TextMessage } from "@/types";
import UserAvatar from "./UserAvatar";
import Panel from "./Panel";
import MessageDisplay from "./MessageDisplay";

interface ChatMessageProps {
  chatId?: string;
  chatType: string;
}

const ChatMessage = ({ chatId, chatType }: ChatMessageProps) => {
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const endRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("created_at", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapShot) => {
      const fetchMessages = snapShot.docs.map((doc) => ({
        id: doc.id,
        content: doc.data().content,
        type: doc.data().type,
        created_at: doc.data().created_at,
        sender: doc.data().sender,
        // ...doc.data(),
      }));
      console.log("fetchMessages", fetchMessages);
      setMessages(fetchMessages);
    });
    return () => unsubscribe();
  }, [chatId]);
  return (
    <>
      {!chatId ? (
        <Panel chatType={chatType} />
      ) : (
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-4">
              {message.sender === "user" ? <UserAvatar /> : <BotAvatar />}
              <div>
                {/* メッセージのタイプによってタグを変える */}
                <div className="bg-white p-4 rounded-lg shadow break-all whitespace-pre-wrap">
                  <MessageDisplay content={message.content} />
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef}></div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;
