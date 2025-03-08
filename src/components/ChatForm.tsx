"use client";
import React from "react";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { LoaderCircle, Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ChatFormProps {
  chatId?: string;
  chatType: string;
  setChatId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ChatForm = ({ chatId, chatType, setChatId }: ChatFormProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const conversationSchema = z.object({
    prompt: z.string().min(1, { message: "メッセージを入力してください。" }),
  });
  const form = useForm<z.infer<typeof conversationSchema>>({
    resolver: zodResolver(conversationSchema),
    defaultValues: { prompt: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof conversationSchema>) => {
    console.log("フォーム送信開始:", values);

    try {
      let chatRef;
      let isNewChat = false;
      if (!chatId) {
        console.log("新規チャット作成中...");
        // 新規チャットルーム作成時に、まずメタ情報のみを保存
        const newChatDocRef = await addDoc(collection(db, "chats"), {
          last_updated: serverTimestamp(),
          type: chatType,
          user_id: currentUser?.uid,
          first_message: values.prompt.substring(0, 30), // メッセージの最初の30文字をタイトルとして使用
        });
        console.log("新規チャット作成完了:", newChatDocRef.id);

        chatRef = doc(db, "chats", newChatDocRef.id);
        isNewChat = true;
        setChatId(newChatDocRef.id);
      } else {
        chatRef = doc(db, "chats", chatId);
      }
      const response = await axios.post("/api/conversation", {
        prompt: values.prompt,
        chatId: chatRef.id,
      });
      console.log("API応答:", response.data);

      if (isNewChat) {
        // 初めてメッセージを送信した場合
        // router.push(`/${chatType}/${chatRef.id}`);
        window.history.pushState(null, "", `/${chatType}/${chatRef.id}`);
      } else {
        //　既にチャットルームにアクセスしている場合
        await updateDoc(chatRef, { last_updated: serverTimestamp() });
      }
    } catch (error) {
      console.error("エラー詳細:", error);
      alert(
        "メッセージの送信に失敗しました。詳細はコンソールを確認してください。"
      );
    } finally {
      // フォームをリセット
      form.reset();
    }
  };
  return (
    <div className="bg-white p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="w-full flex-1">
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      {...field}
                      className="bg-slate-200"
                      rows={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting} variant={"ghost"}>
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Send />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChatForm;
