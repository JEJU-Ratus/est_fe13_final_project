# 작업 목록: 학습노트 전체 목록

**입력**: `/specs/003-all-notes/`의 설계 문서

**구현 전략**: UI를 먼저 완성한다. T001–T025에서는 Supabase·DB·비밀번호 검증 서비스에 연결하지 않고, `src/mocks/all-notes.js`의 화면 검증용 어댑터로 목록·접근·오류 상태를 재현한다. UI MVP 검증이 끝난 뒤 T026–T034에서 `002-summary-detail`의 영속 데이터·인증·RLS 경계에 연결한다.

**테스트**: TDD 또는 자동 테스트가 명시적으로 요청되지 않았으므로 테스트 파일 생성 작업은 포함하지 않는다. 각 사용자 스토리의 독립 검증은 `quickstart.md`의 수동 브라우저 시나리오로 수행한다.

## 1단계: 준비

**목적**: 구현 범위와 기존 재사용 경계를 확정한다.

- [X] T001 `AGENTS.md`, `.specify/memory/constitution.md`, `specs/003-all-notes/spec.md`, `specs/003-all-notes/plan.md`와 `specs/003-all-notes/contracts/all-notes-contract.md`를 다시 확인한다.
- [X] T002 현재 내 목록 경로 `src/app/(site)/mypage/mysummaries/page.js`와 정식 추가 대상 `src/app/(site)/mypage/summaries/page.js`, 요약본 목록 대상 `src/app/(site)/summary/[summaryId]/notes/page.js`의 충돌·영향 범위를 기록한다.
- [X] T003 `package.json`, `specs/003-all-notes/quickstart.md`와 기존 `src/components/NoteItem.jsx`, `src/components/Banner.jsx`, `src/components/EmptyState.jsx`, `src/components/CommonModal.jsx`, `src/components/NotePwModal.jsx`, `src/components/AuthGuard.jsx`의 실행·재사용 조건을 확인한다.

## 2단계: 공통 선행 작업

**목적**: 실제 DB 없이 두 사용자 스토리를 검증할 수 있는 UI 전용 기반을 만든다.

- [X] T004 [P] 화면 검증용 25개 이상 학습노트, 동일 작성 시각 항목, 공개·잠금·빈 목록·조회 실패 상태와 배너 변형을 `src/mocks/all-notes.js`에 `StudyNoteListPage`·접근 상태 계약으로 작성한다.
- [X] T005 `src/components/AllNotes.jsx`에 `"use client"` 기반의 기능 전용 목록 컴포넌트 골격을 만들고 `scope`, `summaryId`, mock `loadPage`, `initialPage`, `accessState` 입력 경계를 연결한다. 이 단계에서는 Supabase 클라이언트나 DB 요청을 import하지 않는다.
- [X] T006 [P] 기존 `src/styles/abstracts` 토큰을 사용하는 데스크톱 목록·표·배너·상태 영역의 기본 SCSS Module 골격을 `src/components/AllNotes.module.scss`에 작성한다.

**확인 지점**: mock 어댑터와 `AllNotes` 컴포넌트가 실제 인증·DB 없이 렌더링될 준비가 되고, 기존 공통 컴포넌트의 props를 변경하지 않는다.

## 3단계: 사용자 스토리 1 - 내 학습노트 전체 목록 확인 (우선순위: P1) 🎯 MVP

**목표**: 로그인 UI 상태에서 `/mypage/summaries`가 내 학습노트의 총 개수, 최신순 첫 묶음, 추가 묶음과 상세 이동을 제공한다.

**독립 검증**: mock 어댑터의 현재 사용자 목록으로 로그인 상태에서 `/mypage/summaries`를 열어 총 개수·첫 12개·추가 12개·중복 0건·행 상세 이동을 확인하고, 비로그인 상태에서 `AuthGuard` 모달과 `/login` 이동을 확인한다.

### 사용자 스토리 1 구현

