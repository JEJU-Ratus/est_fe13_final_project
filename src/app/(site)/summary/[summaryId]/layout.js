import styles from "./SummaryId.module.scss";
import { createClient } from "@/lib/supabase/server";
import AiSummaryLayoutClient from "./AiSummaryLayoutClient";
import Link from "next/link";
import SummaryContent from "./SummaryContent";

export default async function AiSummaryLayout({ children, params }) {
  // 현재 URL의 요약 노트 ID
  const { summaryId } = await params;

  // 서버용 Supabase 클라이언트 생성
  const supabase = await createClient();

  // 현재 요약 노트 기본 정보 조회
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

  // 요약 노트 조회 실패 시 렌더링 중단
  if (summaryError) {
    console.error("요약노트 조회 실패:", summaryError);
    return null;
  }

  return (
    <main className={styles["Ai-page"]}>
      {/* 로그인하지 않은 상태로 학습노트에 직접 접근하면 로그인 모달 표시 */}
      <AiSummaryLayoutClient summaryId={summaryId} type="auth" />

      <div className={styles["Ai-container"]}>
        <section className={styles["ai-summary"]}>
          {/* 요약 노트 제목 + 북마크 영역 */}
          <div className={styles["Ai-header"]}>
            {/* 제목 클릭 시 해당 요약 노트 상세페이지로 이동 */}
            <Link
              className={styles["topic-link"]}
              href={`/summary/${summaryId}`}
              aria-label={`${summary?.title ?? "요약 노트"} 요약 상세로 이동`}
              data-tooltip="요약 상세로 이동"
            >
              <h2 className={styles["Ai-title"]}>{summary?.title ?? ""}</h2>
            </Link>

            {/* 현재 요약 노트 북마크 추가 / 삭제 */}
            <AiSummaryLayoutClient summaryId={summaryId} type="bookmark" />
          </div>

          {/* 학습노트 상세페이지에서만 퀴즈 풀기 버튼 표시 */}
          <AiSummaryLayoutClient summaryId={summaryId} type="quiz" />

          {/* 현재 summaryId에 해당하는 요약 노트 본문 표시 */}
          <div className={styles["Ai-content"]}>
            <SummaryContent summaryId={summaryId} />
          </div>
        </section>

        {/* notes 상세 / 작성 / 수정 등 하위 페이지 렌더링 */}
        {children}
      </div>
    </main>
  );
}
