# 인터페이스 계약: 학습노트 전체 목록

## 범위

이 계약은 `/mypage/summaries`와 `/summary/[summaryId]/notes`가 사용하는 내부 조회·UI 경계를 정의한다. 외부 공개 HTTP API, 새 Route Handler, 새 데이터 요청 라이브러리와 새 Supabase 스키마를 정의하지 않는다. 실제 인증·RLS·저장소 연결은 기존 Supabase 공통 클라이언트와 `specs/002-summary-detail`의 데이터 계약을 소비한다.

## 목록 범위

```text
StudyNoteListScope =
  | { type: "mine" }
  | { type: "summary", summaryId: string }
```

- `mine`: 현재 검증된 인증 사용자 본인이 작성한 학습노트만 조회한다.
- `summary`: 경로의 `summaryId`에 소속된 학습노트만 조회한다.
- `userId`는 브라우저 입력이나 Client Component props로 받지 않는다. 현재 사용자는 기존 인증 서비스가 결정한다.

## 논리 조회 계약

### `loadStudyNotePage(scope, cursor)`

**입력**:

```text
scope: StudyNoteListScope
cursor: StudyNoteCursor | null
limit: 12
```

**결과**: [데이터 모델](../data-model.md)의 `StudyNoteListPage`

- 첫 호출은 `cursor=null`이다.
- `limit`은 화면 계약상 12이며, 호출자가 다른 값을 전달하더라도 서비스 경계에서 최대 12로 정규화한다.
- 결과는 `createdAt DESC, noteId DESC`로 정렬한다.
- `totalCount`, `items`, `nextCursor`, `hasMore`를 같은 조회 문맥으로 반환한다.
- 화면에 필요한 필드만 조회 모델로 정규화한다. DB 원문, 사용자 비밀번호, 내부 정책명은 반환하지 않는다.

### `loadSummaryNoteAccess(summaryId)`

**입력**: 경로에서 받은 `summaryId`

**결과**: `public | authorized | passwordRequired | notFound | error`

- 공개 요약본은 `public`으로 반환한다.
- 잠긴 요약본의 동일 브라우저 세션 인증이 완료된 경우 `authorized`로 반환한다.
- 잠긴 요약본이지만 현재 세션이 인증되지 않은 경우 `passwordRequired`로 반환하고 목록 항목을 반환하지 않는다.
- 없는 식별자는 `notFound`로 반환한다.
- 데이터 요청 실패는 `error`로 정규화한다.

비밀번호 제출·검증·동일 세션 인증 유지의 구체적인 함수와 저장 위치는 기존 요약 잠금 서비스가 제공한다. `NotePwModal`은 입력값과 제출·닫기 UI만 담당하며, 이 기능은 비밀번호를 직접 저장하지 않는다.

## 오류 계약

```text
StudyNoteReadError =
  | { code: "UNAUTHENTICATED", status: 401 }
  | { code: "FORBIDDEN", status: 403 }
  | { code: "NOT_FOUND", status: 404 }
  | { code: "REQUEST_FAILED", status: 500 | "network" }
```

| 오류 위치 | 사용자 결과 | 종료 후 이동 |
|---|---|---|
| `/mypage/summaries` 접근 | 기존 `AuthGuard`의 `requireLogin` 모달 | 접근 시점부터 3초 후 `/login` |
| 내 목록 일반 조회 | `CommonModal mode="error"` | 모달 종료 후 `/mypage` |
| 요약본 목록 일반 조회 | `CommonModal mode="error"` | 모달 종료 후 `/summary/[summaryId]` |
| 존재하지 않는 `summaryId` | `CommonModal mode="error"` | 모달 표시 후 3초 뒤 `/` |
| 잠긴 요약본 인증 실패 | 기존 `NotePwModal`의 인라인 오류 | 목록을 공개하지 않고 재입력 허용 |
| 잠긴 요약본 인증 요청 실패 | `NotePwModal` 종료 후 `CommonModal mode="error"` | 호출 화면의 오류 후속 이동 |

오류 모달은 EmptyState를 대신하지 않는다. 이미 표시된 학습노트가 추가 로딩 실패를 겪으면 기존 항목을 유지하고 오류를 알린다.

## `AllNotes` UI 계약

**예정 파일**:

```text
src/components/AllNotes.jsx
src/components/AllNotes.module.scss
```

