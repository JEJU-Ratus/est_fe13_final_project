import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import styles from "./layout.module.scss";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <div className={styles["site-layout"]}>
        <Header />
        <div className={styles["site-content"]}>{children}</div>
      </div>
    </AuthProvider>
  );
}
