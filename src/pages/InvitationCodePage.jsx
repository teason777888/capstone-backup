import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';

export default function InvitationCodePage() {
  const navigate = useNavigate();
  const { group, updateGroup } = useGroup();
  const { user } = useAuth();
  
  const [mode, setMode] = useState('create');
  
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const [createdCode, setCreatedCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateGroup = async () => {
    setIsCreating(true);
    setCreateSuccess(false);
    
    const newCode = generateInviteCode();
    
    setTimeout(() => {
      setCreatedCode(newCode);
      setCreateSuccess(true);
      
      updateGroup({
        ...group,
        name: `${user?.name || 'User'}'s Recovery Group`,
        inviteCode: newCode,
        members: 1
      });
      
      setIsCreating(false);
    }, 1000); 
  };


  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter an invitation code');
      return;
    }

    setIsJoining(true);
    setJoinError('');


    setTimeout(() => {

      const validCodes = ['X7A9BQ', 'TEST123', 'ABC123', 'HELLO6'];
      
      if (validCodes.includes(joinCode.toUpperCase())) {
        updateGroup({
          name: 'Riverside Recovery Committee',
          inviteCode: joinCode.toUpperCase(),
          location: 'Northern Rivers, NSW',
          disasterType: 'Flood',
          members: 18
        });
        
        navigate('/dashboard');
      } else {
        setJoinError('Invalid invitation code');
      }
      
      setIsJoining(false);
    }, 1000);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Recovery Group</h1>
        <p className="muted">Create a new group or join an existing one</p>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Create New Group
          </button>
          <button
            className={`mode-btn ${mode === 'join' ? 'active' : ''}`}
            onClick={() => setMode('join')}
          >
            Join Existing Group
          </button>
        </div>

        {mode === 'create' && (
          <div className="create-mode">
            {!createSuccess ? (
              <>
                <div className="info-box">
                  <h3>Start a New Recovery Group</h3>
                  <p>Create a new group and invite others to join using the invitation code.</p>
                </div>

                <div className="code-preview">
                  <p>Your group will be created as:</p>
                  <div className="group-info">
                    <strong>{user?.name || 'User'}'s Recovery Group</strong>
                  </div>
                </div>

                {joinError && (
                  <div className="error-banner">{joinError}</div>
                )}

                <div className="form-actions">
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating Group...' : 'Generate Invitation Code'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="success-mode">
                <div className="success-icon">✅</div>
                <h2>Group Created Successfully!</h2>
                
                <div className="invite-code-box">
                  <label>Your Invitation Code</label>
                  <div className="code-display">
                    <code>{createdCode}</code>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCode);
                        alert('Code copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="muted">Share this code with others to join your group</p>
                </div>

                <div className="form-actions">
                  <Button onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'join' && (
          <div className="join-mode">
            <div className="info-box">
              <h3>Join an Existing Group</h3>
              <p>Enter the invitation code you received from the group creator.</p>
              <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Test codes: X7A9BQ, TEST123, ABC123, HELLO6
              </p>
            </div>

            <div className="field-group">
              <InputField
                label="Invitation Code"
                placeholder="e.g., X7A9BQ"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                className={joinError ? 'error' : ''}
              />
              {joinError && (
                <span className="error-message">{joinError}</span>
              )}
            </div>

            <div className="form-actions">
              <Button 
                onClick={handleJoinGroup} 
                disabled={isJoining || !joinCode.trim()}
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p className="muted">
            Want to start over? <Link to="/register">Create new account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}