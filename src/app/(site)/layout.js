import { Noto_Sans_KR } from "next/font/google"; // 내장 폰트 시스템
import "@/app/globals.scss"; // 프로젝트 전역 css
import Header from "@/components/header";

const notoSans = Noto_Sans_KR({
  // 폰트를 변수에 저장. 아래는 옵션
  weight: ["400", "500", "600", "700"], // 굵기
  subsets: ["latin"], // 영어도 문제 없게 최적화
});
export const metadata = {
  title: "프다! - Front Digest",
  description: "AI 기반 주제 요약 및 학습 공유 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${notoSans.className}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
