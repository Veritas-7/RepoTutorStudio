import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { findQuizLearningRecord, loadStudyHtmlInput, scoreQuizAttempt } from "@repotutor/core";
import type { ParsedArgs } from "./args.js";
import { quizAttemptMarkdown } from "./cli-formatters.js";
import { stringFlag } from "./flags.js";
import { resolveSessionRoot } from "./session-utils.js";

export async function quiz(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("quiz supports --format json or markdown.");
  let answers: Record<string, "A" | "B" | "C" | "D">;
  const answersFile = stringFlag(parsed.flags.answers);
  if (answersFile) {
    answers = JSON.parse(await fs.readFile(path.resolve(answersFile), "utf8")) as Record<string, "A" | "B" | "C" | "D">;
  } else if (parsed.flags.interactive) {
    answers = await askAnswers(htmlInput.quiz.questions);
  } else {
    throw new Error("quiz requires --interactive or --answers answers.json");
  }
  const attempt = await scoreQuizAttempt(sessionRoot, answers, htmlInput);
  const learningRecord = await findQuizLearningRecord(sessionRoot, attempt.attemptId);
  const payload = {
    attemptId: attempt.attemptId,
    score: attempt.score,
    correct: attempt.correctCount,
    wrong: attempt.wrongCount,
    wrongNotes: path.join(sessionRoot, "html", "wrong-notes.html"),
    wrongNotesHtml: path.join(sessionRoot, "html", "wrong-notes.html"),
    wrongNotesMarkdown: path.join(sessionRoot, "markdown", "wrong-notes.md"),
    learningRecord,
    reviewGuidance: attempt.wrongCount > 0
      ? "오답노트의 선택지 복습과 learning-record를 열어 부족한 개념을 AI repair prompt로 다시 설명하세요."
      : "learning-record를 열어 이번 퀴즈가 어떤 AI 구현 맥락 준비도를 증명했는지 확인하세요."
  };
  console.log(format === "markdown" ? quizAttemptMarkdown(payload) : JSON.stringify(payload, null, 2));
}

async function askAnswers(questions: Array<{ id: string; question: string; choices: Record<string, string> }>): Promise<Record<string, "A" | "B" | "C" | "D">> {
  const rl = readline.createInterface({ input, output });
  const answers: Record<string, "A" | "B" | "C" | "D"> = {};
  try {
    for (const question of questions) {
      console.log(`\n${question.question}`);
      for (const [key, value] of Object.entries(question.choices)) console.log(`${key}. ${value}`);
      let answer = "";
      while (!["A", "B", "C", "D"].includes(answer)) {
        answer = (await rl.question("Answer (A/B/C/D): ")).trim().toUpperCase();
      }
      answers[question.id] = answer as "A" | "B" | "C" | "D";
    }
  } finally {
    rl.close();
  }
  return answers;
}
