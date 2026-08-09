# 인터페이스 계약: 요약 및 학습노트 상세

## 목적과 범위

이 계약은 네 제품 경로, 프런트엔드가 외부 인증·데이터 서비스에 요구하는 연산, 새 UI 컴포넌트와 기존 공통 컴포넌트의 연결을 정의한다. 실제 HTTP URL, Supabase 테이블·쿼리, Route Handler 또는 Server Action 구조는 정의하지 않는다.

## 라우트 계약

| 경로 | 주요 결과 | 접근 규칙 |
|---|---|---|
| `/summary/[summaryId]` | 요약 공통 영역, 학습노트 목록·빈 상태, 생성·삭제·북마크 | 방문자 조회 가능, 잠김이면 세션 인증 선행 |
| `/summary/[summaryId]/notes/new` | 학습노트 작성 양식 | 로그인 필수, 잠김이면 세션 인증 선행 |
| `/summary/[summaryId]/notes/[noteId]` | 학습노트 상세, 퀴즈·수정·삭제 | 방문자 조회 가능, 잠김이면 세션 인증 선행 |
| `/summary/[summaryId]/notes/[noteId]/edit` | 기존 값이 채워진 수정 양식 | 로그인 및 학습노트 작성자, 잠김이면 세션 인증 선행 |

### 공통 경로 규칙

- 모든 경로는 `summaryId`의 Summary가 없으면 찾을 수 없음으로 처리한다.
- `noteId` 경로는 StudyNote가 없거나 해당 Summary에 속하지 않으면 찾을 수 없음으로 처리한다.
- 잠긴 Summary는 보호 콘텐츠를 렌더링하기 전에 `isSummaryVerified`를 확인한다.
- 비밀번호 모달 닫기는 브라우저의 이전 페이지로 이동한다.
- 비로그인 작성 접근은 `/login`, 비작성자 수정 접근은 `/allnote`로 이동한다.

## 서비스 입력·출력 계약

연산 이름은 책임을 설명하기 위한 논리 이름이며 실제 함수명이나 전송 방식을 강제하지 않는다.

### `getSummaryDetail(summaryId, viewer)`

**입력**

- `summaryId`: 비어 있지 않은 문자열
- `viewer`: `isLoggedIn`, `userId`

**성공 결과**

