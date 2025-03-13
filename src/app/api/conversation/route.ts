import { checkUserPermission, verifyToken } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// resパラメータを削除
export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");
    // Tokenが添付されているか
    if (!authHeader) {
      return NextResponse.json(
        { error: "Tokenが添付されていません" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    // デコード
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "無効なトークンです。" },
        { status: 401 }
      );
    }

    const { prompt, chatId } = await req.json();
    console.log("リクエスト受信:", { prompt, chatId });

    // firestoreのデータを操作してよいユーザーか
    const hasPermission = await checkUserPermission(user.uid, chatId);

    if (!hasPermission) {
      return NextResponse.json(
        { error: "操作が許可されていないか、リソースが存在しません" },
        { status: 403 }
      );
    }

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

    const messagesRef = db
      .collection("chats")
      .doc(chatId)
      .collection("messages");
    const snapShot = await messagesRef.orderBy("created_at", "asc").get();

    const messages = snapShot.docs.map((doc) => ({
      role: doc.data().sender,
      content: doc.data().content,
    }));

    console.log("messages", messages);

    // openAI APIを呼び出してAIの回答を生成
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });
    console.log("AI_RESPONSE", completion.choices[0].message);

    const aiResponse = completion.choices[0].message.content;

    // AIの回答をfirestoreに保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: aiResponse,
      created_at: FieldValue.serverTimestamp(),
      sender: "assistant",
      type: "text",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("エラー詳細:", error);
    return NextResponse.json(
      { error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}
