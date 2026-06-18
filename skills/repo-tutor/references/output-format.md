# RepoTutor Output Format

The CLI prints JSON that agents should treat as the handoff contract.

`repo-tutor study` and `repo-tutor resume` include:

- `sessionId`
- `status` or resume `verificationStatus`
- `path` or resume `root`
- `html`
- `dailySummaryHtml`
- `teachingWorkspaceHtml`
- `learnerGoalAlignmentHtml` for study output
- `verificationOk`
- `verificationReport`
- `verificationMarkdown`
- `verificationHtml`
- `verificationCheckedRequiredArtifacts`
- `verificationChecks`
- `quizQuestions` for study output
- `htmlTargets` and `htmlTargetStatus` for resume output

`repo-tutor quiz` includes:

- `attemptId`
- `score`
- `correct`
- `wrong`
- `wrongNotes`
- `wrongNotesHtml`
- `wrongNotesMarkdown`
- `learningRecord`
- `reviewGuidance`

User-facing answers should report the generated session folder,
`html/index.html`, `html/daily-summary.html`, `html/teaching-workspace.html`,
verification status, and the quiz `learningRecord` when a quiz attempt is
created.
