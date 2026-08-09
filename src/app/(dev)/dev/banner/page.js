import Banner from "@/components/Banner";
import styles from "./page.module.scss";

export default function BannerDevPage() {
  return (
    <main className={styles["banner-dev-page"]}>
      <h1>Banner 개발 확인</h1>

      <section>
        <h2>내부 목적지 배너</h2>
        <div className={styles["banner-preview"]}>
          <Banner href="/dev" alt="개발 확인 페이지로 이동하는 프론트엔드 스킬업 이벤트" />
        </div>
      </section>

      <section>
        <h2>외부 목적지 배너</h2>
        <div className={styles["banner-preview"]}>
          <Banner
            href="https://example.com"
            alt="외부 이벤트 페이지로 이동하는 프론트엔드 스킬업 이벤트"
          />
        </div>
      </section>
    </main>
  );
}
