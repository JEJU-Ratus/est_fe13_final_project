import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";

export default function SignupCompletePage() {
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
          <span>회원가입이 완료되었어요.</span>
          <span>지금부터 나만의 학습을 시작해 보세요.</span>
        </p>

        <Link className={styles["login-link"]} href="/login">
          로그인 하러 가기
        </Link>
      </div>
    </main>
  );
}
