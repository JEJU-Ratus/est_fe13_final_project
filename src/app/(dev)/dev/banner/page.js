import Banner from "@/components/Banner";
import styles from "./page.module.scss";

export default function BannerDevPage() {
  return (
    <main className={styles["banner-dev-page"]}>
      <h1>Banner 개발 확인</h1>

      <section>
        <h2>기본 배너 이미지</h2>
        <div className={styles["banner-preview"]}>
          <Banner />
        </div>
      </section>
    </main>
  );
}
