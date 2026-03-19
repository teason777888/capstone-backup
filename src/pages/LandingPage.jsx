import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container">
          <h2 className="logo">CommuniCare</h2>
          <nav className="landing-nav">
            <Button variant="secondary" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/register')}>Register</Button>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">Empower Your Community Recovery</h1>
            <p className="hero-subtitle">
              A self-assessment tool designed for Community Recovery Committees to evaluate governance,
              track progress, and strengthen community resilience.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate('/register')}>Register</Button>
              <Button variant="secondary" onClick={() => navigate('/login')}>Sign In</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <p className="muted">© 2026 CommuniCare. Built for Community Recovery Committees.</p>
        </div>
      </footer>
    </div>
  );
}
