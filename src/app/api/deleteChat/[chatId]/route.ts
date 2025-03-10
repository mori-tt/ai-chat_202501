import { bucket, db } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = await params;
    // firestoreからデータを削除する処理
    const chatRef = db.collection("chats").doc(chatId);
    await db.recursiveDelete(chatRef);
    // storageからデータを削除する処理
    const prefix = `${"6miWoueJsIOtQiZ6dH26370GYoJ2"}/chatRoom/${chatId}`;
    const [files] = await bucket.getFiles({ prefix: prefix });
    if (files) {
      console.log(`${files.length}枚の削除対象のファイルがありました`);
      const deletePromises = files.map((file) => file.delete());
      await Promise.all(deletePromises);
      console.log(`${files.length}枚のファイルを削除しました`);
    } else {
      console.log(`削除対象のファイルはありませんでした`);
    }
    return NextResponse.json(
      { message: "チャットルームとそのサブコレクションが削除されました" },
      { status: 200 }
    );
  } catch (error) {
    console.log("削除処理中のエラー", error);
    return NextResponse.json(
      { error: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}