- [X] T007 [US1] `src/app/(site)/mypage/summaries/page.js`를 생성해 기존 `AuthGuard`로 페이지를 보호하고 `AllNotes`에 `scope="mine"`과 mock 목록 로더를 전달한다. 기존 `src/app/(site)/mypage/mysummaries/page.js`는 삭제하거나 이름을 변경하지 않는다.
- [X] T008 [US1] `src/components/AllNotes.jsx`에서 내 목록의 초기 로딩·전체 개수·최대 12개 행·정상 빈 결과 상태를 mock `StudyNoteListPage`와 연결한다. 초기 로딩에는 기존 `Loading`을 재사용한다.
- [X] T009 [US1] `src/components/AllNotes.jsx`에 `createdAt DESC, noteId DESC` 정렬 결과를 이어 붙이는 `IntersectionObserver`, 12개 단위 추가 조회, 현재 cursor 잠금, 요청 중복 방지와 `${summaryId}:${noteId}` 중복 제거를 구현한다.
- [X] T010 [US1] `src/components/AllNotes.jsx`에서 기존 `NoteItem`에 `summaryId`, `noteId`, 작성자, 주제, `YYYY.MM.DD` 날짜, `quizStatus`를 전달하고 `/summary/[summaryId]/notes/[noteId]` 상세 링크를 유지한다.
- [X] T011 [US1] `src/components/AllNotes.module.scss`에 1440px 데스크톱 기준의 목록 헤더·열 너비·행 간격·포커스 상태·긴 텍스트 말줄임 스타일을 완성한다.

**확인 지점**: 사용자 스토리 1만으로 mock 데이터 기반의 내 목록 MVP를 실행하고 검증할 수 있다. 실제 Supabase 조회는 아직 연결하지 않는다.

## 4단계: 사용자 스토리 2 - 요약본별 학습노트 전체 목록 확인 (우선순위: P1)

**목표**: 공개 요약본은 누구나, 잠긴 요약본은 mock 인증 상태가 허용된 세션에서만 요약본별 학습노트를 확인한다.

**독립 검증**: `/summary/{공개-summaryId}/notes`를 비로그인으로 열어 목록을 확인하고, 잠긴 mock 요약본에서는 인증 전 목록 비노출·잘못된 비밀번호·성공 후 목록·같은 세션 재접근을 확인한다.

### 사용자 스토리 2 구현

- [X] T012 [P] [US2] `src/app/(site)/summary/[summaryId]/notes/page.js`를 생성해 동적 `summaryId`를 `AllNotes`의 `scope="summary"`에 전달하고 기존 사이트·요약 상세 레이아웃을 재사용한다.
- [X] T013 [US2] `src/components/AllNotes.jsx`에서 mock 접근 상태가 `public`이면 비로그인도 목록을 볼 수 있고 `authorized`이면 목록을 바로 표시하도록 요약본 범위 조회를 연결한다.
- [X] T014 [US2] `src/components/AllNotes.jsx`와 `src/mocks/all-notes.js`에 UI 검증 전용 `passwordRequired`·인증 성공·인증 실패 상태를 연결해 기존 `NotePwModal`을 표시한다. 고정 비밀번호나 인증 결과를 production 저장소에 기록하지 않는다.
- [X] T015 [US2] `src/components/AllNotes.jsx`에서 mock `notFound`와 일반 조회 실패를 기존 `CommonModal`에 연결하고, 요약본 일반 오류 종료 후 `/summary/[summaryId]`, 없는 `summaryId`의 3초 후 `/` 이동을 구현한다.
- [X] T016 [US2] `src/components/AllNotes.module.scss`에서 요약본 전체 목록의 배너·총 개수·표·스크롤 sentinel 배치를 내 목록과 동일한 데스크톱 디자인으로 정리한다.

**확인 지점**: 사용자 스토리 1의 mock 기반 공통 목록 로직을 재사용하면서 공개·잠금·없는 요약본 흐름을 별도로 검증할 수 있다.

## 5단계: 사용자 스토리 3 - 목록 상태와 배너 이용 (우선순위: P2)

**목표**: 퀴즈 상태·작성자·주제·작성일을 구분하고 유효한 광고 배너, 빈 상태와 오류 상태를 명세대로 표시한다.

**독립 검증**: mock 데이터에서 퀴즈 전·후 행, 유효·무효 배너, 0개 목록, 조회 실패를 각각 선택해 이미지·문구·이동·열 경계·오류 후속 이동을 확인한다.

### 사용자 스토리 3 구현

