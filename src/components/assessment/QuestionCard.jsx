export default function QuestionCard({ question, value, onChange }) {
  return (
    <div className="card">
      <h3>{question}</h3>
      <div className="likert-row">
        {[1, 2, 3, 4, 5].map((score) => (
          <label key={score} className="likert-option">
            <input
              type="radio"
              checked={value === score}
              onChange={() => onChange(score)}
            />
            <span>{score}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
