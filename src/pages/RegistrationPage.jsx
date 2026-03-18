// pages/RegistrationPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { authService } from '../services/authService';
import { useGroup } from '../context/GroupContext';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { updateGroup } = useGroup();
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    communityName: '',
    disasterType: '',
    region: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const disasterTypes = [
    { value: 'flood', label: 'Flood' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'hurricane', label: 'Hurricane' },
    { value: 'wildfire', label: 'Wildfire' },
    { value: 'tornado', label: 'Tornado' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'drought', label: 'Drought' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (registerError) {
      setRegisterError('');
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.communityName.trim()) {
      newErrors.communityName = 'Community name is required';
    }

    if (!form.disasterType) {
      newErrors.disasterType = 'Please select a disaster type';
    }

    if (!form.region.trim()) {
      newErrors.region = 'Region is required';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setRegisterError('');
    setFieldErrors({});

    try {
      console.log('Submitting registration form:', form);
      const result = await authService.register(form);
      console.log('Registration result:', result);
      
      if (result.success) {
        updateGroup({
          name: result.data.groupName,
          inviteCode: result.data.inviteCode,
          disasterType: form.disasterType,
          location: form.region,
        });
        
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please sign in with your email and password.' 
          } 
        });
      } else {
        if (result.status === 400 && result.details) {
          setFieldErrors(result.details);
        } else {
          setRegisterError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card wide">
        <h1>Create Your Account</h1>
        <p className="muted">Start your community recovery group journey.</p>
        
        {registerError && (
          <div className="error-banner">
            {registerError}
          </div>
        )}
        
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="field-group">
            <InputField 
              label="Full Name"
              name="fullName" 
              placeholder="Enter your full name" 
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={(touched.fullName && errors.fullName) || fieldErrors.fullName ? 'error' : ''}
            />
            {touched.fullName && errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
            {fieldErrors.fullName && (
              <span className="error-message">{fieldErrors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="field-group">
            <InputField 
              label="Email"
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              value={form.email}
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

          {/* Password */}
          <div className="field-group">
            <InputField 
              label="Password"
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={form.password}
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
            <span className="field-hint">Minimum 8 characters</span>
          </div>

          {/* Community Name */}
          <div className="field-group">
            <InputField 
              label="Community Name"
              name="communityName" 
              placeholder="e.g., Riverside Recovery Committee" 
              value={form.communityName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={(touched.communityName && errors.communityName) || fieldErrors.communityName ? 'error' : ''}
            />
            {touched.communityName && errors.communityName && (
              <span className="error-message">{errors.communityName}</span>
            )}
            {fieldErrors.communityName && (
              <span className="error-message">{fieldErrors.communityName}</span>
            )}
          </div>

          {/* Disaster Type */}
          <div className="field-group">
            <label className="field-label">
              Disaster Type <span className="required">*</span>
            </label>
            <select
              name="disasterType"
              value={form.disasterType}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`field-select ${(touched.disasterType && errors.disasterType) || fieldErrors.disasterType ? 'error' : ''}`}
            >
              <option value="">Select disaster type</option>
              {disasterTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {touched.disasterType && errors.disasterType && (
              <span className="error-message">{errors.disasterType}</span>
            )}
            {fieldErrors.disasterType && (
              <span className="error-message">{fieldErrors.disasterType}</span>
            )}
          </div>

          {/* Region */}
          <div className="field-group">
            <InputField 
              label="Affected Region"
              name="region" 
              placeholder="e.g., Northern Rivers, NSW" 
              value={form.region}
              onChange={handleChange}
              onBlur={handleBlur}
              className={(touched.region && errors.region) || fieldErrors.region ? 'error' : ''}
            />
            {touched.region && errors.region && (
              <span className="error-message">{errors.region}</span>
            )}
            {fieldErrors.region && (
              <span className="error-message">{fieldErrors.region}</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions full-width">
            <Button 
              type="submit" 
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          {/* Footer */}
          <div className="auth-footer full-width">
            <p className="muted">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}