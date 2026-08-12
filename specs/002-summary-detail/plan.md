# 구현 계획: 요약 및 학습노트 상세

**브랜치**: `feature/summary-detail` | **작성일**: 2026-08-12 | **명세**: [spec.md](./spec.md)

**입력**: 기존 `src/mocks`를 사용하는 요약 상세 read-only 증분 요구사항(FR-041–FR-052)

## 요약

기존 정적 요약 상세 UI를 `summaries.json`, `learning-notes.json`, `users.json`, `bookmarks.json`의 실제 식별자와 연결한다. 공통 mock 어댑터가 원본 데이터를 변경하지 않고 화면 계약으로 정규화하며, 공통 레이아웃·요약 상세·학습노트 상세·수정 화면은 동일한 조회 결과를 사용한다. 존재하지 않거나 상위 요약본과 관계가 다른 식별자는 `notFound()`로 처리한다. 고정 검증 사용자 `user-001`의 북마크는 읽기 상태만 표시하고 모든 쓰기·인증·잠금·퀴즈·Supabase/API 동작은 이번 증분에서 구현하지 않는다.

## 기술 배경

**언어/버전**: JavaScript, React 19.2.4

**주요 의존성**: Next.js 16.2.12 App Router, 기존 JSON module import, `next/navigation`의 `notFound`, 기존 `EmptyState`, `NoteItem`

**저장소**: `src/mocks/summaries.json`, `learning-notes.json`, `users.json`, `bookmarks.json`을 read-only 입력으로 사용

**테스트**: `npm run lint`, `npm run build`, `npm run dev` 기반 실제 경로 검증, 구현 전후 mock 파일 diff 비교

**대상 플랫폼**: 데스크톱 웹 브라우저와 기존 반응형 스타일 범위

**프로젝트 유형**: Next.js App Router 웹 애플리케이션

**성능 목표**: 준비된 mock 데이터 범위에서 요약·학습노트 상세를 3초 이내 표시하고, 잘못된 식별자는 정상 콘텐츠를 노출하지 않음

**제약 사항**: 새 패키지·API·Supabase·인증·영속 저장·퀴즈 데이터를 추가하지 않는다. JSON 파일을 수정하지 않는다. 생성·수정·삭제·북마크 토글을 성공한 작업처럼 표시하지 않는다. 기존 경로·파일명을 변경하지 않는다. SCSS Module은 JavaScript에서 상대 경로로 import하고 SCSS 공통 모듈은 `styles/...` 기준 경로를 유지한다.

**작업 규모**: 공통 mock 어댑터 1개 추가, 기존 동적 레이아웃과 페이지 4개 수정, 기존 공통 컴포넌트 공개 계약 유지

## 헌법 점검

*관문: 조사 전과 설계 후 모두 통과했다.*

- [x] `AGENTS.md`, `docs/specs/Summary.md`, 기능 명세와 현재 코드를 확인했다.
- [x] Next.js App Router, JavaScript, 기존 SCSS Module과 `@/*` JavaScript 별칭을 유지한다.
- [x] 기존 `src/mocks` 데이터만 읽고 새 데이터 요청 라이브러리·API·Supabase 구조를 만들지 않는다.
- [x] 새 폴더를 만들지 않고 기존 `src/mocks`에 read-only 어댑터 파일 하나만 둔다.
- [x] `EmptyState`, `NoteItem`의 공개 props와 기존 페이지 스타일을 재사용한다.
- [x] 완료된 정적 UI를 다시 만들지 않고 데이터 연결에 필요한 최소 파일만 수정한다.
- [x] 실제 인증·권한·잠금·쓰기·퀴즈 완료를 주장하지 않는다.
- [x] 모든 Spec Kit 산출물을 한국어로 작성한다.

**설계 후 재점검**: 공통 어댑터는 네 경로의 중복 데이터 매핑과 관계 검증을 한곳에 제한하기 위한 최소 파일이다. 원본 JSON과 공통 컴포넌트 계약을 변경하지 않으며, 향후 Supabase 연결 시 호출 영역의 화면 계약을 유지할 수 있다. 헌법 또는 `AGENTS.md` 위반 예외가 없다.

## 프로젝트 구조

### 이 기능의 문서

```text
specs/002-summary-detail/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── summary-detail-contract.md
└── tasks.md
```

### 이번 증분의 소스 코드

```text
src/
├── mocks/
│   ├── summaries.json                 # 기존, 수정 금지
│   ├── learning-notes.json            # 기존, 수정 금지
│   ├── users.json                     # 기존, 수정 금지
│   ├── bookmarks.json                 # 기존, 수정 금지
│   └── summary-detail.js              # 추가: 순수 조회·정규화 함수
└── app/
    └── (site)/
        └── summary/
            └── [summaryId]/
                ├── layout.js
                ├── page.js
                └── notes/
                    └── [noteId]/
                        ├── page.js
                        └── edit/
                            └── page.js
```

**구조 결정**: 실제 Git 추적 경로인 소문자 `src/app/(site)/summary`를 사용한다. 데이터 정규화는 `src/mocks/summary-detail.js` 한 파일에서 수행해 페이지별 JSON 조인과 필드 변환 중복을 막는다. 새 폴더, Route Handler, Server Action, 서비스 폴더 또는 테스트용 영속 저장소는 만들지 않는다.

## 구현 설계

### read-only mock 어댑터

