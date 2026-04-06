// pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '' 
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setTouched({
      email: true,
      password: true
    });

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setLoginError('');
    setFieldErrors({});

    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role
        }));
        
        login(result.data);
        
        const hasGroup = localStorage.getItem('hasGroup');
        
        if (result.data.role === 'groupLeader') {
          // The group leader will redirect to the management page
          navigate('/dashboard');
        } else {
          if (hasGroup === 'true') {
            navigate('/dashboard');
          } else {
            navigate('/join-group');
          }
        }
      } else {
        if (result.status === 400 && result.details) {
          setFieldErrors(result.details);
        } else {
          setLoginError(result.error || 'Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Sign In</h1>
        <p className="muted">Access your CommuniCare workspace.</p>
        
        {loginError && (
          <div className="error-banner">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <InputField 
              label="Email"
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              value={credentials.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={(touched.email && errors.email) || fieldErrors.email ? 'error' : ''}
            />
            {touched.email && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
            {fieldErrors.email && (
              <span className="error-message">{fieldErrors.email}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Password"
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={credentials.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={(touched.password && errors.password) || fieldErrors.password ? 'error' : ''}
            />
            {touched.password && errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            {fieldErrors.password && (
              <span className="error-message">{fieldErrors.password}</span>
            )}
          </div>

          <div className="form-actions">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          <div className="auth-footer">
            <p className="muted">
              Don't have an account? <Link to="/register">Create one here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}