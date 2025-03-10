import { db } from "@/lib/firebase/firebaseAdmin";
import { fileUploadToStorage } from "@/lib/firebase/storage";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// resパラメータを削除
export async function POST(req: Request) {
  try {
    const { prompt, chatId } = await req.json();

    console.log("prompt", prompt);
    console.log("chatId", chatId);

    if (!chatId) {
      return NextResponse.json({ error: "chatIdが必要です" }, { status: 400 });
    }

    // メッセージをサーバー側で保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: prompt,
      created_at: FieldValue.serverTimestamp(),
      sender: "user",
      type: "text",
    });

    // openAI APIを呼び出してAIの回答を生成
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy",
      input: prompt,
    });
    console.log("audioResponse", audioResponse);

    //バイナリデータに変換->保存パスを設定->ストレージにアップロードして参照URLを取得
    const arrayBuffer = await audioResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `${"6miWoueJsIOtQiZ6dH26370GYoJ2"}/chatRoom/${chatId}`;
    const url = await fileUploadToStorage(buffer, filePath, "audio/mpeg");
    console.log("url", url);

    // AIの回答をfirestoreに保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: url,
      created_at: FieldValue.serverTimestamp(),
      sender: "assistant",
      type: "audio",
    });

    return NextResponse.json({ success: "true" });
  } catch (error) {
    console.error("TEXT_TO_SPEECH_ERROR", error);
    return NextResponse.json(
      { error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}
