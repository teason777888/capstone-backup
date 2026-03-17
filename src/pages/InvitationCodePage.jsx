import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { useGroup } from '../context/GroupContext';

export default function InvitationCodePage() {
  const navigate = useNavigate();
  const { group } = useGroup();
  const [code, setCode] = useState(group.inviteCode);

  const handleJoin = (event) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Join a Recovery Group</h1>
        <p className="muted">Enter your invitation code to access the group workspace.</p>
        <form onSubmit={handleJoin}>
          <InputField label="Invitation Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <div className="card soft-card">
            <h3>Group Preview</h3>
            <p>{group.name}</p>
            <p className="muted">{group.location} · {group.disasterType}</p>
          </div>
          <div className="form-actions">
            <Button type="submit">Join Group</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
