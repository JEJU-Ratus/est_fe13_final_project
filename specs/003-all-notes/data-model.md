# 데이터 모델: 학습노트 전체 목록

이 기능은 새 영속 엔티티를 만들지 않는다. 아래 모델은 기존 학습노트·요약본·사용자·배너 데이터를 목록 화면에 표시하기 위한 조회 모델과 Client Component 상태를 정의한다. Supabase 테이블·RLS·비밀번호 인증 저장 방식은 `specs/002-summary-detail`과 기존 인증 서비스의 책임이다.

## 관계

```text
사용자 ──작성──▶ 학습노트 ──소속──▶ 요약본
   │                               │
   └── /mypage/summaries            └── /summary/[summaryId]/notes

요약본 ──제공──▶ 광고 배너
```

- `학습노트.authorId`는 `/mypage/summaries`에서 현재 인증 사용자와 일치해야 한다.
- `학습노트.summaryId`는 `/summary/[summaryId]/notes`의 경로 식별자와 일치해야 한다.
- 행의 상세 이동은 `summaryId`와 `noteId`를 함께 사용한다.
- 공개 요약본은 로그인 여부와 관계없이 목록 조회가 가능하다. 잠긴 요약본은 접근 상태가 `authorized`가 된 뒤에만 목록을 조회한다.

## 조회 모델

### `StudyNoteListItem`

| 필드 | 형태 | 필수 | 규칙 및 표시 방법 |
|---|---|---:|---|
| `noteId` | 문자열 식별자 | 예 | 학습노트의 고유 식별자. `summaryId`와 조합한 키가 목록 중복 판정에 사용된다. |
| `summaryId` | 문자열 식별자 | 예 | 소속 요약본 식별자. 상세 경로 생성에 사용한다. |
| `authorNickname` | 문자열 | 예 | 작성자 닉네임. 누락된 표시 값은 기존 학습노트 조회 계약의 fallback을 사용한다. |
| `topic` | 문자열 | 예 | 소속 요약본의 주제. 긴 값은 열 안에서 줄바꿈·말줄임 규칙으로 표시한다. |
| `createdAt` | ISO 날짜-시간 문자열 | 예 | 정렬과 커서 계산의 원본 값. |
| `createdAtDisplay` | `YYYY.MM.DD` 문자열 | 예 | 행의 작성일 영역에 표시한다. 퍼센트 값은 포함하지 않는다. |
| `quizStatus` | `completed` \| `notStarted` | 예 | 퀴즈 완료 여부를 `NoteItem`의 컬러·회색 이미지로 매핑한다. |

목록 화면은 제목, 본문, 퀴즈 진행률을 별도 필드로 표시하지 않는다. `NoteItem`의 기존 props에 맞춰 `createdAtDisplay`를 `createdAt` 표시 값으로 전달한다.

### `StudyNoteCursor`

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `createdAt` | ISO 날짜-시간 문자열 | 예 | 마지막으로 표시한 항목의 작성 시각 |
| `noteId` | 문자열 식별자 | 예 | 동일 작성 시각의 순서를 결정하는 고유 보조 키 |

- 첫 조회에서는 `null`이다.
- 다음 조회는 `createdAt DESC, noteId DESC` 순서에서 커서 뒤의 항목만 반환한다.
- 커서의 두 값을 함께 사용하지 못하는 입력은 무효 요청으로 정규화한다.

### `StudyNoteListPage`

| 필드 | 형태 | 필수 | 규칙 |
|---|---|---:|---|
| `totalCount` | 음이 아닌 정수 | 예 | 현재 목록 범위의 전체 학습노트 수 |
| `items` | `StudyNoteListItem[]` | 예 | 한 번에 최대 12개. 한 응답 안에서 복합 키가 중복되지 않는다. |
| `nextCursor` | `StudyNoteCursor \| null` | 예 | 더 가져올 데이터가 있으면 마지막 항목의 커서, 없으면 `null` |
| `hasMore` | Boolean | 예 | 다음 묶음 존재 여부. `nextCursor !== null`과 일치해야 한다. |

응답의 `items.length`가 12보다 작거나 더 가져올 항목이 없으면 `hasMore=false`, `nextCursor=null`로 종료한다. `totalCount`는 목록 상단의 `총 {count}개의 학습노트` 문구에 사용한다.

## 접근 상태 모델

### `SummaryNoteAccessState`

