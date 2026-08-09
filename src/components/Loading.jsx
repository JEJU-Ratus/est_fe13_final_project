import styles from "./Loading.module.scss";

// 로딩 여부는 이 컴포넌트가 판단하지 않고 호출하는 쪽의 isLoading 상태가 결정합니다.
export default function Loading() {
  return (
    <div
      className={styles["loading-overlay"]}
      // 현재 화면이 처리 중이라는 상태를 보조기기에 전달합니다.
      role="status"
      // 로딩 UI가 나타났을 때 안내 문구를 사용자 작업을 방해하지 않는 방식으로 읽습니다.
      aria-live="polite"
      // 이 영역과 관련된 작업이 아직 완료되지 않았음을 보조기기에 알립니다.
      aria-busy="true"
    >
      {/* 다음 커밋 단계에서 프로필 이미지와 막대형 스피너로 확장할 임시 안내 문구입니다. */}
      <p className={styles["loading-message"]}>로딩 중...</p>
    </div>
  );
}
