import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/common/Button';
import OrganizationPill from '../components/network/OrganizationPill';
import { networkService } from '../services/networkService';

const defaultOrgs = ['Regional Council', 'Local School', 'Volunteer Fire Brigade', 'Community Centre'];

export default function NetworkMappingPage() {
  const [organisations, setOrganisations] = useState(defaultOrgs);
  const [newOrg, setNewOrg] = useState('');
  const [message, setMessage] = useState('');

  const addOrganisation = async () => {
    if (!newOrg.trim()) return;
    const next = [...organisations, newOrg.trim()];
    setOrganisations(next);
    setNewOrg('');
    const result = await networkService.saveConnections({ organisations: next });
    setMessage(result.message || 'Saved.');
  };

  return (
    <AppShell title="Social Network Mapping">
      <div className="two-column-grid">
        <div className="card">
          <h3>Connected Organisations</h3>
          <div className="pill-row">
            {organisations.map((org) => <OrganizationPill key={org} name={org} />)}
          </div>
          <div className="inline-form">
            <input
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="Add a new organisation"
            />
            <Button onClick={addOrganisation}>Add</Button>
          </div>
          {message && <p className="success-text">{message}</p>}
        </div>
        <div className="card network-placeholder">
          <h3>Network Graph Preview</h3>
          <div className="graph-box">Dynamic network visualisation area</div>
          <ul className="list">
            <li>Bridging organisations: 3</li>
            <li>Network density: medium</li>
            <li>Most connected cluster: local support services</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
