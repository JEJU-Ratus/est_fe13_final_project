# 조사 결과: 요약 및 학습노트 상세 mock read-only 연결

## 결정 1: 기존 JSON을 유일한 현재 데이터 입력으로 사용

**결정**: `src/mocks/summaries.json`, `learning-notes.json`, `users.json`, `bookmarks.json`만 읽고 새 mock 데이터나 원격 데이터 계층을 만들지 않는다.

**근거**: 사용자가 네 파일을 임시 read-only 데이터 소스로 승인했고 원본 변경, API와 Supabase를 명시적으로 제외했다. 현재 데이터에는 요약본 12개, 학습노트 19개, 사용자 6명, 북마크 관계 13개가 있어 목록 있음·빈 목록·관계 불일치·북마크 있음/없음 시나리오를 모두 검증할 수 있다.

**검토한 대안**: 페이지 안에 새 샘플 객체를 작성하면 기존 mock과 다른 사실 원천이 생긴다. Route Handler나 인메모리 저장소는 쓰기와 API 구조를 임의로 추가하므로 제외한다.

## 결정 2: 공통 순수 어댑터에서 조회와 필드 변환 수행

**결정**: 기존 `src/mocks` 폴더에 `summary-detail.js`를 두고 단건 조회, 목록 조회, 사용자 결합, 북마크 판정과 화면 필드 변환을 순수 함수로 제공한다.

**근거**: 공통 레이아웃, 목록, 상세와 수정 페이지가 동일한 요약본·학습노트 관계를 해석해야 한다. 한 파일에 규칙을 모으면 원본 JSON을 보존하면서 페이지가 화면 렌더링에만 집중할 수 있고, 향후 영속 데이터 서비스가 같은 출력 계약을 제공하기 쉽다.

**검토한 대안**: 네 경로가 JSON을 직접 import하고 각각 조인하면 사용자 fallback, 정렬과 `summaryId`/`noteId` 관계 검증이 중복된다. 새 `services` 폴더는 현재 프로젝트 구조와 승인 범위를 넓히므로 제외한다.

## 결정 3: mock 필드를 기존 화면 계약으로 명시적으로 변환

**결정**:

| mock 입력 | 화면 계약 |
|---|---|
| `summary.aiSummary` | 공통 레이아웃의 AI 요약 제목과 섹션 |
| `note.content` | `learnedSummary` |
| 존재하지 않는 회고·참고자료 | `reflection=""`, `references=""` |
| `note.isQuizCompleted=true` | `quizStatus="completed"` |
| `note.isQuizCompleted=false` | `quizStatus="notStarted"` |
| `note.authorId` + 사용자 조회 | `authorNickname` |
| 사용자 조회 실패 | `authorNickname="알 수 없는 사용자"` |
| `note.createdAt` | 원본 날짜 부분을 사용하는 `YYYY.MM.DD` 표시 문자열 |
| `user-001` + `summaryId` 북마크 관계 | `isBookmarked` |

**근거**: 현재 JSON과 기존 UI 계약의 이름과 세분화 수준이 다르다. 변환을 문서화해야 수정 화면의 빈 선택 필드와 퀴즈 상태가 임의 값으로 채워지지 않는다. 작성일은 목록 공통 명세의 `YYYY.MM.DD` 형식을 따르고 ISO 문자열의 날짜 부분을 사용해 실행 환경의 시간대 변환을 피한다.

**검토한 대안**: JSON 파일의 필드명을 직접 바꾸면 이미 사용하는 전체 요약 목록 등 다른 기능에 영향을 주고 원본 변경 금지 조건을 위반한다.

## 결정 4: 원본 배열을 복사한 뒤 필터·정렬

**결정**: 학습노트 목록은 `filter()`로 새 배열을 만든 뒤 `createdAt`의 시간값을 기준으로 내림차순 정렬한다.

**근거**: JavaScript `sort()`는 대상 배열을 변경한다. JSON import 배열에 직접 사용하지 않고 파생 배열만 정렬해야 한 실행 안에서도 원본 순서가 유지된다.