- [Summary](../data-model.md#summary)
- 현재 사용자의 `isBookmarked`
- 현재 브라우저 세션의 `isSummaryVerified`

**오류 결과**

- `notFound`: Summary 없음
- `unauthorized`: 인증 정보가 필요한 상태
- `forbidden`: 접근 권한 없음
- `system`: 서버 또는 네트워크 실패

### `listSummaryNotes(summaryId)`

**성공 결과**

- StudyNote 목록
- `createdAt` 내림차순
- 빈 배열 허용

### `getStudyNote(summaryId, noteId, viewer)`

**성공 결과**: Summary에 속한 StudyNote 하나와 파생 수정·삭제 권한

**필수 검증**: 반환 StudyNote의 `summaryId`가 경로 `summaryId`와 같아야 한다.

### `createStudyNote(summaryId, input)`

**입력**

```text
title: trim 후 1~50자
learnedSummary: trim 후 0~1,000자
reflection: trim 후 0~1,000자
references: trim 후 0~1,000자
```

**성공 결과**: 생성된 `summaryId`, `noteId`

**성공 이동**: `/summary/{summaryId}/notes/{noteId}`

### `updateStudyNote(summaryId, noteId, input)`

**입력**: `createStudyNote`와 같은 정규화·검증 규칙

**성공 결과**: 수정된 `summaryId`, `noteId`

**성공 이동**: `/summary/{summaryId}/notes/{noteId}`

### `deleteSummary(summaryId)`

- 호출 전 현재 사용자가 Summary 작성자인지 확인한다.
- Summary와 소속 StudyNote를 함께 제거하는 하나의 서비스 연산이어야 한다.
- 성공 이동은 `/allnote`다.

### `deleteStudyNote(summaryId, noteId)`

- 호출 전 현재 사용자가 StudyNote 작성자인지 확인한다.
- 지정 StudyNote만 제거한다.
- 성공 이동은 `/allnote`다.

### `toggleSummaryBookmark(summaryId, currentState)`

- 로그인 사용자만 호출한다.
- 성공 결과는 서버가 확정한 `isBookmarked` Boolean이다.
- 실패하면 UI가 `currentState`를 유지한다.

### `verifySummaryPassword(summaryId, password)`

- 비어 있거나 공백뿐인 비밀번호는 호출하지 않는다.
- 성공하면 외부 인증 계층이 동일 브라우저 세션에서 해당 `summaryId`와 하위 경로의 인증 완료 상태를 유지한다.
- 불일치는 `invalidPassword`로 구분한다.
- UI나 계약 소비자는 원문 비밀번호를 영속 저장하지 않는다.

### `getStoredQuiz(summaryId, noteId)`

**성공 결과**: [Quiz](../data-model.md#quiz) 또는 저장 퀴즈 없음

**제약**: 퀴즈 생성, 수정과 저장 연산은 이번 계약에 포함하지 않는다.

## 오류 정규화

| 서비스 결과 | 화면 처리 |
|---|---|
| `notFound` | `notFound()`로 찾을 수 없음 처리 |
| `unauthorized` | 작성 경로는 `/login`; 퀴즈 선택은 `CommonModal suggestLogin` |
| `forbidden` | 수정 경로는 `/allnote`; 그 밖의 시스템 권한 오류는 `CommonModal error`의 정규화 상태 |
| `invalidPassword` | `NotePwModal` 내부에 `비밀번호가 일치하지 않습니다.` 표시 |
| `system` 또는 네트워크 오류 | 현재 상태를 보존하고 `CommonModal error`에 정규화 상태 전달 |

원본 Error, Response, 서버 내부 메시지와 비밀번호는 UI 컴포넌트 props로 전달하지 않는다.

## `NoteItem` UI 계약

**위치**

```text
src/components/NoteItem.jsx
src/components/NoteItem.module.scss
```

**Props**

| 이름 | 형태 | 필수 | 책임 |
|---|---|---:|---|
| `summaryId` | 문자열 | 예 | 상세 목적지 구성 |
| `noteId` | 문자열 | 예 | 상세 목적지 구성 및 목록 key |
| `authorNickname` | 문자열 | 예 | 작성자 표시 |
| `topic` | 문자열 | 예 | 주제 표시 |
| `createdAt` | 날짜 표시 문자열 | 예 | 작성일 표시 |
| `quizStatus` | `notStarted` 또는 `completed` | 예 | 회색·컬러 학습 상태 표시 |

**행동**

- 전체 항목은 `/summary/{summaryId}/notes/{noteId}`로 이동하는 정적 링크다.
- 퀴즈 백분율은 표시하지 않는다.
- 긴 작성자명과 주제는 목록 배치를 깨뜨리지 않아야 한다.

## `QuizModal` UI 계약

**위치**

```text
src/components/QuizModal.jsx
src/components/QuizModal.module.scss
```

**Props**

| 이름 | 형태 | 필수 | 책임 |
|---|---|---:|---|
| `isOpen` | Boolean | 예 | 모달 표시 여부 |
| `quiz` | Quiz 또는 null | 아니오 | 문제·답안·정답 판정 자료 |
| `isUnavailable` | Boolean | 아니오 | 저장 퀴즈 없음·조회 실패 상태 |
| `onClose` | 함수 | 예 | 닫기 의사를 호출 측에 전달 |

**행동**

- `isOpen=false`면 렌더링하지 않는다.
- 사용자는 답안 하나를 선택하고 한 번 제출할 수 있다.
- 제출 후 정답 또는 오답 결과를 표시한다.
- `isUnavailable=true` 또는 `quiz=null`이면 풀 수 없는 안내만 표시하고 제출을 비활성화한다.
- 닫을 때 선택과 결과 상태를 초기화하고 `onClose()`를 호출한다.
- 퀴즈 조회, 생성, 저장과 경로 이동은 담당하지 않는다.

## 기존 공통 UI 연결 계약

- 비밀번호: [`NotePwModal`](../../004-note-password-modal/contracts/NotePwModal.md)의 공개 props를 그대로 사용한다.
- 삭제·로그인 제안·시스템 오류: [`CommonModal`](../../005-common-modal/contracts/CommonModal.md)의 `confirmDelete`, `suggestLogin`, `error` 모드를 그대로 사용한다.
- 요청 진행: [`Loading`](../../007-loading/contracts/Loading.md)을 호출 측 `isLoading`으로 조건부 렌더링한다.
- 한 화면은 `CommonModal` 인스턴스 하나와 활성 mode 하나만 유지한다.

## 구현 전 필수 전제조건

- 위 서비스 연산을 제공하는 기존 인터페이스의 실제 호출 위치와 형태가 확인되어야 한다.
- 로그인 상태, 현재 사용자, 작성자 판정과 Summary 세션 인증 상태가 제공되어야 한다.
- 전제조건이 없으면 임시 Supabase 구조, 임의 URL 또는 제품 경로 하드코딩 데모 데이터로 대체하지 않는다.