- [X] T017 [US3] `src/components/AllNotes.jsx`에서 mock `BannerData`를 기존 `Banner`에 전달하고 이미지·목적지 쌍이 유효할 때만 전체 배너를 이동 영역으로 표시하며 별도 CTA를 추가하지 않는다.
- [X] T018 [US3] `src/components/AllNotes.jsx`에서 정상 `items.length === 0`일 때만 기존 `EmptyState`에 `학습 노트 리스트가 아직 생성되지 않았습니다.`를 전달하고, 로딩·오류·목록 행과 동시에 표시하지 않는다.
- [X] T019 [US3] `src/components/AllNotes.jsx`에서 `completed`·`notStarted`를 기존 `NoteItem`의 컬러·회색 상태 이미지로 매핑하고 작성일을 `YYYY.MM.DD`로 표시하며 퍼센트 필드를 렌더링하지 않는다.
- [X] T020 [US3] `src/components/AllNotes.module.scss`에서 Header가 펼쳐진 1440px 데스크톱 프레임의 배치, 표 열 경계, 긴 닉네임·주제 말줄임, 링크·배너 focus-visible 상태를 완성하고 태블릿·모바일 전용 규칙은 추가하지 않는다.

**확인 지점**: 사용자 스토리 3의 상태·배너·빈 화면·오류 및 데스크톱 시각 규칙이 사용자 스토리 1·2의 목록 흐름을 깨뜨리지 않는다.

## 6단계: UI MVP 마무리 및 공통 검증

**목적**: DB 연동 전 UI 범위를 고정하고, 후속 데이터 연결이 교체 가능한 경계에 머무는지 확인한다.

- [X] T021 `specs/003-all-notes/quickstart.md`에 `src/mocks/all-notes.js`를 사용하는 UI-first 실행 순서와 공개·잠금·빈·오류·무한 스크롤 검증 데이터를 반영한다.
- [X] T022 `src/components/AllNotes.jsx`, `src/app/(site)/mypage/summaries/page.js`, `src/app/(site)/summary/[summaryId]/notes/page.js`의 입력·경로·mock 로더가 `specs/003-all-notes/contracts/all-notes-contract.md`와 일치하는지 검토한다. 마이페이지 파일은 담당자 범위로 제외되어 복구·수정하지 않는다.
- [ ] T023 `package.json`의 lint 스크립트를 실행해 UI MVP의 ESLint 오류를 수정한다.
- [ ] T024 `package.json`의 build 스크립트를 실행해 App Router 경로·SCSS Module·Client Component 경계의 production build를 확인한다.
- [X] T025 `specs/003-all-notes/quickstart.md`의 사용자 스토리 1·2·3 수동 시나리오와 `git diff --check`를 실행하고 변경 파일이 승인된 UI·mock 범위에만 있는지 확인한다. 마이페이지 시나리오는 담당자 연결 후 실행한다.

## 7단계: 실제 DB·Supabase 연동 (UI MVP 이후)

**목적**: T001–T025에서 검증한 UI 계약을 `002-summary-detail`이 정의한 영속 데이터·인증·RLS 경계에 연결한다. 이 기능에서 `summaries`·`learning_notes` 테이블을 중복 생성하거나 새 Route Handler·데이터 요청 라이브러리를 추가하지 않는다.

**선행 조건**: T025가 완료되고 UI MVP가 승인되어야 한다. DB 스키마·RLS에 공백이 발견되면 이 기능에서 조용히 보완하지 말고 `specs/002-summary-detail/tasks.md`와 별도 승인 범위를 먼저 갱신한다.

**독립 검증**: 실제 Supabase 환경에서 두 인증 사용자, 공개·잠금 요약본, 25개 이상 학습노트를 준비해 두 라우트의 총 개수·12개 cursor·작성자 범위·잠금 세션·RLS 비노출을 검증한다.

