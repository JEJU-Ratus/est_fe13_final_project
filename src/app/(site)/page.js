import Image from "next/image";
import Banner from "@/components/Banner";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles["main-page"]}>
      <div className={styles.container}>
        <section className={styles["intro-section"]} aria-labelledby="main-title">
          <div className={styles["mascot-image"]}>
            <Image src="/images/프비메인.webp" alt="프다 마스코트 프비" width={357} height={338} priority />
          </div>

          <div className={styles["intro-content"]}>
            <div className={styles["intro-copy"]}>
              <div>
                <p className={styles.greeting}>
                  <span>프다 친구들, 안녕!</span> 🐝
                </p>
                <h1 id="main-title">프론트엔드 지식을 더 쉽게!</h1>
              </div>
              <p className={styles.description}>궁금한 건 프비에게 물어보세요!</p>
            </div>

            <div className={styles["summary-form"]}>
              <div className={styles["topic-input"]}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
                <span>궁금한 내용을 입력하면 프비가 핵심만 요약해 드려요.</span>
                <span className={`material-symbols-outlined ${styles["submit-icon"]}`} aria-hidden="true">
                  arrow_upward
                </span>
              </div>

              <div className={styles["form-bottom"]}>
                <p className={styles.notice}>
                  Front Digest는 프론트엔드 학습을 위한 서비스입니다.
                  <br />
                  프론트엔드와 관련이 없거나 부적절한 콘텐츠는 사전 안내 없이 비공개 처리 또는 삭제될 수 있습니다.
                </p>

                <div className={styles["password-option"]}>
                  <span className={`material-symbols-outlined ${styles["checkbox-icon"]}`} aria-hidden="true">
                    check_box
                  </span>
                  <span>비밀번호 입력</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles["content-section"]} aria-label="주요 콘텐츠">
          <Banner />

          <div className={styles["quick-menu"]}>
            <div className={styles["quick-menu-card"]}>
              <span className="material-symbols-outlined" aria-hidden="true">
                assignment_add
              </span>
              <span>전체 요약 노트</span>
            </div>
            <div className={styles["quick-menu-card"]}>
              <span className="material-symbols-outlined" aria-hidden="true">
                quiz
              </span>
              <span>퀴즈</span>
            </div>
            <div className={styles["quick-menu-card"]}>
              <span className="material-symbols-outlined" aria-hidden="true">
                person
              </span>
              <span>마이페이지</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
