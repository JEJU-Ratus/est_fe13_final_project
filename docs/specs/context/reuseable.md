## component

Header.jsx
Button.jsx
LinkButton.jsx(Link로 표현해야하는 버튼)
PreparingModal.jsx(준비중입니다)
Banner.jsx(광고 배너)
SuggestLoginModal.jsx(로그인 권장 모달)
notePWModal.jsx(요약 노트 비밀번호 모달)
NoteItem.jsx(학습노트 한줄)
Modal.jsx(공용 모달)
AllSummary.jsx(전체요약노트,내요약,북마크)
SummaryItemCard.jsx (요약 노트 카드 아이템)

## page.js

app/page.js(main)

- quickLinkCard(내부에 생성)
  app/login/page.js(로그인) login.jsx
  app/signup/page.js(회원가입)
  app/signup/complete/page.js(가입완료)
  app/summary/[summaryId]/page.js(요약 노트 페이지)
  app/summary/[summaryId]/notes/new/page.js(학습 노트 작성 페이지)
- til 구성
  app/summary/[summaryId]/notes/[noteId]/page.js(학습노트 읽기 페이지)
  app/summary/[summaryId]/notes/[noteId]/edit(학습노트 수정 페이지)
  app/allnote/page.js(전체 학습노트 페이지)
  app/summary/page.js(전체 요약노트)
  app/mypage/summaries/page.js(나의 요약 노트)
  app/mypage/bookmarks/page.js(북마크)
  app/mypage(마이페이지)

## layout.js(재사용) - 계속 쓰는 페이지

app/loading.js ???
app/layout.js(main)

- Header.jsx
- {children}
  app/summary/[summaryId]/layout.js(요약 노트 페이지)

- 주제
- 요약본 출력
- {children}