- [ ] T026 `specs/002-summary-detail/plan.md`, `specs/002-summary-detail/data-model.md`, `specs/002-summary-detail/contracts/summary-detail-contract.md`, `supabase/migrations/`를 대조해 `summaries`·`learning_notes`·작성자 닉네임 조회·인덱스·GRANT·RLS의 현재 적용 상태와 이 기능의 의존성을 기록한다. 기존 `002` 마이그레이션을 중복 작성하지 않는다.
- [ ] T027 `supabase/migrations/`와 `specs/002-summary-detail/tasks.md`의 승인된 DB 작업을 기준으로 대상 project의 migration 적용 전 상태, dry-run 결과, 복구 지점과 적용 결과를 확인한다. 스키마 공백을 새 SQL로 임의 보완하지 않고 필요한 경우 `002` 작업과 별도 승인을 먼저 갱신한다.
- [ ] T028 `src/lib/summary-detail.js`와 `specs/003-all-notes/contracts/all-notes-contract.md`에 기존 Supabase 조회 계약을 `StudyNoteListPage`로 정규화하는 실제 loader를 연결한다. `mine`·`summary` 범위, 명시적 select, `created_at DESC, id DESC` 정렬, 12개 범위, 전체 개수, 복합 cursor와 정규화된 오류를 보장하며 `select("*")`와 service role key를 사용하지 않는다.
- [ ] T029 `src/components/AllNotes.jsx`, `src/app/(site)/mypage/summaries/page.js`, `src/app/(site)/summary/[summaryId]/notes/page.js`에 승인된 실제 loader transport를 연결한다. Server/Client 경계를 넘는 비직렬화 함수를 직접 전달하지 않고 기존 `StudyNoteListPage`·접근 상태 입력 계약, 12개 추가 조회, cursor 잠금과 중복 제거를 유지한다.
- [ ] T030 `src/lib/summary-detail.js`, `src/components/AllNotes.jsx`, `src/components/NotePwModal.jsx`의 기존 공개 props 범위에서 공개·authorized·passwordRequired·notFound·조회 실패 상태를 실제 인증·잠금 서비스와 연결한다. 비밀번호 원문을 저장하거나 브라우저 저장소에 기록하지 않고, 동일 브라우저 세션 인증 결과만 소비한다.
- [ ] T031 `src/components/AllNotes.jsx`, `src/mocks/all-notes.js`에서 production 경로의 mock 목록·접근 상태 사용을 실제 loader로 교체하고, mock은 명시된 개발·UI 검증 경로에서만 사용할 수 있도록 분리한다. 실제 행과 mock 행을 한 목록에 섞지 않는다.
- [ ] T032 `specs/003-all-notes/quickstart.md`, `specs/002-summary-detail/quickstart.md`의 실제 데이터 준비·환경 변수를 승인된 팀 환경 기준으로 갱신하고, 두 사용자·공개 요약본·잠금 요약본·동일 작성 시각·25개 이상 학습노트 검증 시나리오를 연결한다. secret/service role key와 이 기능 전용 seed 파일은 추가하지 않는다.
- [ ] T033 `supabase/migrations/`, `specs/002-summary-detail/quickstart.md`, `specs/003-all-notes/quickstart.md`의 RLS 검증 행렬을 실행해 공개 조회, 현재 사용자 내 목록, 다른 사용자 행 비노출, 잠금 인증 전·후, 없는 요약본과 오류 결과를 확인한다. 현재 Supabase CLI 옵션은 `supabase --help`로 확인한 뒤 DB lint와 migration 상태를 기록한다.
- [ ] T034 `src/lib/summary-detail.js`, `src/components/AllNotes.jsx`, 두 목록 `page.js`, `package.json`을 대상으로 실제 데이터 연동 후 lint·build·`git diff --check`를 실행하고, UI 계약 유지·cursor 중복 0건·오류 후속 이동·공통 Supabase 클라이언트 무변경을 최종 확인한다.

## 의존성과 실행 순서

### 단계 의존성

- 준비 단계(T001–T003)는 즉시 수행한다.
- 공통 선행 작업(T004–T006)은 모든 사용자 스토리보다 먼저 완료한다.
- 사용자 스토리 1의 T007–T011은 MVP다.
- 사용자 스토리 2의 라우트 생성 T012는 사용자 스토리 1의 라우트 T007과 병렬로 시작할 수 있지만, 공유 `AllNotes` 변경 작업 T013–T016은 공통 목록 기반 T008–T010 완료 후 수행한다.
- 사용자 스토리 3은 두 목록의 공통 렌더링이 준비된 뒤 수행한다.
- UI MVP 검증(T021–T025)은 세 사용자 스토리의 UI 작업이 모두 완료된 뒤 수행한다.
- 실제 DB·Supabase 연동(T026–T034)은 UI MVP 검증 이후에만 시작한다. `002-summary-detail`의 스키마·RLS 선행 조건과 별도 승인 범위를 먼저 확인하며, UI MVP를 막지 않는다.

