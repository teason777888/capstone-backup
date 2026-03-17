import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { questionnaireSections } from "../data/questionnaireData";

export default function QuestionnaireSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const responses = location.state?.responses || {};

  const answered = Object.keys(responses).length;
  const total = questionnaireSections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  const mockSectionResults = [
    { name: "Formation and Scope", mean: 4.8, agreement: "High" },
    { name: "Governance and Structure", mean: 4.1, agreement: "Moderate" },
    { name: "Stakeholder Engagement", mean: 5.2, agreement: "High" },
  ];

  return (
    <div className="summary-page">
      <div className="summary-header-card">
        <h1>Questionnaire Summary</h1>
        <p>
          Thank you for completing the CRC self-assessment questionnaire. This
          page presents a summary of your responses and key group-level insights.
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
          <div className="summary-metric-label">Overall Alignment Score</div>
          <div className="summary-metric-value">4.4</div>
        </div>

        <div className="summary-metric-card">
          <div className="summary-metric-label">Highest Consensus</div>
          <div className="summary-metric-value">Q1</div>
        </div>

        <div className="summary-metric-card">
          <div className="summary-metric-label">Highest Disagreement</div>
          <div className="summary-metric-value">Q7</div>
        </div>
      </div>

      <div className="summary-content-grid">
        <div className="summary-card">
          <h3>Section-Level Results</h3>

          {mockSectionResults.map((item) => (
            <div key={item.name} className="section-result-row">
              <div className="section-result-text">
                <strong>{item.name}</strong>
                <span>{item.agreement} agreement</span>
              </div>
              <div className="summary-bar-wrap">
                <div
                  className="summary-bar"
                  style={{ width: `${(item.mean / 7) * 100}%` }}
                />
              </div>
              <div className="summary-score">{item.mean.toFixed(1)}</div>
            </div>
          ))}
        </div>

        <div className="summary-card">
          <h3>Key Insights</h3>
          <ul className="insight-list">
            <li>The group shows the strongest consensus around location and scope definition.</li>
            <li>The greatest disagreement appears in the timing and formation of the group.</li>
            <li>Governance-related items show moderate variation and may need discussion.</li>
            <li>Stakeholder engagement is relatively strong across respondents.</li>
          </ul>
        </div>
      </div>

      <div className="summary-card">
        <h3>Recommended Next Step</h3>
        <p>
          Use the highest disagreement items as discussion prompts in your next
          committee meeting. These questions highlight areas where member views
          differ most and where structured discussion may improve alignment.
        </p>
      </div>

      <div className="summary-actions">
        <button className="secondary-btn" onClick={() => navigate("/questionnaire")}>
          Back to Questionnaire
        </button>
        <button className="primary-btn" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}