`AllNotes`는 두 라우트에서 공통으로 사용되는 기능 전용 Client Component다. 논리 입력은 다음과 같다.

| 입력 | 형태 | 설명 |
|---|---|---|
| `scope` | `mine` \| `summary` | 목록 범위 |
| `summaryId` | 문자열 \| 생략 | `scope="summary"`일 때 필수 |
| `banner` | `BannerData` | 상단 배너에 전달할 정규화된 데이터 |
| `loadPage` | 목록 조회 함수 경계 | 현재 scope와 cursor로 다음 페이지를 요청 |
| `initialPage` | `StudyNoteListPage` \| 초기 미제공 | 기존 서비스가 서버에서 첫 페이지를 전달하는 경우 사용 |
| `accessState` | `SummaryNoteAccessState` \| 생략 | 요약본 잠금 접근 상태 |

구현 시 실제 transport는 기존 데이터 서비스가 결정하지만, `AllNotes`는 다음 동작을 보장해야 한다.

- 초기 목록은 최대 12개와 전체 개수 또는 빈 상태를 표시한다.
- 목록 끝에 접근하면 `hasMore=true`이고 현재 추가 요청이 없을 때만 다음 페이지를 한 번 요청한다.
- 같은 cursor를 다시 요청하지 않고, 이미 표시한 `${summaryId}:${noteId}`를 다시 렌더링하지 않는다.
- `NoteItem`에 기존 props를 전달해 `/summary/[summaryId]/notes/[noteId]`로 이동한다.
- `Banner`는 이미지와 목적지를 그대로 전달하고 별도 CTA를 만들지 않는다.
- 항목이 0개인 정상 응답에서만 `EmptyState message="학습 노트 리스트가 아직 생성되지 않았습니다."`를 표시한다.
- 로딩·오류·비밀번호 인증 전에는 EmptyState를 표시하지 않는다.

### 기존 컴포넌트 호출 계약

| 컴포넌트 | 이 기능에서의 사용 |
|---|---|
| `AuthGuard` | 내 목록 페이지 전체 보호 |
| `NoteItem` | 상태 이미지, 닉네임, 주제, 작성일과 상세 링크 표시 |
| `Banner` | 상단 광고 이미지와 유효한 목적지의 전체 클릭 영역 |
| `EmptyState` | 정상 빈 목록의 고정 안내 문구 |
| `CommonModal` | 일반 오류와 존재하지 않는 요약본 안내 |
| `NotePwModal` | 잠긴 요약본의 비밀번호 입력·제출 UI |
| 사이트 `Header` | `(site)/layout.js`에서 기본 펼친 상태로 재사용 |

기존 공통 컴포넌트의 props와 책임은 변경하지 않는다.

## 라우트 계약

| 라우트 | 접근 | 성공 화면 | 실패·후속 이동 |
|---|---|---|---|
| `/mypage/summaries` | 로그인 필요 | 현재 사용자의 최신순 학습노트 전체 목록 | `AuthGuard`는 `/login`, 조회 오류는 모달 종료 후 `/mypage` |
| `/summary/[summaryId]/notes` | 공개 요약본은 누구나, 잠긴 요약본은 세션 인증 후 | 해당 요약본의 최신순 학습노트 전체 목록 | 잠금 인증, 조회 오류, 없는 요약본은 위 오류 계약 적용 |
| `/summary/[summaryId]/notes/[noteId]` | 기존 학습노트 상세 계약 | 선택 행의 기존 상세 페이지 | 이 기능에서는 상세 페이지 동작을 변경하지 않음 |

프로젝트에 이미 존재하는 `/mypage/mysummaries`는 이 계약의 정식 URL이 아니며, 이 기능에서는 삭제·이름 변경하지 않는다. 구현 전 기존 경로의 유지·호환 여부와 변경 영향 범위를 확인한다.

## 제외 범위

- 북마크 조회·추가·삭제
- 학습노트 생성·수정·삭제
- 요약본 생성·수정·삭제
- 퀴즈 풀이·진행률 계산·저장
- 비밀번호 원문 저장, 암호화, 세션 쿠키 포맷 결정
- 새 Supabase 테이블·마이그레이션·RLS 정책
- 모바일·태블릿 전용 레이아웃
- 검색, 정렬 선택, 별도 페이지네이션 버튼, EmptyState CTA
