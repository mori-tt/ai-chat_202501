import { checkUserPermission, verifyToken } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/firebaseAdmin";
import { fileUploadToStorage } from "@/lib/firebase/storage";
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

    const { prompt, chatId, amount, size } = await req.json();

    console.log("prompt", prompt);
    console.log("chatId", chatId);
    console.log("amount", amount);
    console.log("size", size);

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

    // openAI APIを呼び出してAIの回答を生成
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: parseInt(amount, 10),
      size: size,
    });

    const image_url = response.data[0].url;

    console.log("response", response);
    // console.log("image_url", image_url);

    //URL->ダウンロード->バイナリデータに変換->保存パスを設定->ストレージにアップロードして参照URLを取得
    const imageDataPromises = response.data.map(async (item) => {
      if (item.url) {
        const fetchResponse = await fetch(item.url);
        const arrayBuffer = await fetchResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = `${user.uid}/chatRoom/${chatId}`;
        // 修正: アップロード後にアップロード先URL（など）を返すようにする
        const uploadedUrl = await fileUploadToStorage(
          buffer,
          filePath,
          "image/png"
        );
        return uploadedUrl;
      }
      return null;
    });

    // Promise.all の結果から null 値を除外する
    const urls = (await Promise.all(imageDataPromises)).filter(
      (url) => url !== null
    );

    console.log("urls", urls);

    // AIの回答をfirestoreに保存
    await db.collection("chats").doc(chatId).collection("messages").add({
      content: urls,
      created_at: FieldValue.serverTimestamp(),
      sender: "assistant",
      type: "image",
    });

    return NextResponse.json({ success: "true" });
  } catch (error) {
    console.error("IMAGE_GENERATION_ERROR", error);
    return NextResponse.json(
      { error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}
