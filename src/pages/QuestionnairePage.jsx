import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireSections } from "../data/questionnaireStore";
import BipolarScaleQuestion from "../components/assessment/BipolarScaleQuestion";
import AnalyticsPanel from "../components/assessment/AnalyticsPanel";

function calculateMean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStdDev(values) {
  if (!values.length) return 0;
  const mean = calculateMean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  const questionnaireSections = useMemo(() => getQuestionnaireSections(), []);
  const currentSection = questionnaireSections[currentSectionIndex];

  const totalQuestions = questionnaireSections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const currentSectionResponses = currentSection.questions
    .map((q) => responses[q.id])
    .filter(Boolean);

  const mean = useMemo(
    () => calculateMean(currentSectionResponses),
    [currentSectionResponses]
  );

  const stdDev = useMemo(
    () => calculateStdDev(currentSectionResponses),
    [currentSectionResponses]
  );

  const mockDistribution = [8, 14, 18, 22, 30, 52, 30];

  const updateResponse = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const goNextSection = () => {
    if (currentSectionIndex < questionnaireSections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      navigate("/assessment-summary", { state: { responses } });
    }
  };

  const goPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="questionnaire-layout">
      <aside className="questionnaire-sidebar">
        <h3 className="sidebar-heading">PROGRESS</h3>

        {questionnaireSections.map((section, index) => {
          const sectionAnswered = section.questions.filter(
            (q) => responses[q.id]
          ).length;

          const sectionProgress = Math.round(
            (sectionAnswered / section.questions.length) * 100
          );

          return (
            <div
              key={section.id}
              className={`section-progress-item ${
                index === currentSectionIndex ? "active" : ""
              }`}
            >
              <div className="section-index">{index + 1}</div>
              <div className="section-progress-content">
                <div className="section-title">{section.title}</div>
                <div className="section-progress-bar">
                  <div
                    className="section-progress-fill"
                    style={{ width: `${sectionProgress}%` }}
                  />
                </div>
                <div className="section-progress-text">{sectionProgress}%</div>
              </div>
            </div>
          );
        })}
      </aside>

      <main className="questionnaire-main">
        <div className="questionnaire-card">
          <div className="questionnaire-topbar">
            <div>
              <div className="question-count">
                Section {currentSectionIndex + 1} of {questionnaireSections.length}
              </div>
              <div className="questionnaire-progress-bar">
                <div
                  className="questionnaire-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="questionnaire-progress-number">{progressPercent}%</div>
          </div>

          <p className="questionnaire-description">
            {currentSection.description}
          </p>

          <h2 className="section-heading">{currentSection.title}</h2>

          <div className="question-list">
            {currentSection.questions.map((question, index) => (
              <BipolarScaleQuestion
                key={question.id}
                questionNumber={index + 1}
                leftLabel={question.leftLabel}
                rightLabel={question.rightLabel}
                value={responses[question.id]}
                onChange={(value) => updateResponse(question.id, value)}
              />
            ))}
          </div>

          <div className="questionnaire-actions">
            <button
              className="secondary-btn"
              onClick={goPrevSection}
              disabled={currentSectionIndex === 0}
            >
              Previous
            </button>

            <button className="ghost-btn">Save Draft</button>

            <button className="primary-btn" onClick={goNextSection}>
              {currentSectionIndex === questionnaireSections.length - 1
                ? "Submit"
                : "Next"}
            </button>
          </div>
        </div>
      </main>

      <AnalyticsPanel
        distribution={mockDistribution}
        mean={mean || 3.8}
        stdDev={stdDev || 1.2}
        highestConsensus="Q1 (SD = 0.5)"
        highestDisagreement="Q7 (SD = 2.1)"
      />
    </div>
  );
}