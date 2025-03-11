import { db } from "@/lib/firebase/firebaseAdmin";
import { fileUploadToStorage } from "@/lib/firebase/storage";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// resパラメータを削除
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const prompt = formData.get("prompt") as string;
    const chatId = formData.get("chatId") as string;

    console.log("files", files);
    console.log("prompt", prompt);
    console.log("chatId", chatId);

    let urls: string[] = [];

    if (files.length > 0) {
      //URL->ダウンロード->バイナリデータに変換->保存パスを設定->ストレージにアップロードして参照URLを取得
      const imageDataPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = `${"6miWoueJsIOtQiZ6dH26370GYoJ2"}/chatRoom/${chatId}`;
        return await fileUploadToStorage(buffer, filePath, file.type);
      });
      urls = await Promise.all(imageDataPromises);
      console.log("urls", urls);
    }

    // メッセージをサーバー側で保存
    await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .add({
        content: { text: prompt, imageUrl: urls },
        created_at: FieldValue.serverTimestamp(),
        sender: "user",
        type: "image_analysis",
      });

    const messagesRef = db
      .collection("chats")
      .doc(chatId)
      .collection("messages");
    const snapShot = await messagesRef.orderBy("created_at", "asc").get();

    const messages: ChatCompletionMessageParam[] = snapShot.docs.map((doc) => {
      if (doc.data().sender == "user") {
        return {
          role: "user",
          content: [
            // テキスト
            { type: "text", text: doc.data().content.text },
            // 画像
            ...doc.data().content.imageUrl.map((url: string) => {
              return {
                type: "image_url",
                image_url: {
                  url: url,
                },
              };
            }),
          ],
        };
      } else {
        return {
          role: "assistant",
          content: doc.data().content,
        };
      }
    });

    console.log("messages", messages);

    // openAI APIを呼び出してAIの回答を生成
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    console.log(response.choices[0]);

    const aiResponse = response.choices[0].message.content;

    // AIの回答をfirestoreに保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: aiResponse,
      created_at: FieldValue.serverTimestamp(),
      sender: "assistant",
      type: "text",
    });

    return NextResponse.json({ success: "true" });
  } catch (error) {
    console.error("IMAGE_ANALYSIS_ERROR", error);
    return NextResponse.json(
      { error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}
