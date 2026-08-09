# 데이터 모델: 요약 및 학습노트 상세

이 문서는 프런트엔드가 표시·검증·권한 판정에 필요로 하는 논리 데이터 모델이다. 데이터베이스 테이블이나 Supabase 스키마를 정의하지 않는다.

## Summary

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `summaryId` | 문자열 | 예 | URL의 `[summaryId]`와 일치하는 고유 식별자 |
| `topic` | 문자열 | 예 | 생성 주제로 공통 레이아웃에 표시 |
| `content` | 문자열 또는 구조화된 표시 데이터 | 예 | AI 요약본으로 모든 하위 페이지에 표시 |
| `authorId` | 문자열 | 예 | 현재 사용자의 삭제 권한 판정에 사용 |
| `isLocked` | Boolean | 예 | 참이면 세션 인증 전 보호 콘텐츠 비공개 |
| `isBookmarked` | Boolean | 로그인 사용자에게 예 | 북마크 버튼의 확정 표시 상태 |

### 관계

- Summary 하나는 StudyNote 0개 이상을 가진다.
- Summary 하나는 로그인 사용자별 BookmarkState 0개 또는 1개를 가진다.
- 잠긴 Summary 하나는 현재 브라우저 세션의 SummaryAccessState와 연결된다.

## StudyNote

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `noteId` | 문자열 | 예 | Summary 안에서 학습노트를 식별 |
| `summaryId` | 문자열 | 예 | 상위 Summary 식별자와 일치 |
| `authorId` | 문자열 | 예 | 수정·삭제 권한 판정에 사용 |
| `authorNickname` | 문자열 | 예 | 목록과 상세 표시 |
| `title` | 문자열 | 예 | trim 후 1~50자 |
| `learnedSummary` | 문자열 | 아니오 | trim 후 0~1,000자 |
| `reflection` | 문자열 | 아니오 | trim 후 0~1,000자 |
| `references` | 문자열 | 아니오 | trim 후 0~1,000자 |
| `createdAt` | 날짜·시간 값 | 예 | 목록을 최신 작성순으로 정렬하고 작성일 표시 |
| `quizStatus` | `notStarted` 또는 `completed` | 예 | 목록의 퀴즈 학습 상태 표시, 백분율은 사용하지 않음 |

### 관계

- StudyNote는 Summary 하나에만 속한다.
- StudyNote는 저장된 Quiz 0개 또는 1개와 연결된다.

## NoteForm

| 필드 | 형태 | 초기값 | 검증 |
|---|---|---|---|
| `title` | 문자열 | 작성 `""`, 수정 기존 제목 | trim 후 필수, 최대 50자 |
| `learnedSummary` | 문자열 | 작성 `""`, 수정 기존 값 | 선택, trim 후 최대 1,000자 |
| `reflection` | 문자열 | 작성 `""`, 수정 기존 값 | 선택, trim 후 최대 1,000자 |
| `references` | 문자열 | 작성 `""`, 수정 기존 값 | 선택, trim 후 최대 1,000자 |
| `errors` | 필드별 문자열 | 빈 객체 | blur 또는 제출 시 설정, 유효한 값으로 수정하면 해제 |
| `isSubmitting` | Boolean | `false` | 참이면 입력·제출 비활성화 및 Loading 표시 |

### 상태 전이

```text
초기/수정값 표시
  ├─ 입력 변경 → 편집 중
  ├─ blur → 정규화·필드 검증 → 오류 있음 또는 유효
  └─ 제출 → 전체 정규화·검증
                  ├─ 오류 있음 → 요청 없음, 오류 표시
                  └─ 유효 → isSubmitting=true → 저장 요청
                                   ├─ 성공 → 상세 페이지 이동
                                   └─ 실패 → isSubmitting=false, 입력 유지, 오류 모달
```

## Quiz

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `quizId` | 문자열 | 예 | 저장된 퀴즈 식별자 |
| `noteId` | 문자열 | 예 | 대상 StudyNote 식별자와 일치 |
| `question` | 문자열 | 예 | 모달의 문제 문구 |
| `options` | QuizOption 배열 | 예 | 최소 2개의 선택지 |
| `correctOptionId` | 문자열 | 예 | options 중 하나와 일치 |

## QuizOption

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `optionId` | 문자열 | 예 | Quiz 안에서 고유 |
| `label` | 문자열 | 예 | 사용자가 선택할 답안 문구 |

## QuizModalState

| 필드 | 형태 | 초기값 | 규칙 |
|---|---|---|---|
| `isOpen` | Boolean | `false` | 퀴즈 모달 표시 여부 |
| `selectedOptionId` | 문자열 또는 null | null | 제출 전 사용자가 선택한 한 답안 |
| `result` | `idle`, `correct`, `incorrect`, `unavailable` | `idle` | 제출·조회 결과 표시 |
| `isSubmitting` | Boolean | `false` | 참이면 중복 제출 차단 |

### 상태 전이

```text
닫힘 → 퀴즈 조회
          ├─ 데이터 있음 → 열림/idle → 답안 선택 → 제출 → correct 또는 incorrect
          └─ 없음·조회 실패 → 열림/unavailable
열림 → 닫기 → 상태 초기화/닫힘
```

## UserAccess

| 필드 | 형태 | 필수 | 의미 |
|---|---|---:|---|
| `isLoggedIn` | Boolean | 예 | 작성, 북마크, 퀴즈 접근 분기 |
| `userId` | 문자열 또는 null | 예 | 로그인 사용자의 소유권 비교 |

### 파생 권한

| 권한 | 조건 |
|---|---|
| `canCreateNote` | `isLoggedIn` |
| `canEditNote` | `isLoggedIn && userId === note.authorId` |
| `canDeleteNote` | `isLoggedIn && userId === note.authorId` |
| `canDeleteSummary` | `isLoggedIn && userId === summary.authorId` |
| `canToggleBookmark` | `isLoggedIn` |
| `canOpenQuiz` | `isLoggedIn`이며 저장 퀴즈가 조회 가능 |

## SummaryAccessState

| 필드 | 형태 | 필수 | 의미 |
|---|---|---:|---|
| `summaryId` | 문자열 | 예 | 인증 대상 Summary |
| `isVerified` | Boolean | 예 | 현재 브라우저 세션에서 인증 완료 여부 |
| `isSubmitting` | Boolean | UI 상태 | 비밀번호 검증 요청 중 여부 |
| `errorMessage` | 문자열 | UI 상태 | 불일치 시 `비밀번호가 일치하지 않습니다.` |

### 상태 전이

```text
공개 Summary → 콘텐츠 표시
잠김 + isVerified=true → 콘텐츠 표시
잠김 + isVerified=false → NotePwModal 표시
  ├─ 올바른 비밀번호 → 외부 세션 인증 완료 → 콘텐츠 표시
  ├─ 불일치 → 입력 초기화·모달 유지·재입력
  ├─ 시스템 오류 → 비밀번호 모달 닫기·CommonModal error
  └─ 닫기 → 이전 페이지 이동
```

## RequestState

생성·수정·삭제·북마크 연산은 공통으로 다음 상태를 사용한다.

```text
idle → pending → success
              └→ error → idle 또는 재시도
```

- `pending` 중 동일 연산 재진입을 차단한다.
- 생성·수정·삭제는 `pending` 중 전체 화면 Loading을 표시한다.
- 실패 시 원본 입력 또는 확정된 페이지 상태를 유지한다.
- 북마크는 성공 응답의 확정값으로 `isBookmarked`를 변경하고 실패 시 기존 값을 보존한다.

