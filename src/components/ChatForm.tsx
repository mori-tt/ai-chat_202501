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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  amountOptions,
  getFormCongfig,
  getRequestData,
  sizeOptions,
} from "@/lib/formConfigurations";

import { ChatFormData, ChatType } from "@/types";

interface ChatFormProps {
  chatId?: string;
  chatType: ChatType;
  setChatId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ChatForm = ({ chatId, chatType, setChatId }: ChatFormProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { schema, defaultValue } = getFormCongfig(chatType);

  console.log("schema", schema);
  console.log("defaultValue", defaultValue);

  const form = useForm<ChatFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValue,
  });

  const isSubmitting = form.formState.isSubmitting;

  console.log("エラー内容", form.formState.errors);

  const onSubmit = async (values: ChatFormData) => {
    console.log("values.amount", values.amount);

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
      const { apiUrl, apiData } = getRequestData(values, chatRef.id, chatType);
      console.log("apiUrl", apiUrl);
      console.log("apiData", apiData);

      const response = await axios.post(apiUrl, apiData);

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
          {chatType === "image_generation" && (
            <div className="flex items-center space-x-2">
              {/* amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {amountOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {/* size */}
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          )}
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
