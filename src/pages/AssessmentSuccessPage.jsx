import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Button from '../components/common/Button';

export default function AssessmentSuccessPage() {
  const navigate = useNavigate();

  return (
    <AppShell title="Assessment Complete">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ color: '#0c8c5f', marginBottom: '0.5rem' }}>Assessment Submitted!</h1>
          <p className="muted" style={{ fontSize: '1.05rem', marginBottom: '2rem' }}>
            Thank you for completing the assessment. Your responses have been recorded.
          </p>
        </div>

        <div className="card soft-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>What Happens Next?</h3>
          <p>Your responses will be analyzed and aggregated with other committee members. Results will be available on your dashboard within 24 hours.</p>
        </div>

        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
