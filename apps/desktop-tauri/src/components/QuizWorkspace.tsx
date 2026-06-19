import React from "react";
import type { AttemptResponse, QuizQuestion } from "../types.js";

void React;

type QuizAnswer = "A" | "B" | "C" | "D";

interface VisibleQuizQuestion {
  question: QuizQuestion;
  questionNumber: number;
}

interface QuizWorkspaceProps {
  answers: Record<string, QuizAnswer>;
  attempt: AttemptResponse | null;
  attemptReviewGuidance: string;
  attemptWrongNotesHtml: string | null;
  attemptWrongNotesMarkdown: string | null;
  onAnswer: (questionId: string, answer: QuizAnswer) => void;
  onFocusFirstMissing: () => void;
  onFocusQuestion: (questionNumber: number) => void;
  onOpenReportTab: (tab: string, target: string) => void;
  onResetQuizAnswers: () => void;
  onSubmitQuiz: () => void;
  onToggleMissingOnly: () => void;
  quizAnsweredCount: number;
  quizMissingCount: number;
  quizMissingQuestionNumbers: number[];
  quizMissingQuestionSummary: string;
  quizQuestionVisibilitySummary: string;
  quizReadyToSubmit: boolean;
  quizTotalCount: number;
  showOnlyMissingQuizQuestions: boolean;
  visibleQuizQuestions: VisibleQuizQuestion[];
}

export function QuizWorkspace({
  answers,
  attempt,
  attemptReviewGuidance,
  attemptWrongNotesHtml,
  attemptWrongNotesMarkdown,
  onAnswer,
  onFocusFirstMissing,
  onFocusQuestion,
  onOpenReportTab,
  onResetQuizAnswers,
  onSubmitQuiz,
  onToggleMissingOnly,
  quizAnsweredCount,
  quizMissingCount,
  quizMissingQuestionNumbers,
  quizMissingQuestionSummary,
  quizQuestionVisibilitySummary,
  quizReadyToSubmit,
  quizTotalCount,
  showOnlyMissingQuizQuestions,
  visibleQuizQuestions
}: QuizWorkspaceProps) {
  return (
    <section className="quiz-workspace">
      <div className="quiz-header">
        <div className="quiz-header-copy">
          <h2>AI 지시 맥락 퀴즈</h2>
          <p>문법 암기가 아니라 소스 역할을 목적, 책임, 검증 기준이 있는 AI 구현 지시로 바꾸는지 확인합니다.</p>
          <p className="quiz-progress" aria-live="polite">AI 지시 맥락 판단 {quizAnsweredCount}/{quizTotalCount} 응답됨 · {quizReadyToSubmit ? "제출 가능" : "남은 문항을 선택하면 제출할 수 있습니다."}</p>
          <p className="quiz-missing-summary" aria-live="polite">{quizMissingQuestionSummary}</p>
          <p className="quiz-filter-summary" aria-live="polite">{quizQuestionVisibilitySummary}</p>
          {quizMissingQuestionNumbers.length > 0 ? (
            <fieldset className="quiz-missing-shortcuts">
              <legend className="sr-only">미응답 문항 바로가기</legend>
              {quizMissingQuestionNumbers.slice(0, 8).map((questionNumber) => (
                <button key={questionNumber} type="button" aria-label={`미응답 ${questionNumber}번 문항으로 이동`} onClick={() => onFocusQuestion(questionNumber)}>{questionNumber}번</button>
              ))}
              {quizMissingQuestionNumbers.length > 8 ? <span>외 {quizMissingQuestionNumbers.length - 8}개</span> : null}
            </fieldset>
          ) : null}
        </div>
        <div className="quiz-actions">
          <button type="button" onClick={onToggleMissingOnly} aria-pressed={showOnlyMissingQuizQuestions}>{showOnlyMissingQuizQuestions ? "전체 보기" : "미응답만 보기"}</button>
          <button type="button" onClick={onFocusFirstMissing} disabled={quizReadyToSubmit || quizMissingCount === 0}>미응답 문항 찾기</button>
          <button type="button" onClick={onResetQuizAnswers} disabled={quizAnsweredCount === 0 && !attempt}>답변 초기화</button>
          <button type="button" className="primary" onClick={onSubmitQuiz} disabled={!quizReadyToSubmit}>제출</button>
        </div>
      </div>
      <div className="quiz-list">
        {visibleQuizQuestions.map(({ question, questionNumber }) => {
          const selectedAnswer = answers[question.id];
          const answered = Boolean(selectedAnswer);
          return (
            <article key={question.id} className="quiz-item" data-answer-state={answered ? "answered" : "missing"} data-question-number={questionNumber} aria-label={`${questionNumber}번 문항 ${answered ? "답변 선택됨" : "선택 필요"}`}>
              <div className="quiz-item-heading">
                <h3>{questionNumber}. {question.question}</h3>
                <span className={answered ? "quiz-state answered" : "quiz-state missing"} aria-live="polite">{answered ? "답변 선택됨" : "선택 필요"}</span>
              </div>
              <div className="choice-grid">
                {(Object.entries(question.choices) as Array<[QuizAnswer, string]>).map(([key, value]) => (
                  <button type="button" key={key} className={selectedAnswer === key ? "selected" : ""} aria-pressed={selectedAnswer === key} aria-label={`${questionNumber}번 ${key} 선택지${selectedAnswer === key ? " 선택됨" : ""}: ${value}`} onClick={() => onAnswer(question.id, key)}>
                    <strong>{key}</strong>. {value}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
        {showOnlyMissingQuizQuestions && visibleQuizQuestions.length === 0 ? (
          <p className="quiz-filter-empty">미응답 문항이 없습니다. 제출할 수 있습니다.</p>
        ) : null}
      </div>
      {attempt ? (
        <div className="attempt-result">
          <p>최근 제출: {attempt.score}점 · 정답 {attempt.correct} · 오답 {attempt.wrong} · AI 지시 복습 오답 {attempt.wrong}개 · 학습기록 {attempt.learningRecord ?? "없음"}</p>
          <p className="attempt-guidance">학습기록은 단순 점수 저장이 아니라, 틀린 개념을 목적, 책임, 검증 기준이 있는 AI 지시 맥락으로 다시 쓰는 증거입니다. Teaching Workspace의 learning-records 섹션에서 이어 봅니다.</p>
          <p className="attempt-review-guidance">{attemptReviewGuidance}</p>
          <div className="attempt-artifact-paths">
            {attemptWrongNotesHtml ? <p>오답노트 HTML: <code>{attemptWrongNotesHtml}</code></p> : null}
            {attemptWrongNotesMarkdown ? <p>오답노트 Markdown: <code>{attemptWrongNotesMarkdown}</code></p> : null}
            {attempt.learningRecord ? <p className="attempt-record-path">Learning record: <code>{attempt.learningRecord}</code></p> : null}
          </div>
          <div className="attempt-actions">
            <button type="button" onClick={() => onOpenReportTab("오답노트", "wrong-notes")}>AI 지시 복습 열기</button>
            <button type="button" onClick={() => onOpenReportTab("학습 워크스페이스", "teaching-workspace")}>학습기록 확인</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
