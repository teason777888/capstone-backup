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
      <h3 className="bipolar-question-title">Question {questionNumber}</h3>

      <div className="bipolar-scale-row">
        <div className="bipolar-label bipolar-label-left">
          {leftLabel}
        </div>

        <div className="bipolar-options">
          {SCALE_VALUES.map((scaleValue) => (
            <button
              key={scaleValue}
              type="button"
              className={`scale-circle ${value === scaleValue ? "selected" : ""}`}
              onClick={() => onChange(scaleValue)}
            >
              <span className="sr-only">{scaleValue}</span>
            </button>
          ))}
        </div>

        <div className="bipolar-label bipolar-label-right">
          {rightLabel}
        </div>
      </div>
    </div>
  );
}