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
import { usePathname, useRouter } from "next/navigation";
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
import axios from "axios";

const Sidebar = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userToken } = useAuth();

  console.log("userToken", userToken);

  useEffect(() => {
    if (!currentUser) {
      console.log("No user logged in, skipping chat rooms fetch");
      setChatRooms([]); // 未認証の場合は空配列にリセット
      return;
    }

    console.log("Fetching chat rooms for user ID:", currentUser.uid);
    // 認証情報の詳細をデバッグ（利用可能なプロパティのみ）
    console.log("Auth state:", {
      uid: currentUser.uid,
      providerId: currentUser.providerId,
      displayName: currentUser.displayName,
    });

    try {
      const q = query(
        collection(db, "chats"),
        where("user_id", "==", currentUser.uid),
        orderBy("last_updated", "desc")
      );

      console.log("Firebase query created, attaching listener...");

      const unsubscribe = onSnapshot(
        q,
        (snapShot) => {
          console.log(
            "Snapshot received, document count:",
            snapShot.docs.length
          );
          const fetchChatRooms = snapShot.docs.map((doc) => ({
            id: doc.id,
            first_message:
              doc.data().first_message || doc.data().title || "新しいチャット",
            type: doc.data().type,
            user_id: doc.data().user_id,
            last_updated: doc.data().last_updated,
          }));
          console.log("Processed chat rooms:", fetchChatRooms.length);
          setChatRooms(fetchChatRooms);
        },
        (error) => {
          // エラーハンドリングを改善
          console.error("Error fetching chat rooms:", error);

          // permission-deniedエラーの場合は特別な処理
          if (error.code === "permission-denied") {
            console.log(
              "権限エラーが発生しました - おそらくドキュメントが削除されたためです"
            );
            // 必要に応じてリスナーを再接続するロジックをここに追加できます
          }

          // エラーの詳細情報を表示
          if (error.code) {
            console.error("Error code:", error.code);
          }
          if (error.message) {
            console.error("Error message:", error.message);
          }
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up chat rooms listener:", error);
      return () => {};
    }
  }, [currentUser]);

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
  const handleDeleteChat = async (chatId: string) => {
    try {
      // 現在のパスが削除対象のチャットを表示しているかチェック
      const isCurrentChatBeingDeleted = pathname.includes(chatId);

      // 楽観的UIアップデート
      setChatRooms((prevRooms) =>
        prevRooms.filter((room) => room.id !== chatId)
      );

      const response = await axios.delete(`/api/deleteChat/${chatId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      console.log("Chat deleted successfully:", response.data);

      // 削除したチャットを表示していた場合はホームへリダイレクト
      if (isCurrentChatBeingDeleted) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };
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
              <route.Icon className={cn("h-5 w-5 mr-3", route.color)} />
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
                    <DropdownMenuItem onClick={() => handleDeleteChat(room.id)}>
                      削除
                    </DropdownMenuItem>
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
