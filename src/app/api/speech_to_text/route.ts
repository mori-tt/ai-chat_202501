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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const chatId = formData.get("chatId") as string;

    console.log("file", file);
    console.log("chatId", chatId);

    //バイナリデータに変換->保存パスを設定->ストレージにアップロードして参照URLを取得
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `${"6miWoueJsIOtQiZ6dH26370GYoJ2"}/chatRoom/${chatId}`;
    const url = await fileUploadToStorage(buffer, filePath, file.type);
    console.log("url", url);

    // メッセージをサーバー側で保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: url,
      created_at: FieldValue.serverTimestamp(),
      sender: "user",
      type: "audio",
    });

    // openAI APIを呼び出してAIの回答を生成
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });
    console.log("transcription", transcription);
    console.log("transcription.text", transcription.text);

    const aiResponse = transcription.text;

    // AIの回答をfirestoreに保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: aiResponse,
      created_at: FieldValue.serverTimestamp(),
      sender: "assistant",
      type: "text",
    });

    return NextResponse.json({ success: "true" });
  } catch (error) {
    console.error("SPEECH_TO_TEXT_ERROR", error);
    return NextResponse.json(
      { error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}