**검토한 대안**: 원본에 직접 `sort()`를 적용하면 파일을 쓰지는 않더라도 공유 module 객체가 변해 다른 화면의 결과가 호출 순서에 따라 달라질 수 있다.

## 결정 5: 동적 식별자는 라우트 경계에서 검증

**결정**: 공통 레이아웃이 `summaryId` 존재를 검증하고, 학습노트 상세·수정 페이지가 `summaryId`와 `noteId`의 동시 일치를 검증한다. 결과가 없으면 `notFound()`를 호출한다.

**근거**: Next.js 16에서 동적 `params`는 Promise이며 레이아웃과 페이지에서 `await`하거나 Client Component에서 React `use`로 해석한다. `notFound()`는 현재 라우트 세그먼트 렌더링을 종료하고 404 처리를 제공한다. 공통 레이아웃의 요약 검증은 모든 하위 경로에 같은 기준을 적용한다. [Next.js 동적 경로](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes), [Next.js `notFound`](https://nextjs.org/docs/app/api-reference/functions/not-found)

**검토한 대안**: 빈 문자열 fallback으로 정상 페이지를 계속 렌더링하면 잘못된 식별자를 숨긴다. 클라이언트에서 다른 페이지로 이동시키면 404 요구와 직접 URL 검증을 충족하지 못한다.

## 결정 6: 북마크는 읽기 상태만 표시

**결정**: `user-001`의 북마크 관계로 초기 선택 상태를 계산하되 로컬 토글과 저장을 제공하지 않는다.

**근거**: `bookmarks.json`은 읽기 전용이며 실제 사용자 인증과 변경 서비스가 없다. 로컬 state만 바꾸면 사용자가 저장됐다고 오인하고 새로고침 뒤 원래 상태로 돌아온다.

**검토한 대안**: React state로 임시 토글하면 원본 JSON은 보존되지만 FR-051의 “변경을 수행하지 않음”과 성공 오인 방지 요구를 충족하지 못한다. JSON 파일 쓰기는 명시적으로 금지됐다.

## 결정 7: 쓰기·잠금·퀴즈는 현재 조회 성공과 분리

**결정**: 생성·수정·삭제 버튼은 비활성 상태를 유지하고 수정 화면은 기존 값만 표시한다. `isPrivate`는 잠금 인증 완료의 근거로 사용하지 않으며 퀴즈 데이터나 퀴즈 조회 성공을 모사하지 않는다.

**근거**: 실제 인증, 비밀번호와 퀴즈 데이터가 없으므로 이 동작을 구현하면 보안과 영속성을 검증할 수 없다. 현재 증분의 성공 기준은 경로별 조회와 매핑이다.

**검토한 대안**: `localStorage`, 하드코딩 비밀번호, 임시 퀴즈를 추가하면 사용자가 제외한 범위와 `AGENTS.md`의 임의 인증·통신 금지를 위반한다.

## 결정 8: Server Component 중심으로 단순화

**결정**: mock 조회와 404를 소유하는 레이아웃·페이지는 가능한 Server Component로 유지하고, 현재 증분에서 필요 없는 북마크 토글과 퀴즈 modal state는 데이터 조회 경계에서 제거한다.

**근거**: 상태와 이벤트가 없는 조회 화면은 Client Component일 필요가 없다. Next.js는 상호작용이 필요한 최소 부분만 Client Component로 두는 구성을 지원한다. [Next.js `use client`](https://nextjs.org/docs/app/api-reference/directives/use-client)

**검토한 대안**: 레이아웃 전체를 Client Component로 유지하면 read-only 조회에도 pathname 분석과 state가 남고, 404와 데이터 책임이 UI 상호작용에 결합된다.

## 결정 9: 기존 검증 도구만 사용

**결정**: 새 테스트 패키지 없이 lint, production build, 개발 서버의 경로별 결과와 Git diff로 검증한다.

**근거**: 프로젝트에 자동 테스트 스크립트가 없고 새 패키지는 범위 밖이다. 현재 요구는 준비된 fixture와 화면 결과를 직접 비교할 수 있다.

**검토한 대안**: 테스트 프레임워크 추가는 이 증분보다 큰 의존성·설정 변경이다.
