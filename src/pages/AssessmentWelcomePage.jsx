import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Button from '../components/common/Button';

export default function AssessmentWelcomePage() {
  const navigate = useNavigate();

  return (
    <AppShell title="Assessment">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to Your Assessment</h1>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Help us understand your community's recovery progress
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card soft-card">
            <h3 style={{ marginTop: 0 }}>What to Expect</h3>
            <ul className="list">
              <li>This assessment will take approximately 15-20 minutes to complete</li>
              <li>You'll answer questions about governance, communication, and community engagement</li>
              <li>Your responses will help identify strengths and areas for improvement</li>
              <li>You can save your progress and return later if needed</li>
            </ul>
          </div>

          <div className="card soft-card">
            <h3 style={{ marginTop: 0 }}>Before You Begin</h3>
            <ul className="list">
              <li>Find a quiet space where you can focus</li>
              <li>Have relevant committee documents available for reference</li>
              <li>Answer honestly - there are no right or wrong answers</li>
              <li>Consider consulting with other committee members if unsure</li>
            </ul>
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Not Now
          </Button>
          <Button onClick={() => navigate('/assessment')}>
            Start Assessment
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
