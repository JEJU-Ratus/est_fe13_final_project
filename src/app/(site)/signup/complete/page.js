"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CommonModal from "@/components/CommonModal";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.scss";

export default function SignupCompletePage() {
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkLoginStatus() {
      const supabase = createClient();
      const {
        data: { claims },
      } = await supabase.auth.getClaims();

      if (isMounted && claims) {
        setIsAlreadyLoggedIn(true);
      }
    }

    checkLoginStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className={styles["complete-page"]}>
      <div className={styles["complete-content"]}>
        <h1>프다에 오신 걸 환영해요!</h1>

        <div className={styles["mascot-stage"]}>
          <Image
            className={styles["mascot-image"]}
            src="/images/프비메인.webp"
            alt="프다 마스코트 프비"
            width={357}
            height={338}
            priority
          />
        </div>

        <p className={styles["complete-message"]}>
          <span>이메일 인증으로 회원가입을 완료해주세요.</span>
          <span>인증 후 로그인하여 나만의 학습을 시작해 보세요.</span>
        </p>

        <Link className={styles["login-link"]} href="/login">
          로그인 하러 가기
        </Link>
      </div>
      <CommonModal isOpen={isAlreadyLoggedIn} mode="alreadyLoggedIn" />
    </main>
  );
}
