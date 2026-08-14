import styles from "./SummaryId.module.scss";
import { createClient } from "@/lib/supabase/server";
import AiSummaryLayoutClient from "./AiSummaryLayoutClient";
import Link from "next/link";
import SummaryContent from "./SummaryContent";
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

            {/* 북마크/퀴즈 등 클라이언트 동작 */}
            <AiSummaryLayoutClient summaryId={summaryId} />
          </div>

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
