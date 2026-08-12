# 빠른 시작 및 검증 안내: 요약 상세 mock read-only 연결

## 목적

기존 `src/mocks`가 요약 상세, 학습노트 목록·상세·수정 초기값과 북마크 표시 상태에 정확히 연결됐는지 검증한다. 세부 필드와 함수 기준은 [데이터 모델](./data-model.md)과 [mock 어댑터 계약](./contracts/summary-detail-contract.md)을 따른다. 이 검증은 실제 로그인, 쓰기, 잠금, 퀴즈 또는 Supabase 연결의 완료를 의미하지 않는다.

## 사전 조건

- Node.js와 npm이 설치되어 있다.
- 프로젝트의 기존 의존성이 설치되어 있다.
- 다음 원본 파일이 존재한다.

```text
src/mocks/summaries.json
src/mocks/learning-notes.json
src/mocks/users.json
src/mocks/bookmarks.json
```

## 실행

```bash
npm run dev
```

브라우저에서 개발 서버가 출력한 주소를 열고 실제 소문자 경로로 아래 시나리오를 수행한다.

## 시나리오 1: 요약본 단건과 최신순 학습노트

1. `/summary/summary-001`에 접근한다.
2. 요약본의 주제와 AI 요약이 `summaries.json`의 `summary-001`과 일치하는지 확인한다.
3. 목록에 다른 요약본의 학습노트가 섞이지 않는지 확인한다.
4. 항목 순서가 `note-003`, `note-002`, `note-001`인지 확인한다.
5. 각 항목의 작성자명이 `users.json`과 결합되고 퀴즈 상태가 Boolean 원본에 맞는지 확인한다.
6. 작성일이 `YYYY.MM.DD` 형식이고 원본 날짜와 일치하는지 확인한다.

**예상 결과**: 현재 요약본의 학습노트만 최신 작성순으로 표시되고 기존 `NoteItem` 링크가 올바른 상세 경로를 가리킨다.

## 시나리오 2: 빈 학습노트 목록

1. `/summary/summary-011`에 접근한다.
2. 학습노트 항목 대신 빈 상태를 확인한다.

**예상 결과**: `EmptyState`가 `현재 리스트가 없습니다.`를 표시한다.

## 시나리오 3: 존재하지 않는 요약본

1. `/summary/summary-does-not-exist`에 직접 접근한다.
2. 같은 식별자의 `/notes/new` 하위 경로에도 접근한다.

**예상 결과**: 두 경로 모두 placeholder 요약을 표시하지 않고 404 처리된다.

## 시나리오 4: 학습노트 상세와 상위 관계 검증

1. `/summary/summary-001/notes/note-001`에 접근한다.
2. 제목이 `Promise 상태 복습`인지 확인한다.
3. 원본 `content`가 학습 내용 섹션에 표시되는지 확인한다.
4. mock에 없는 회고와 참고자료가 임의 내용 없이 빈 값으로 표시되는지 확인한다.
5. `/summary/summary-001/notes/note-004`에 접근한다. `note-004`는 존재하지만 다른 요약본에 속한다.

**예상 결과**: 올바른 관계는 상세를 표시하고 관계 불일치 경로는 404 처리된다.

## 시나리오 5: 수정 화면 기존 값

1. `/summary/summary-001/notes/note-001/edit`에 접근한다.
2. 제목과 학습 내용에 `note-001`의 기존 값이 표시되는지 확인한다.
3. 회고와 참고자료가 빈 값인지 확인한다.
4. `/summary/summary-001/notes/note-004/edit`에 접근한다.

**예상 결과**: 올바른 항목의 기존 값만 표시되고 관계 불일치는 404다. 수정 완료 버튼은 비활성 상태이며 저장 성공이나 이동을 모사하지 않는다.

## 시나리오 6: 고정 사용자의 북마크 표시

1. `user-001`이 북마크한 `/summary/summary-003`을 연다.
2. 북마크 선택 상태가 표시되는지 확인한다.
3. 북마크하지 않은 `/summary/summary-001`을 연다.
4. 북마크 미선택 상태가 표시되는지 확인한다.
5. 아이콘 조작으로 상태가 바뀌거나 저장 완료처럼 보이지 않는지 확인한다.

**예상 결과**: `bookmarks.json`의 관계에 따른 읽기 상태만 표시되며 JSON이나 화면 state를 토글하지 않는다.

## 시나리오 7: 제외 기능 경계

다음 기능이 성공한 동작처럼 제공되지 않는지 확인한다.

- 학습노트 생성·수정·삭제
- 요약본 삭제
- 북마크 변경
- 잠금 비밀번호 인증
- 실제 로그인과 권한 판정
- 퀴즈 조회·저장
- Supabase 또는 API 요청

**예상 결과**: 해당 버튼은 기존 비활성 상태를 유지하거나 현재 증분에서 동작을 제공하지 않는다.

## 원본 mock 무변경 확인

구현 전후 차이를 확인한다.

```bash
git diff -- src/mocks/summaries.json src/mocks/learning-notes.json src/mocks/users.json src/mocks/bookmarks.json
```

**예상 결과**: 출력이 없다. 새 어댑터 파일은 허용되지만 기존 JSON에는 변경이 없어야 한다.

## 정적 검증

```bash
npm run lint
npm run build
git diff --check
```

**통과 기준**:

- 이번 증분 코드에서 새 lint·compile 오류가 발생하지 않는다.
- 잘못된 식별자는 `notFound()`로 처리된다.
- 원본 mock 배열과 객체를 변경하지 않는다.
- 새 패키지, API, Supabase, 저장소 또는 인증 구조가 추가되지 않는다.
- 기존 `NoteItem`, `EmptyState` 공개 props와 SCSS Module 구조를 유지한다.
- 현재 저장소의 선행 오류로 전체 build가 중단되면 해당 오류와 이번 변경의 관련 여부를 분리해 기록한다.