- `src/mocks/summary-detail.js`는 네 JSON을 정적 import하고 조회 결과를 새 객체로 반환한다.
- 공개 함수는 요약본 단건 조회, 요약본별 학습노트 목록 조회, 요약본에 속한 학습노트 단건 조회, 사용자별 북마크 상태 조회로 제한한다.
- 학습노트 목록은 먼저 `summaryId`로 필터링한 뒤 `createdAt` 내림차순으로 정렬한다. 원본 배열에는 `sort()`를 직접 적용하지 않는다.
- 학습노트의 `authorId`를 사용자 데이터와 결합하고 사용자가 없으면 `알 수 없는 사용자`를 사용한다.
- `isQuizCompleted`는 `completed` 또는 `notStarted`로 변환한다.
- mock의 단일 `content`는 `learnedSummary`로 변환하고 `reflection`, `references`는 빈 문자열로 제공한다.
- 북마크 상태는 `userId`와 `summaryId`가 모두 일치하는 관계의 존재 여부로 계산한다.
- INSERT, UPDATE, DELETE, 토글 또는 파일 쓰기 함수는 제공하지 않는다.

### 동적 경로와 404 경계

- 각 레이아웃과 페이지는 Next.js 16의 Promise인 `params`를 `await`하거나 필요한 Client Component 경계에서 React `use`로 해석한다.
- 공통 `layout.js`가 `summaryId`로 요약본을 조회하고 결과가 없으면 `notFound()`를 호출하므로 네 하위 경로가 공통으로 잘못된 요약본을 차단한다.
- 학습노트 상세와 수정 페이지는 `summaryId`, `noteId`가 함께 일치하는 단건만 사용하고 결과가 없으면 `notFound()`를 호출한다.
- 별도 `not-found.js`는 전용 디자인 명세가 없으므로 만들지 않고 기존 404 처리를 사용한다.

### 공통 레이아웃과 북마크 표시

- 공통 레이아웃의 정적 제목과 AI 요약 placeholder를 조회된 `topic`, `aiSummary.title`, `aiSummary.sections`로 교체한다.
- `user-001`의 북마크 관계를 읽어 아이콘 선택 상태와 접근성 상태에 반영한다.
- 북마크는 read-only 표시이므로 로컬 토글 상태와 변경 핸들러를 제거하고 사용자가 성공한 저장으로 오인할 동작을 제공하지 않는다.
- 실제 로그인·작성자 판정과 저장 퀴즈 조회가 없으므로 퀴즈 조회 흐름을 이번 증분에서 연결하거나 완료 처리하지 않는다.
- 비공개 mock 항목의 `isPrivate` 값은 표시 데이터일 뿐 잠금 인증 완료의 근거로 사용하지 않는다.

### 요약 상세 학습노트 목록

- `page.js`는 현재 `summaryId`의 정규화된 학습노트 목록을 받아 `NoteItem`으로 렌더링한다.
- 항목이 없으면 기존 `EmptyState`에 `현재 리스트가 없습니다.`를 전달한다.
- `NoteItem`에는 `summaryId`, `noteId`, `authorNickname`, 요약본 `topic`, `YYYY.MM.DD` 표시용 작성일, `quizStatus`를 전달한다.
- 생성·삭제 버튼은 실제 로그인·소유권·쓰기 서비스가 없으므로 현재 비활성 상태를 유지한다.

### 학습노트 상세와 수정 초기값

- 학습노트 상세는 정규화된 `title`, `learnedSummary`, `reflection`, `references`를 현재 세 섹션에 표시한다.
- 수정 화면은 같은 조회 결과의 제목과 세 본문 필드를 `defaultValue`로 표시한다.
- 수정 입력은 조회 결과 확인 용도로만 제공하고 수정 완료 버튼은 비활성 상태를 유지한다. 저장 성공, 로딩 또는 이동을 모사하지 않는다.
- 작성 페이지는 이번 데이터 조회 범위에서 변경하지 않으며 공통 레이아웃의 요약본 404 경계만 공유한다.

## 구현 순서

1. 기존 mock 파일의 shape와 테스트 식별자를 기준으로 read-only 어댑터 계약을 구현한다.
2. 공통 레이아웃을 요약 단건 조회와 404에 연결하고 북마크를 읽기 상태로 고정한다.
3. 요약 상세에서 학습노트 필터·정렬·작성자 결합 결과와 빈 상태를 연결한다.
4. 학습노트 상세에서 관계 검증·404와 정규화 본문을 연결한다.
5. 수정 페이지에서 관계 검증·404와 기존 값을 연결하고 쓰기 비활성 경계를 확인한다.
6. 유효·빈·잘못된·관계 불일치·북마크 시나리오와 mock 원본 무변경을 검증한다.
7. `npm run lint`, `npm run build`, `git diff --check`를 실행하고 최종 범위를 검토한다.

## 복잡성 기록

| 결정 | 필요한 이유 | 더 단순한 대안을 사용하지 않은 이유 |
|---|---|---|
| `src/mocks/summary-detail.js` 파일 1개 추가 | 네 경로가 같은 관계 검증·사용자 조인·필드 변환을 사용하고 향후 데이터 소스 교체 경계를 분명히 한다. | 각 페이지의 직접 JSON 가공은 같은 규칙을 반복하고 요약본-학습노트 관계 검증이 서로 달라질 위험이 있다. |
