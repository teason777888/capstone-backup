import React from "react";

const SCALE_VALUES = [1, 2, 3, 4, 5, 6, 7];

export default function BipolarScaleQuestion({
  questionNumber,
  leftLabel,
  rightLabel,
  value,
  onChange,
}) {
  return (
    <div className="bipolar-question-card">
      <div className="bipolar-question-header">Question {questionNumber}</div>

      <div className="bipolar-scale-row">
        <div className="bipolar-label left">{leftLabel}</div>

        <div className="bipolar-scale-options">
          {SCALE_VALUES.map((option) => (
            <label key={option} className="bipolar-option">
              <input
                type="radio"
                name={`question-${questionNumber}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              <span className="bipolar-circle" />
            </label>
          ))}
        </div>

        <div className="bipolar-label right">{rightLabel}</div>
      </div>
    </div>
  );
}