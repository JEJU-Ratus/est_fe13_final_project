# 데이터 모델: 요약 및 학습노트 상세 mock read-only 연결

이 문서는 현재 증분에서 기존 JSON을 화면에 연결하기 위한 논리 모델을 정의한다. 데이터베이스 테이블이나 Supabase 스키마가 아니며, 생성·수정·삭제 결과를 저장하는 모델도 아니다.

## 원본 fixture 모델

원본 파일은 조회 입력으로만 사용하며 필드 추가·수정·삭제 또는 배열 재정렬을 하지 않는다.

### MockSummary (`summaries.json`)

| 필드 | 형태 | 현재 용도 |
|---|---|---|
| `summaryId` | 문자열 | `[summaryId]` 조회 키 |
| `authorId` | 문자열 | 작성자 관계 식별자 |
| `topic` | 문자열 | 공통 레이아웃 주제 및 학습노트 항목 주제 |
| `title` | 문자열 | 요약본 제목 데이터 |
| `excerpt` | 문자열 | 현재 상세 화면에서는 사용하지 않음 |
| `aiSummary` | `{ title, sections[] }` | 공통 레이아웃 AI 요약 표시 |
| `isPrivate` | Boolean | 표시 데이터이며 잠금 인증에는 사용하지 않음 |
| `createdAt`, `updatedAt` | ISO 날짜·시간 문자열 | 원본 메타데이터 |

### MockStudyNote (`learning-notes.json`)

| 필드 | 형태 | 현재 용도 |
|---|---|---|
| `noteId` | 문자열 | `[noteId]` 조회 키 |
| `summaryId` | 문자열 | 상위 요약본 관계 검증·목록 필터 |
| `authorId` | 문자열 | 사용자 결합 키 |
| `title` | 문자열 | 목록·상세·수정 초기 제목 |
| `content` | 문자열 | 화면의 `learnedSummary`로 변환 |
| `isQuizCompleted` | Boolean | 목록의 퀴즈 완료 여부 표시 |
| `createdAt`, `updatedAt` | ISO 날짜·시간 문자열 | 최신순 정렬 및 표시 |

### MockUser (`users.json`)

| 필드 | 형태 | 현재 용도 |
|---|---|---|
| `userId` | 문자열 | 학습노트 `authorId` 결합 키 |
| `nickname` | 문자열 | 학습노트 목록의 작성자 표시 |
| `profileImageUrl`, `bio` | 문자열 | 현재 상세 화면에서는 사용하지 않음 |

### MockBookmark (`bookmarks.json`)

| 필드 | 형태 | 현재 용도 |
|---|---|---|
| `bookmarkId` | 문자열 | 원본 관계 식별자 |
| `userId` | 문자열 | 고정 검증 사용자 `user-001` 비교 |
| `summaryId` | 문자열 | 현재 요약본 비교 |
| `createdAt` | ISO 날짜·시간 문자열 | 현재 상세 화면에서는 사용하지 않음 |

## 정규화 화면 모델

### SummaryView

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `summaryId` | 문자열 | 예 | 원본과 동일하며 URL 식별자와 일치 |
| `authorId` | 문자열 | 예 | 원본 작성자 식별자 |
| `topic` | 문자열 | 예 | 공통 레이아웃과 `NoteItem`에 표시 |
| `title` | 문자열 | 예 | 원본 제목 |
| `aiSummary` | `{ title, sections[] }` | 예 | 원본 값을 복사해 표시 |
| `isPrivate` | Boolean | 예 | 잠금 인증을 수행하지 않는 읽기 데이터 |

조회 결과가 없으면 `null`이며 호출 경로에서 `notFound()`로 처리한다.

### StudyNoteView

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `noteId` | 문자열 | 예 | 원본 학습노트 식별자 |
| `summaryId` | 문자열 | 예 | 요청의 상위 `summaryId`와 일치해야 함 |
| `authorId` | 문자열 | 예 | 원본 작성자 식별자 |
| `authorNickname` | 문자열 | 예 | 사용자 결합 결과, 누락 시 `알 수 없는 사용자` |
| `title` | 문자열 | 예 | 목록·상세·수정 초기값 |
| `learnedSummary` | 문자열 | 예 | 원본 `content` 값 |
| `reflection` | 문자열 | 예 | mock에 필드가 없어 `""` |
| `references` | 문자열 | 예 | mock에 필드가 없어 `""` |
| `createdAt` | ISO 날짜·시간 문자열 | 예 | 최신순 정렬 기준 |
| `createdAtDisplay` | `YYYY.MM.DD` 문자열 | 예 | ISO 원본의 날짜 부분을 변환해 기존 `NoteItem`에 전달 |
| `quizStatus` | `notStarted` 또는 `completed` | 예 | `isQuizCompleted`에서 변환 |

### BookmarkDisplayState

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `userId` | 문자열 | 예 | 현재 증분에서는 `user-001` 고정 |
| `summaryId` | 문자열 | 예 | 현재 경로의 요약본 |
| `isBookmarked` | Boolean | 예 | 두 식별자가 모두 일치하는 관계의 존재 여부 |

이 상태는 표시 전용이다. 토글·추가·삭제 상태 전이는 없다.

### EditNoteInitialValues

| 필드 | 형태 | 초기값 규칙 |
|---|---|---|
| `title` | 문자열 | `StudyNoteView.title` |
| `learnedSummary` | 문자열 | `StudyNoteView.learnedSummary` |
| `reflection` | 문자열 | `StudyNoteView.reflection`, 현재 `""` |
| `references` | 문자열 | `StudyNoteView.references`, 현재 `""` |

수정 화면은 이 값을 표시하지만 입력 변경이나 저장 결과를 영속화하지 않는다.

## 관계와 조회 흐름

```text
summaryId
  ├─ MockSummary 단건 조회
  │    ├─ 없음 → notFound()
  │    └─ 있음 → SummaryView
  ├─ MockStudyNote 필터 → 파생 배열 최신순 정렬
  │    └─ MockUser 결합 → StudyNoteView[]
  └─ user-001 + MockBookmark 관계 조회 → BookmarkDisplayState

summaryId + noteId
  └─ 두 식별자가 모두 일치하는 MockStudyNote 조회
       ├─ 없음 → notFound()
       └─ 있음 → StudyNoteView → 상세 또는 EditNoteInitialValues
```

## 불변 조건

- 모든 함수는 원본 JSON 객체와 배열을 변경하지 않는다.
- 목록 정렬은 필터로 생성한 파생 배열에만 수행한다.
- 학습노트 단건은 `noteId`만 맞아도 반환하지 않고 `summaryId` 관계까지 확인한다.
- 존재하지 않는 사용자는 학습노트 조회 실패 원인이 아니며 작성자명을 `알 수 없는 사용자`로 표시한다.
- 북마크는 고정 사용자 기준의 현재 값만 반환하고 화면에서 변경하지 않는다.
- mock에 없는 회고·참고자료·퀴즈 본문·잠금 비밀번호·권한 정보는 추정해 채우지 않는다.

## 이후 실제 서비스에서 별도 설계할 모델

다음 모델은 최종 목표인 실제 DB 연결 단계에 필요하지만 현재 mock read-only 증분에는 포함하지 않는다.

- 생성·수정 입력 검증과 요청 상태
- 삭제 및 북마크 변경 명령
- 실제 로그인 사용자와 소유권 판정
- 잠금 비밀번호와 세션 인증 상태
- 퀴즈 문제·선택지·정답·제출 결과
- Supabase 테이블, 정책, 쿼리와 오류 형식
