import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await authService.login(credentials);
    login(result);
    navigate('/join-group');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Sign In</h1>
        <p className="muted">Access your CommuniCare workspace.</p>
        <form onSubmit={handleSubmit}>
          <InputField label="Email" name="email" type="email" placeholder="name@example.com" onChange={handleChange} />
          <InputField label="Password" name="password" type="password" placeholder="••••••••" onChange={handleChange} />
          <div className="form-actions">
            <Button type="submit">Sign In</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
