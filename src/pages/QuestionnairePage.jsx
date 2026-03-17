import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/common/Button';
import QuestionCard from '../components/assessment/QuestionCard';
import { assessmentService } from '../services/assessmentService';

const questions = [
  'Our group has a clearly defined mission and scope.',
  'Our governance structure supports fair decision making.',
  'Our group collaborates effectively with external organisations.',
];

export default function QuestionnairePage() {
  const [answers, setAnswers] = useState({ 0: 3, 1: 4, 2: 2 });
  const [message, setMessage] = useState('');

  const handleChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    const result = await assessmentService.submitResponses({ answers });
    setMessage(result.message || 'Submitted successfully.');
  };

  return (
    <AppShell title="CRC Self-Assessment Questionnaire">
      <div className="two-column-grid">
        <section>
          <div className="card soft-card">
            <p className="muted">Section 1 of 2</p>
            <h3>Scope & Mission</h3>
          </div>
          {questions.map((question, index) => (
            <QuestionCard
              key={question}
              question={question}
              value={answers[index]}
              onChange={(value) => handleChange(index, value)}
            />
          ))}
          <div className="button-row">
            <Button variant="secondary">Save Draft</Button>
            <Button onClick={handleSubmit}>Submit Assessment</Button>
          </div>
          {message && <p className="success-text">{message}</p>}
        </section>
        <aside className="card">
          <h3>Live Summary</h3>
          <ul className="list">
            <li>Response Distribution: balanced</li>
            <li>Mean Score: 3.0</li>
            <li>Standard Deviation: 0.82</li>
            <li>Highest Agreement: governance clarity</li>
            <li>Highest Disagreement: external collaboration</li>
          </ul>
        </aside>
      </div>
    </AppShell>
  );
}
