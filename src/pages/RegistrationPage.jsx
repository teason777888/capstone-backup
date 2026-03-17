import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { groupService } from '../services/groupService';
import { useGroup } from '../context/GroupContext';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { updateGroup } = useGroup();
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    communityName: '',
    groupNumber: '',
    disasterType: '',
    region: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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

    if (!form.disasterType.trim()) {
      newErrors.disasterType = 'Disaster type is required';
    }

    if (!form.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (form.groupNumber && !/^[A-Za-z0-9-]+$/.test(form.groupNumber)) {
      newErrors.groupNumber = 'Group number can only contain letters, numbers, and hyphens';
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

    const result = await groupService.registerGroup(form);
    updateGroup({
      name: result.groupName || form.communityName || 'New Recovery Group',
      inviteCode: result.inviteCode || 'X7A9BQ',
      disasterType: form.disasterType,
      location: form.region,
    });
    navigate('/login');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card wide">
        <h1>Create Your Account</h1>
        <p className="muted">Start your community recovery group journey.</p>
        
        <form className="form-grid" onSubmit={handleSubmit} noValidate>

          <div className="field-group">
            <InputField 
              label="Full Name"
              name="fullName" 
              placeholder="Enter your name" 
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.fullName && errors.fullName ? 'error' : ''}
            />
            {touched.fullName && errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Email"
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'error' : ''}
            />
            {touched.email && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Password"
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? 'error' : ''}
            />
            {touched.password && errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Community Name"
              name="communityName" 
              placeholder="e.g., Riverside Recovery Committee" 
              value={form.communityName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.communityName && errors.communityName ? 'error' : ''}
            />
            {touched.communityName && errors.communityName && (
              <span className="error-message">{errors.communityName}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Group Number (optional)" 
              name="groupNumber" 
              placeholder="e.g., GRP-2026-01" 
              value={form.groupNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.groupNumber && errors.groupNumber ? 'error' : ''}
            />
            {touched.groupNumber && errors.groupNumber && (
              <span className="error-message">{errors.groupNumber}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Disaster Type"
              name="disasterType" 
              placeholder="e.g., Flood, Bushfire, Storm" 
              value={form.disasterType}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.disasterType && errors.disasterType ? 'error' : ''}
            />
            {touched.disasterType && errors.disasterType && (
              <span className="error-message">{errors.disasterType}</span>
            )}
          </div>

          <div className="field-group">
            <InputField 
              label="Affected Region"
              name="region" 
              placeholder="e.g., Northern Rivers, NSW" 
              value={form.region}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.region && errors.region ? 'error' : ''}
            />
            {touched.region && errors.region && (
              <span className="error-message">{errors.region}</span>
            )}
          </div>

          <div className="form-actions full-width">
            <Button type="submit">Register</Button>
          </div>

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