### 사용자 스토리 의존성

- **사용자 스토리 1(P1)**: T004–T006 이후 독립 실행 가능한 MVP다.
- **사용자 스토리 2(P1)**: T004–T006과 공통 `AllNotes` 기반에 의존한다. T012는 US1 라우트와 병렬 가능하지만 T013–T016은 T008–T010 이후다.
- **사용자 스토리 3(P2)**: T004–T006 이후 시작할 수 있으나 실제 화면 상태를 확인하려면 US1·US2의 공통 목록 렌더링이 완료되어야 한다.

### DB 연동 의존성

- T026은 T025 이후 시작하며 `002-summary-detail`의 DB 설계·적용 상태를 확인하는 관문이다.
- T027은 T026의 공백·충돌 확인 후에만 실행하고, 승인된 스키마가 준비된 뒤 T028을 시작한다.
- T028의 실제 loader가 완료된 뒤 T029에서 두 라우트와 `AllNotes`에 연결한다.
- T030은 실제 인증·잠금 접근 경계를 연결하고, T031은 production mock 제거를 완료한 뒤 실행한다.
- T032·T033은 실제 환경과 데이터가 연결된 뒤 수행하며, T034는 모든 DB 연동 작업 완료 후 최종 검증한다.

## 병렬 실행 예시

### 공통 기반 이후

```text
T007 [US1] 내 목록 라우트 생성
T012 [P] [US2] 요약본 목록 라우트 생성
```

두 작업은 서로 다른 `page.js` 파일을 생성하고 공통 기반 T004–T006만 필요하므로 병렬로 진행할 수 있다.

### 스타일·mock 준비

```text
T004 mock 어댑터 작성
T006 [P] AllNotes SCSS Module 골격
```

T004는 `src/mocks/all-notes.js`, T006은 `src/components/AllNotes.module.scss`만 다루므로 병렬로 수행할 수 있다. T005는 T004의 반환 형태를 사용하므로 T004 이후 시작한다.

### DB 연동 단계

DB 스키마·RLS와 실제 loader가 같은 데이터 경계를 공유하므로 T026–T034는 의도적으로 순차 실행한다. T027에서 스키마 공백이 발견되면 애플리케이션 연결을 진행하지 않고 `002-summary-detail`의 승인 범위를 먼저 갱신한다.

## 구현 전략

1. 준비와 공통 기반에서 mock 데이터 계약·공통 Client Component·데스크톱 스타일만 만든다.
2. 사용자 스토리 1을 먼저 완성해 UI MVP로 검증한다. 이 시점에는 DB 연동 없이도 목록·페이지 추가·상세 이동·비로그인 모달을 확인할 수 있어야 한다.
3. 사용자 스토리 2에서 같은 UI를 요약본 범위와 잠금 모달 상태로 확장한다.
4. 사용자 스토리 3에서 상태 이미지·배너·빈 상태·오류 및 데스크톱 품질을 마무리한다.
5. UI 리뷰와 lint/build가 통과한 뒤 T026–T027에서 `002-summary-detail`의 DB·RLS 선행 조건을 확인한다.
6. T028–T031에서 실제 loader·인증·잠금 경계를 연결하고 production mock을 제거한다.
7. T032–T034에서 실제 데이터·RLS 시나리오와 lint/build를 검증한다.

## 완료 기준

- 총 34개 작업(T001–T034)이 모두 체크리스트 형식으로 작성되어 있다.
- 각 사용자 스토리 작업에는 `[US1]`, `[US2]`, `[US3]` 라벨과 정확한 파일 경로가 있다.
- `[P]`는 서로 다른 파일을 다루며 미완료 작업에 의존하지 않는 작업에만 사용했다.
- T001–T025는 mock 기반 UI MVP이고, T026–T034는 그 이후 실행되는 DB·Supabase 연동 단계로 분리되어 있다.
- DB·RLS 스키마의 소유권은 `002-summary-detail`에 두며, 이 기능은 승인된 기존 스키마와 서비스 계약을 소비한다.
