---
name: sp-from-doc
description: "Read one existing Markdown specification from docs/specs, inspect its linked Figma frames, resolve every ambiguity without a question limit, and execute the complete speckit-specify workflow to create and validate a Spec Kit feature specification. Use when the user invokes $sp-from-doc with a docs/specs file path or asks to convert an existing project specification into Spec Kit artifacts."
---

# SP From Doc

기존 프로젝트 명세 한 개를 입력으로 받아 `$speckit-specify` 전체 절차를 실행한다. 명세 생성까지만 수행하고
애플리케이션 코드는 구현하지 않는다.

## 입력

`$ARGUMENTS`에서 Markdown 명세 파일 경로 하나를 받는다.

```text
$sp-from-doc docs/specs/Login.md
```

- 입력이 없으면 `docs/specs`에서 사용할 파일 경로를 요청하고 중단한다.
- 파일이 없거나 Markdown 파일이 아니면 정확한 경로를 요청하고 중단한다.
- 한 번 호출할 때 기능 하나만 처리한다. 입력 문서가 여러 독립 기능을 포함하면 분리할 범위를 확인한다.
- 입력 명세는 원본 요구사항이므로 수정하지 않는다.

## 필수 절차

다음 순서를 생략하지 않는다.

1. 프로젝트 루트의 `AGENTS.md`를 완전히 읽는다.
2. `.specify/memory/constitution.md`가 있으면 완전히 읽는다.
3. 입력 명세를 완전히 읽고 사용자, 행동, 상태, 경로, 예외, 미정 사항을 추출한다.
4. 명세에 Figma URL이 있으면 각 URL에서 `fileKey`와 `node-id`를 추출한다.
5. Figma 디자인을 조회하기 전에 설치된 `figma-design-to-code` 스킬을 완전히 읽고 그 지침을 따른다.
6. 각 Figma 프레임에 `get_design_context`를 호출해 상태별 구성과 시각적 차이를 확인한다.
7. 명세의 미정 사항과 명세·Figma·기존 코드의 충돌을 빠짐없이 수집한다.
8. 서로 다른 결정을 한 질문으로 합치지 말고 각 항목을 별도 질문으로 제시한다. 질문 개수를 제한하지 않는다.
9. 모든 질문에 대한 사용자 답변을 기다리고 결정 사항을 정리한다. 답변되지 않은 항목을 임의로 결정하지
   않는다.
10. 생성·수정할 파일, 기능 디렉터리, 브랜치 계획을 제시하고 사용자 승인을 기다린다.
11. `.agents/skills/speckit-specify/SKILL.md`를 완전히 읽는다.
12. 입력 명세, 사용자 답변, 확인한 Figma 정보를 기능 설명으로 사용해 `speckit-specify`의 모든 절차를
    그대로 실행한다.
13. 품질 체크리스트 검증 중 새로운 미정 사항이 발견되면 산출물 작성을 멈추고 각 항목을 개별 질문한다.
14. 모든 답변을 명세와 체크리스트에 반영하고 `[NEEDS CLARIFICATION]`이 남지 않을 때까지 다시 검증한다.
15. 실행 후 훅을 확인한 다음 생성 경로, 체크리스트 결과, 다음 단계를 한국어로 보고한다.

## 우선순위와 충돌 처리

- 동작과 기능 요구사항은 입력 명세를 우선한다.
- 배치, 크기, 색상, 타이포그래피와 상태별 외형은 Figma를 기준으로 한다.
- 프로젝트 구조와 구현 제약은 `AGENTS.md`와 Constitution을 따른다.
- 문서, 디자인, 기존 코드가 충돌하면 임의로 해결하지 말고 수정 전에 사용자에게 알린다.
- 디자인만으로 알 수 없는 동작을 추측하지 않는다.
- 명세에 없는 기능, 애니메이션, 반응형 동작을 추가하지 않는다.

## 질문 규칙

- 원본 명세의 모든 미정 사항과 충돌을 질문한다. 질문 개수에 상한을 두지 않는다.
- 하나의 질문은 하나의 결정만 다룬다. 서로 다른 기능이나 상태를 한 질문으로 묶지 않는다.
- 각 질문에 배경, 결정할 내용, 가능한 선택지, 선택에 따른 영향을 명확하게 제시한다.
- 질문이 많아도 누락하거나 중요도가 낮다는 이유로 임의의 기본값을 적용하지 않는다.
- 모든 답변을 받은 후에만 브랜치 및 산출물 생성 승인을 요청하고 `speckit-specify`를 실행한다.
- `speckit-specify`의 최대 3개 확인 표시 제한은 확정 전 명세에 표시를 남기는 경우에만 적용한다. 이
  스킬에서는 실행 전에 모든 질문을 해결해 생성 명세에 확인 표시를 남기지 않는다.

## 브랜치와 승인

- 현재 브랜치가 해당 기능의 `feature/*` 브랜치인지 확인한다.
- 적절한 기능 브랜치가 아니면 `feature/<short-name>` 생성·전환을 계획에 포함한다.
- 브랜치 생성, 파일 생성 또는 파일 수정은 사용자 승인 후 수행한다.
- 기존 사용자 변경을 보존하고 작업 범위 밖의 파일을 수정하지 않는다.

## Spec Kit 산출물

`speckit-specify` 지침에 따라 다음 산출물을 반드시 생성한다.

```text
specs/<번호>-<기능명>/
├── spec.md
└── checklists/
    └── requirements.md

.specify/feature.json
```

- `spec.md`는 기능 폴더 안에 있으므로 다른 기능의 `spec.md`와 구분된다.
- 원본 `docs/specs/*.md`와 생성된 `spec.md`의 역할을 구분한다.
- 원본은 프로젝트 요구사항이고 생성본은 Spec Kit 계획·작업 단계의 표준 입력이다.
- 확인 필요 표시가 하나라도 남아 있으면 완료로 보고하지 않는다.

## 완료 조건

- 입력 명세와 모든 디자인 프레임을 확인했다.
- 모든 미정 사항과 충돌을 개별 질문하고 답변을 반영했다.
- 사용자 승인 후 `speckit-specify` 전체 절차를 실행했다.
- `spec.md`, `checklists/requirements.md`, `.specify/feature.json`을 생성했다.
- 미치환 템플릿 토큰과 확인 필요 항목을 검사했다.
- 품질 체크리스트 결과와 `$speckit-clarify` 또는 `$speckit-plan` 준비 상태를 보고했다.
- 애플리케이션 구현 코드는 변경하지 않았다.
