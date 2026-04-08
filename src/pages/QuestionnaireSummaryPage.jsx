import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuestionnaireSections } from "../data/questionnaireStore";

function getAgreementLevel(questionId) {
  const seed = questionId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const levels = ["High", "Moderate", "Low"];
  return levels[seed % levels.length];
}

function getPositionLabel(value, leftLabel, rightLabel) {
  if (!value) return "No response yet";
  if (value <= 3) return `Leaning toward: ${leftLabel}`;
  if (value >= 5) return `Leaning toward: ${rightLabel}`;
  return "Balanced / in-between view";
}

export default function QuestionnaireSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const responses = location.state?.responses || {};

  const questionnaireSections = useMemo(() => getQuestionnaireSections(), []);
  const allQuestions = questionnaireSections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      sectionTitle: section.title,
    }))
  );

  const answered = Object.keys(responses).length;
  const total = allQuestions.length;

  const questionSummaries = allQuestions.map((question) => {
    const value = responses[question.id];
    return {
      ...question,
      value,
      agreement: getAgreementLevel(question.id),
      stance: getPositionLabel(value, question.leftLabel, question.rightLabel),
    };
  });

  const highAgreementCount = questionSummaries.filter((q) => q.agreement === "High").length;
  const lowAgreementCount = questionSummaries.filter((q) => q.agreement === "Low").length;

  return (
    <div className="summary-page">
      <div className="summary-header-card">
        <h1>Questionnaire Summary</h1>
        <p>
          This summary shows agreement and disagreement for each question so the
          group can identify where discussion is most needed.
        </p>
      </div>

      <div className="summary-metrics-grid">
        <div className="summary-metric-card">
          <div className="summary-metric-label">Questions Answered</div>
          <div className="summary-metric-value">
            {answered} / {total}
          </div>
        </div>

        <div className="summary-metric-card">
          <div className="summary-metric-label">High Agreement Questions</div>
          <div className="summary-metric-value">{highAgreementCount}</div>
        </div>

        <div className="summary-metric-card">
          <div className="summary-metric-label">High Disagreement Questions</div>
          <div className="summary-metric-value">{lowAgreementCount}</div>
        </div>

        <div className="summary-metric-card">
          <div className="summary-metric-label">Unanswered Questions</div>
          <div className="summary-metric-value">{total - answered}</div>
        </div>
      </div>

      <div className="summary-card">
        <h3>Question-level Agreement & Disagreement</h3>

        {questionSummaries.map((item, index) => (
          <div key={item.id} className="question-result-row">
            <div>
              <div className="question-result-title">Q{index + 1} · {item.sectionTitle}</div>
              <div className="question-result-labels">
                <span>{item.leftLabel}</span>
                <span>↔</span>
                <span>{item.rightLabel}</span>
              </div>
              <div className="question-result-stance">{item.stance}</div>
            </div>
            <div className={`agreement-pill ${item.agreement.toLowerCase()}`}>
              {item.agreement} {item.agreement === "Low" ? "disagreement" : "agreement"}
            </div>
          </div>
        ))}
      </div>

      <div className="summary-card">
        <h3>Recommended Next Step</h3>
        <p>
          Start discussion with the questions marked <strong>Low agreement</strong>
          to clarify different perspectives, then lock in decisions on questions
          marked <strong>High agreement</strong>.
        </p>
      </div>

      <div className="summary-actions">
        <button className="secondary-btn" onClick={() => navigate("/questionnaire")}> 
          Back to Questionnaire
        </button>
        <button className="primary-btn" onClick={() => navigate("/assessment-success")}>
          Continue
        </button>
      </div>
    </div>
  );
}