import { useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { addCustomQuestion, getQuestionnaireSections } from '../data/questionnaireStore';

export default function AdminQuestionBankPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ sectionId: 'formation-scope', leftLabel: '', rightLabel: '' });
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const sections = useMemo(() => getQuestionnaireSections(), [version]);

  if (user.role !== 'admin') {
    return (
      <AppShell title="Question Bank Admin">
        <div className="card">
          <h3>Access Restricted</h3>
          <p>Only admin users can add questionnaire questions.</p>
        </div>
      </AppShell>
    );
  }

  const onSubmit = (event) => {
    event.preventDefault();
    setSaved('');
    setError('');

    if (!form.leftLabel.trim() || !form.rightLabel.trim()) {
      setError('Both left and right labels are required.');
      return;
    }

    addCustomQuestion(form);
    setForm((prev) => ({ ...prev, leftLabel: '', rightLabel: '' }));
    setSaved('Question added successfully. It will appear in the questionnaire and summary.');
    setVersion((v) => v + 1);
  };

  return (
    <AppShell title="Question Bank Admin">
      <div className="two-column-grid">
        <div className="card">
          <h3>Add a New Question</h3>
          <p className="muted">Create a new bipolar question for any section.</p>
          {error && <p className="error-message">{error}</p>}
          {saved && <p className="success-text">{saved}</p>}

          <form onSubmit={onSubmit}>
            <div className="field-group">
              <label className="field-label">Section</label>
              <select
                className="field-select"
                value={form.sectionId}
                onChange={(e) => setForm((prev) => ({ ...prev, sectionId: e.target.value }))}
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Left statement</label>
              <input
                className="admin-text-input"
                value={form.leftLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, leftLabel: e.target.value }))}
                placeholder="e.g. Informal collaboration"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Right statement</label>
              <input
                className="admin-text-input"
                value={form.rightLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, rightLabel: e.target.value }))}
                placeholder="e.g. Formal partnership agreements"
              />
            </div>

            <button type="submit" className="primary-btn">Add Question</button>
          </form>
        </div>

        <div className="card">
          <h3>Current Questions by Section</h3>
          {sections.map((section) => (
            <div key={section.id} style={{ marginBottom: '1rem' }}>
              <strong>{section.title}</strong>
              <p className="muted">{section.questions.length} questions</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}