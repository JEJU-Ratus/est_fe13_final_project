# 인터페이스 계약: 요약 및 학습노트 상세 mock read-only 연결

## 목적과 범위

이 계약은 기존 `src/mocks` JSON과 요약 상세 화면 사이의 임시 조회 인터페이스를 정의한다. HTTP API, Route Handler, Server Action, Supabase 또는 영속 저장 계약은 정의하지 않는다.

## mock 어댑터 계약

**위치**

```text
src/mocks/summary-detail.js
```

어댑터는 원본 JSON을 정적 import하고 정규화된 새 객체 또는 새 배열만 반환한다.

### `MOCK_CURRENT_USER_ID`

- 값: `"user-001"`
- 용도: 실제 로그인 연결 전 북마크 표시 상태를 재현하는 고정 검증 사용자
- 제약: 인증 완료나 접근 권한의 근거로 사용하지 않는다.

### `getMockSummary(summaryId)`

**입력**: 비어 있지 않은 `summaryId` 문자열

**결과**:

- 일치하는 항목이 있으면 `SummaryView`
- 없으면 `null`

호출 측은 `null`을 정상 요약본으로 대체하지 않고 `notFound()`로 처리한다.

### `getMockSummaryNotes(summaryId)`

**입력**: 현재 요약본의 `summaryId`

**결과**:

- `summaryId`가 일치하는 `StudyNoteView[]`
- `createdAt` 내림차순
- 항목이 없으면 빈 배열
- 사용자 결합 실패 항목도 유지하되 `authorNickname="알 수 없는 사용자"`

### `getMockStudyNote(summaryId, noteId)`

**입력**: 상위 `summaryId`와 학습노트 `noteId`

**결과**:

- 두 식별자가 모두 일치하면 `StudyNoteView`
- 학습노트가 없거나 다른 요약본에 속하면 `null`

호출 측은 `null`을 `notFound()`로 처리한다.

### `getMockBookmarkState(summaryId, userId)`

**입력**: 요약본 `summaryId`, 사용자 `userId`

**결과**: 두 식별자가 모두 일치하는 북마크 관계가 있으면 `true`, 없으면 `false`

이 함수는 관계를 생성·삭제하거나 원본 배열을 변경하지 않는다.

## 필드 변환 계약

| 원본 | 정규화 결과 |
|---|---|
| `summary.aiSummary` | `SummaryView.aiSummary` |
| `note.content` | `StudyNoteView.learnedSummary` |
| 원본에 없는 회고 | `StudyNoteView.reflection=""` |
| 원본에 없는 참고자료 | `StudyNoteView.references=""` |
| `note.isQuizCompleted=true` | `quizStatus="completed"` |
| `note.isQuizCompleted=false` | `quizStatus="notStarted"` |
| `note.authorId`와 일치하는 사용자 | `authorNickname=user.nickname` |
| 일치 사용자가 없음 | `authorNickname="알 수 없는 사용자"` |
| `note.createdAt` | ISO 날짜 부분을 `YYYY.MM.DD`로 변환한 `createdAtDisplay` |

## 라우트 소비 계약

실제 Git 추적 경로의 소문자 URL을 기준으로 한다.

| 경로 | 조회와 결과 |
|---|---|
| `/summary/[summaryId]` 공통 레이아웃 | 요약 단건을 조회하고 없으면 404. `topic`, AI 요약, `user-001` 북마크 읽기 상태 표시 |
| `/summary/[summaryId]` | 학습노트를 최신순으로 표시하고 빈 배열이면 `EmptyState` 표시 |
| `/summary/[summaryId]/notes/new` | 공통 요약본 404 경계만 공유하며 작성·저장은 현재 비활성 |
| `/summary/[summaryId]/notes/[noteId]` | 상위 관계가 일치하는 단건을 표시하고 없으면 404 |
| `/summary/[summaryId]/notes/[noteId]/edit` | 상위 관계가 일치하는 단건의 기존 값을 표시하고 없으면 404. 저장은 현재 비활성 |

### 공통 경로 규칙

- 공통 레이아웃이 존재하지 않는 `summaryId`를 차단한다.
- 학습노트 상세·수정은 `noteId` 존재와 상위 `summaryId` 관계를 함께 검증한다.
- 잘못된 식별자에 placeholder 정상 콘텐츠를 표시하지 않는다.
- 별도 404 UI 명세가 없으므로 새로운 `not-found.js`를 만들지 않는다.

## 기존 공통 UI 계약

### `NoteItem`

기존 공개 props를 변경하지 않고 다음 정규화 값을 전달한다.

| prop | 값 |
|---|---|
| `summaryId` | 현재 요약본 식별자 |
| `noteId` | 학습노트 식별자 |
| `authorNickname` | 사용자 결합 결과 또는 fallback |
| `topic` | 상위 요약본 주제 |
| `createdAt` | `createdAtDisplay` (`YYYY.MM.DD`) |
| `quizStatus` | `notStarted` 또는 `completed` |

### `EmptyState`

- 학습노트 목록이 빈 배열일 때 사용한다.
- message는 `현재 리스트가 없습니다.`다.
- 로딩·오류·조회 성공 여부를 `EmptyState`가 추론하지 않는다.

## read-only 경계

현재 어댑터와 페이지에는 다음 함수나 성공 동작을 추가하지 않는다.

- 학습노트 생성·수정·삭제
- 요약본 삭제
- 북마크 추가·삭제·토글
- 잠금 비밀번호 검증
- 퀴즈 조회·생성·제출·저장
- 로그인 사용자 조회와 권한 검증
- JSON 파일 쓰기

수정 화면의 입력값은 기존 값 검증용이며 제출 버튼은 비활성 상태를 유지한다. 북마크는 `aria-pressed` 등 현재 상태를 표현할 수 있지만 사용자 조작으로 값이 바뀌거나 저장된 것처럼 보여서는 안 된다.

## 오류와 fallback

| 조건 | 결과 |
|---|---|
| 요약본 없음 | `notFound()` |
| 학습노트 없음 | `notFound()` |
| 학습노트가 다른 요약본에 속함 | `notFound()` |
| 작성자 사용자 없음 | 조회 유지, `알 수 없는 사용자` 표시 |
| 학습노트 목록 없음 | `EmptyState` 표시 |

mock 정적 import에는 네트워크 요청 상태가 없으므로 임의의 로딩·네트워크 오류 화면을 추가하지 않는다.

## 실제 서비스로 전환할 때 재설계할 계약

최종 DB 연결 단계에서는 다음 계약을 별도로 확정해야 한다.

- Supabase 조회와 CRUD 함수, 오류 정규화
- 로그인 사용자·소유권·Row Level Security
- 잠금 비밀번호 검증과 세션 유지
- 북마크 변경의 서버 확정 상태
- 저장 퀴즈 조회와 제출 결과
- 생성·수정 입력 검증, 중복 요청 차단과 성공 이동

현재 mock 계약은 개발·화면 검증용이며 이 실제 서비스 계약을 완료한 것으로 간주하지 않는다.
