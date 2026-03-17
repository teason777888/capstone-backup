import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField label="Full Name" name="fullName" placeholder="Enter your name" onChange={handleChange} />
          <InputField label="Email" name="email" type="email" placeholder="name@example.com" onChange={handleChange} />
          <InputField label="Password" name="password" type="password" placeholder="••••••••" onChange={handleChange} />
          <InputField label="Community Name" name="communityName" placeholder="Riverside Recovery Committee" onChange={handleChange} />
          <InputField label="Group Number" name="groupNumber" placeholder="GRP-2026-01" onChange={handleChange} />
          <InputField label="Disaster Type" name="disasterType" placeholder="Flood" onChange={handleChange} />
          <InputField label="Affected Region" name="region" placeholder="Northern Rivers, NSW" onChange={handleChange} />
          <div className="form-actions full-width">
            <Button type="submit">Register</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
