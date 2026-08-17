import styles from "./SummaryId.module.scss";
import { createClient } from "@/lib/supabase/server";
import AiSummaryLayoutClient from "./AiSummaryLayoutClient";
import Link from "next/link";
import SummaryContent from "./SummaryContent";

export async function generateMetadata({ params }) {
  const { summaryId } = await params;
  const supabase = await createClient();
  const { data: summary } = await supabase
    .from("summaries")
    .select("title, topic, excerpt, is_locked")
    .eq("id", summaryId)
    .maybeSingle();

  if (!summary) {
    return {
      title: "요약 노트 | 프다!",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${summary.title} | 프다!`,
    description: summary.excerpt || `${summary.topic} 요약 노트`,
    robots: summary.is_locked
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function AiSummaryLayout({ children, params }) {
  // URL에서 summaryId 가져오기
  const { summaryId } = await params;

  // 서버에서 사용할 Supabase 클라이언트 생성
  const supabase = await createClient();

  // 현재 summaryId에 해당하는 요약 노트 조회
  const { data: summary, error: summaryError } = await supabase
    .from("summaries")
    .select(
      `
      id,
      author_id,
      topic,
      title,
      is_locked,
      created_at
    `,
    )
    .eq("id", summaryId)
    .maybeSingle();

  // 요약 노트 조회 실패
  if (summaryError) {
    console.error("요약노트 조회 실패:", summaryError);
    return null;
  }

  return (
    <main className={styles["Ai-page"]}>
      <div className={styles["Ai-container"]}>
        <section className={styles["ai-summary"]}>
          <div className={styles["Ai-header"]}>
            {/* 요약 상세 페이지로 이동 */}
            <Link
              className={styles["topic-link"]}
              href={`/summary/${summaryId}`}
              aria-label={`${summary?.title ?? "요약 노트"} 요약 상세로 이동`}
              data-tooltip="요약 상세로 이동"
            >
              <h2 className={styles["Ai-title"]}>{summary?.title ?? ""}</h2>
            </Link>

            {/* 제목 옆 북마크 버튼 */}
            <AiSummaryLayoutClient summaryId={summaryId} type="bookmark" />
          </div>

          {/* 퀴즈 생성 버튼 */}
          <AiSummaryLayoutClient summaryId={summaryId} type="quiz" />

          {/* TODO: 상세 content 구조 확정 후 Supabase 데이터 연결 */}
          <div className={styles["Ai-content"]}>
            <SummaryContent summaryId={summaryId} />
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