| 값 | 의미 | 목록 데이터 조회 |
|---|---|---|
| `checking` | 경로 요약본과 현재 세션의 접근 여부를 확인 중 | 금지 |
| `public` | 요약본이 공개되어 누구나 조회 가능 | 허용 |
| `authorized` | 잠긴 요약본의 현재 브라우저 세션 인증이 완료됨 | 허용 |
| `passwordRequired` | 잠긴 요약본이며 현재 세션이 인증되지 않음 | 금지; `NotePwModal` 표시 |
| `notFound` | `summaryId`에 해당하는 요약본이 없음 | 금지; 404 오류 모달 후 `/` 이동 |
| `error` | 접근 상태 또는 일반 목록 조회에 실패함 | 금지; 공통 오류 모달 표시 |

비밀번호 입력값, 검증 방식, 인증 결과 저장 위치는 이 모델에 포함하지 않는다. 해당 상태는 기존 비밀번호 인증 서비스와 `NotePwModal` 호출 계약이 소유한다.

## 배너 모델

### `BannerData`

| 필드 | 형태 | 규칙 |
|---|---|---|
| `imageSrc` | 문자열 | 값이 없으면 `Banner`가 빈 영역을 만들지 않는다. |
| `destinationUrl` | 문자열 \| `null` | 이미지와 함께 유효할 때만 이동 가능하다. 내부 경로는 `Link`, HTTP(S)는 외부 링크로 처리한다. |
| `alt` | 문자열 | 광고 내용을 설명하는 대체 텍스트 |

이미지와 목적지 URL 중 하나가 유효하지 않으면 배너는 이미지 표시만 제공하며 별도 CTA를 표시하지 않는다.

## 목록 Client 상태

### `StudyNoteListViewState`

| 상태 | 진입 조건 | 표시 |
|---|---|---|
| `initialLoading` | 첫 접근 또는 인증 후 첫 조회 진행 중 | 목록·빈 상태를 표시하지 않음 |
| `readyWithItems` | 조회 완료 및 항목 1개 이상 | 행 목록과 필요 시 sentinel 표시 |
| `readyEmpty` | 정상 조회 완료 및 항목 0개 | `EmptyState`만 표시 |
| `loadingMore` | `hasMore=true` 상태에서 다음 요청 진행 중 | 기존 행 유지, sentinel 중복 요청 차단 |
| `readyEnd` | 마지막 묶음 수신 또는 `hasMore=false` | 기존 행 유지, 추가 감시 종료 |
| `error` | 목록·접근 조회 실패 | `CommonModal` 표시, EmptyState로 대체하지 않음 |
| `passwordRequired` | 잠긴 요약본 인증 전 | 목록 데이터 없이 `NotePwModal` 표시 |

## 상태 전이

```text
접근 확인
  ├─ 내 목록 + 비로그인 → AuthGuard / requireLogin → /login
  ├─ 공개 요약본 → initialLoading
  ├─ 잠금 인증 완료 → initialLoading
  ├─ 잠금 인증 전 → passwordRequired ── 성공 → initialLoading
  └─ 없는 summaryId → notFound → 오류 모달 ── 3초 → /

initialLoading
  ├─ items > 0 → readyWithItems
  ├─ items = 0 → readyEmpty
  └─ 실패 → error → 모달 종료 후 호출 경로의 fallback

readyWithItems
  ├─ sentinel 진입 + hasMore + not loadingMore → loadingMore
  └─ hasMore = false → readyEnd

loadingMore
  ├─ 새 항목 수신 → 기존 키와 병합 → readyWithItems 또는 readyEnd
  ├─ 이미 요청한 커서 → 기존 상태 유지
  └─ 실패 → 기존 목록 유지 + error 모달
```

## 무결성 규칙

1. 목록 범위는 `mine` 또는 `summary` 중 하나이며, `mine`은 서비스가 현재 인증 사용자로 제한한다.
2. `summary` 범위는 경로의 `summaryId`로 제한한다. 클라이언트가 전달한 다른 사용자 식별자를 조회 조건으로 신뢰하지 않는다.
3. 항목의 유일 키는 `${summaryId}:${noteId}`이다. 병합 전에 이미 표시된 키를 제거한다.
4. 한 Client Component에서 동일한 커서에 대한 요청은 동시에 하나만 실행한다.
5. 표시 순서는 모든 페이지가 `createdAt DESC, noteId DESC`를 유지한다.
6. 필수 날짜가 유효한 날짜-시간으로 정규화되지 않으면 임의의 날짜나 퍼센트로 대체하지 않고 `REQUEST_FAILED` 조회 오류로 처리한다.
