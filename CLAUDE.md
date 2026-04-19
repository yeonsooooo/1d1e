# Claude 작업 규칙

## UI 수정 지침

- 사용자가 구체적인 수치(px, rem, 색상값 등)를 명시하면 **그대로 적용**한다. 임의로 다른 값으로 바꾸지 않는다.
- 지정한 값이 이상하거나 문제가 있다고 판단될 경우, 임의로 수정하지 말고 **먼저 사용자에게 확인**한다.
- "없애줘", "제거해줘"는 0 또는 none으로 적용한다. "줄여줘"가 아니다.

## 프로젝트 개요

- **앱명**: 1d1e (One Day, One Emoji)
- **스택**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript
- **주요 컴포넌트**:
  - `components/calendar-app.tsx` — 메인 앱 컨테이너, localStorage 저장
  - `components/calendar-grid.tsx` — 달력 그리드
  - `components/month-tabs.tsx` — 월 탭 (가로 스크롤)
  - `components/entry-modal.tsx` — 일기 입력 모달
  - `components/emoji-picker.tsx` — 이모지 선택 피커
  - `components/settings-modal.tsx` — 설정 모달
  - `components/shaped-calendar-card.tsx` — SVG 기반 달력 카드 배경
- **localStorage 키**:
  - `1d1e-entries` — 모든 일기 데이터 (emoji + text)
  - `dayStartHour` — 하루 시작 시간 설정
- **디자인 톤**: 다크 (#1C1C1E 배경, #3a3a3a 카드, #2a2a2a 내부)
- **아이콘**: lucide-react, strokeWidth={1.5} 통일 (헤더 아이콘은 strokeWidth={1})
