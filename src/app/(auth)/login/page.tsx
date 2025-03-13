"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { auth, provider } from "@/lib/firebase/firebaseClient";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/conversation");
    }
  }, [currentUser, router]);

  const handleLogin = () => {
    provider.setCustomParameters({ prompt: "select_account" }); // ユーザーにアカウント選択を促す
    signInWithPopup(auth, provider)
      .then(() => {
        // router.push("/conversation");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return <Button onClick={handleLogin}>Login</Button>;
};

export default LoginPage;
