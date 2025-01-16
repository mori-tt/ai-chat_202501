"use client";
import {
  Ellipsis,
  FileImage,
  FileOutput,
  FileSearch2,
  MessageCircle,
  Speech,
} from "lucide-react";
import BotAvatar from "./BotAvatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { useAuth } from "@/context/AuthContext";
import { ChatRoom } from "@/types";

const Sidebar = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const pathname = usePathname();
  // console.log(pathname);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "chats"),
      where("user_id", "==", currentUser?.uid),
      orderBy("last_updated", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapShot) => {
      const fetchChatRooms = snapShot.docs.map((doc) => ({
        id: doc.id,
        first_message: doc.data().first_message,
        type: doc.data().type,
        user_id: doc.data().user_id,
        last_updated: doc.data().last_updated,
        // ...doc.data(),
      }));
      // console.log("fetchChatRooms", fetchChatRooms);
      setChatRooms(fetchChatRooms);
    });
    return () => unsubscribe();
  }, []);
  const routes = [
    {
      label: "Conversation",
      href: "/conversation",
      color: "text-violet-500",
      Icon: MessageCircle,
    },
    {
      label: "Image Generation",
      href: "/image_generation",
      color: "text-blue-500",
      Icon: FileImage,
    },
    {
      label: "Text to Speech",
      href: "/text_to_speech",
      color: "text-red-500",
      Icon: FileOutput,
    },
    {
      label: "Speech to Text",
      href: "/speech_to_text",
      color: "text-green-500",
      Icon: Speech,
    },
    {
      label: "Image Analysis",
      href: "/image_analysis",
      color: "text-orange-500",
      Icon: FileSearch2,
    },
  ];
  return (
    <div className="space-y-4 bg-gray-900 text-white p-3 h-full flex flex-col">
      {/* タイトル&ロゴエリア */}
      <Link href={"/"} className="flex items-center">
        <div className="mr-3 pl-3">
          <BotAvatar />
        </div>
        <h1 className="font-bold text-xl">AI Chat App</h1>
      </Link>
      {/* チャットタイプエリア */}
      <div className="space-y-1">
        {routes.map((route) => (
          <Link
            href={route.href}
            key={route.href}
            className={cn(
              "block p-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition rounded-lg",
              pathname.startsWith(route.href) && "bg-white/10"
            )}
          >
            <div className="flex items-center">
              <route.Icon className={cn("h-5 w-5, mr-3", route.color)} />
              <p>{route.label}</p>
            </div>
          </Link>
        ))}
      </div>
      {/* チャットルームエリア */}
      <div className="flex flex-1 flex-col overflow-hidden space-y-1">
        <h2 className="text-xs font-medium px-2 py-4">Chat Room</h2>
        <div className="overflow-auto">
          {chatRooms.map((room) => (
            <Link
              href={`/${room.type}/${room.id}`}
              key={room.id}
              // key={route.href}
              className={cn(
                "block p-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition rounded-lg",
                pathname === `/${room.type}/${room.id}` && "bg-white/10"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{room.first_message}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Ellipsis size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>削除</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
