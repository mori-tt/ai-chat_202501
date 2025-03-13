import { checkUserPermission, verifyToken } from "@/lib/firebase/auth";
import { bucket, db } from "@/lib/firebase/firebaseAdmin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
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
    // firestoreのデータを操作してよいユーザーか
    const hasPermission = await checkUserPermission(user.uid, params.chatId);

    if (!hasPermission) {
      return NextResponse.json(
        { error: "操作が許可されていないか、リソースが存在しません" },
        { status: 403 }
      );
    }

    const { chatId } = await params;
    // firestoreからデータを削除する処理
    const chatRef = db.collection("chats").doc(chatId);
    await db.recursiveDelete(chatRef);
    // storageからデータを削除する処理
    const prefix = `${user.uid}/chatRoom/${chatId}`;
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
      { error: "削除処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
