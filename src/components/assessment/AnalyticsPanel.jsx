import React from "react";

export default function AnalyticsPanel({
  distribution,
  mean,
  stdDev,
  highestConsensus,
  highestDisagreement,
}) {
  const labels = [
    "Strongly Disagree",
    "Disagree",
    "Slightly Disagree",
    "Neutral",
    "Slightly Agree",
    "Agree",
    "Strongly Agree",
  ];

  const maxValue = Math.max(...distribution, 1);

  return (
    <aside className="analytics-panel">
      <h3 className="analytics-title">REAL-TIME ANALYTICS</h3>

      <div className="analytics-card">
        <h4>Response Distribution</h4>
        <div className="distribution-chart">
          {distribution.map((count, index) => (
            <div key={index} className="distribution-row">
              <span className="distribution-label">{labels[index]}</span>
              <div className="distribution-bar-wrap">
                <div
                  className="distribution-bar"
                  style={{ width: `${(count / maxValue) * 100}%` }}
                />
              </div>
              <span className="distribution-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-metrics-grid">
        <div className="analytics-metric-card">
          <div className="metric-label">Mean Score</div>
          <div className="metric-value">{mean.toFixed(1)}</div>
        </div>

        <div className="analytics-metric-card">
          <div className="metric-label">Standard Deviation</div>
          <div className="metric-value">{stdDev.toFixed(1)}</div>
        </div>
      </div>

      <div className="analytics-insights-card">
        <div className="metric-label">INSIGHTS</div>
        <p>Highest Consensus: {highestConsensus}</p>
        <p>Highest Disagreement: {highestDisagreement}</p>
      </div>
    </aside>
  );
}