---
version: alpha
name: RepoTutor Studio Korean Source-Learning Workbench
description: >
  Korean-first Tauri workbench for turning GitHub repositories, source folders,
  ZIP files, and SKILL.md projects into source-backed vibe-coding learning
  briefings. The interface is a dense learning cockpit, not a landing page.
source:
  input_type: source_project
  checked_at: "2026-06-09"
  evidence_root: /Users/wj/Ai/System/10_Projects/RepoTutorStudio
inspirations:
  worklog: /Users/wj/Ai/System/10_Projects/WorklogTracker/DESIGN.md
  research: /Users/wj/Ai/System/10_Projects/ResearchFlowAI/DESIGN.md
  carevault: /Users/wj/Ai/System/10_Projects/CareVault/DESIGN.md
  design_md_open_design:
    - /Users/wj/.codex/design-md/repos/open-design/design-systems/hud/DESIGN.md
    - /Users/wj/.codex/design-md/repos/open-design/design-systems/vibrant/DESIGN.md
    - /Users/wj/.codex/design-md/repos/open-design/design-systems/openai/DESIGN.md
colors:
  canvas: "#edf3f2"
  sidebar: "#102326"
  surface: "#ffffff"
  surfaceSoft: "#f7fbf8"
  text: "#142426"
  muted: "#617174"
  border: "#cddbd8"
  primary: "#0f766e"
  primaryStrong: "#115e59"
  signal: "#d9f970"
  violet: "#6c5bd4"
  orange: "#f97316"
  danger: "#b42318"
typography:
  ui:
    fontFamily: "\"Pretendard Variable\", Pretendard, \"Apple SD Gothic Neo\", \"Noto Sans KR\", system-ui, sans-serif"
    letterSpacing: "0px"
  mono:
    fontFamily: "\"SFMono-Regular\", \"JetBrains Mono\", Consolas, monospace"
    letterSpacing: "0px"
rounded:
  control: "6px"
  panel: "8px"
  pill: "999px"
spacing:
  base: "4px"
  panel: "14px"
  workspace: "22px desktop, 14px mobile"
components:
  sidebar: "dark teal sticky session rail with compact Korean labels"
  missionBrief: "high-contrast cockpit header with source, auth, and mode state"
  commandBand: "single-row desktop command console that collapses to one column"
  targetCards: "source-backed report shortcuts with terminal command and HTML path"
  tutorPanel: "sticky right-side action stack for glossary, folders, files, roadmap, prompt pack, quiz"
  statusStrip: "four compact live-readiness blocks"
states:
  focus: "3px teal ring"
  active: "dark surface with white text"
  primaryAction: "signal lime background with ink text"
motion:
  hover: "160ms functional lift"
  policy: "no decorative parallax; respect reduced motion in future motion work"
---

# DESIGN.md

이 파일은 RepoTutor Studio의 데스크톱 UI/UX 디자인 계약입니다.

## Product Context

RepoTutor Studio is for a Korean vibe-coding learner who gives the app a
GitHub URL or source folder and needs to learn how to direct AI to build
something similar. The learner is not trying to become a traditional
line-by-line programmer. The UI must keep the source, learning targets,
prompt pack, quiz, wrong notes, and verification boundary visible as an
operational workflow.

## Aesthetic Direction

Use a **source-learning cockpit**: dense like Worklog/ResearchFlowAI, private
and calm like CareVault, with HUD-style status clarity and a brighter signal
accent from the open-design vibrant system. This is a desktop workbench, not a
marketing page.

## Color Rules

- The main canvas is low-chroma clinical green-gray.
- The session rail is dark teal.
- Signal lime is only for primary action, important numeric state, and cockpit
  emphasis.
- Teal is the stable interaction and focus color.
- Violet and orange are secondary accent tokens only; do not let them dominate.
- Do not use generic white-card plus purple-gradient AI styling.

## Typography Rules

- Korean UI uses Pretendard-first fallbacks.
- Letter spacing remains `0px`.
- Headings are compact inside the app shell; no oversized hero type inside
  repeated panels.
- Monospace is reserved for paths, terminal commands, and code-like evidence.

## Layout Rules

- First viewport must be the working app: session rail, command band, target
  tabs, report pane, tutor panel, and logs.
- Sidebar owns session navigation.
- Workspace owns page padding.
- Panels own internal padding.
- Repeated report cards may be cards; page sections should stay direct
  work surfaces.
- At narrow widths, every major grid collapses to one column without
  horizontal overflow.

## Component Rules

- Buttons use icon plus Korean label when the action is not obvious.
- Status blocks must include text, not color alone.
- Report target cards must keep `target`, HTML path, and terminal command
  visible because CLI and skill mode are first-class.
- The Codex SDK control is optional. It must communicate that authentication
  and usage limits are handled by the SDK/Codex account, while RepoTutor keeps
  local static analysis available.

## Do

- Keep Korean labels specific and operational.
- Keep source evidence and verification boundaries visible.
- Use design-md references as token and layout guidance, not as copied brand
  skins.
- Prefer compact density over landing-page composition.

## Do Not

- Do not hide CLI/skill paths behind desktop-only UI.
- Do not store or request ChatGPT credentials in the app.
- Do not add decorative effects that reduce readability.
- Do not turn external source repositories into permanent product knowledge.
