import AppShell from '../components/layout/AppShell';
import Button from '../components/common/Button';
import { useGroup } from '../context/GroupContext';

export default function GroupManagementPage() {
  const { group } = useGroup();

  return (
    <AppShell title="Group Management">
      <div className="two-column-grid">
        <div className="card">
          <h3>Group Information</h3>
          <p><strong>Name:</strong> {group.name}</p>
          <p><strong>Location:</strong> {group.location}</p>
          <p><strong>Disaster Type:</strong> {group.disasterType}</p>
        </div>
        <div className="card">
          <h3>Invitation Tools</h3>
          <p><strong>Invite Code:</strong> {group.inviteCode}</p>
          <div className="button-row">
            <Button>Copy Code</Button>
            <Button variant="secondary">Generate New Code</Button>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Member Overview</h3>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Assessment</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Alex Carter</td><td>Active</td><td>Completed</td></tr>
            <tr><td>Priya Sharma</td><td>Pending</td><td>Not started</td></tr>
            <tr><td>Jordan Lee</td><td>Active</td><td>In progress</td></tr>
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
