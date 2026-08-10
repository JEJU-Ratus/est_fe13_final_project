import Header from "@/components/Header";
import styles from "./layout.module.scss";

export default function RootLayout({ children }) {
  return (
    <div className={styles["site-layout"]}>
      <Header />
      <div className={styles["site-content"]}>{children}</div>
    </div>
  );
}
