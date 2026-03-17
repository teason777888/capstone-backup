import AppShell from '../components/layout/AppShell';
import KpiCard from '../components/dashboard/KpiCard';
import { useGroup } from '../context/GroupContext';

export default function DashboardPage() {
  const { group } = useGroup();

  return (
    <AppShell title="Dashboard">
      <div className="hero-banner">
        <div>
          <h2>{group.name}</h2>
          <p>{group.location} · {group.disasterType}</p>
        </div>
        <div className="invite-box">Invite Code: {group.inviteCode}</div>
      </div>
      <div className="kpi-grid">
        <KpiCard label="Total Members" value={group.members} helper="Active participants in this group" />
        <KpiCard label="Responses Submitted" value={group.responses} helper="Assessment submissions received" />
        <KpiCard label="Alignment Score" value="74%" helper="Initial aggregated overview" />
      </div>
      <div className="two-column-grid">
        <div className="card">
          <h3>Recent Activity</h3>
          <ul className="list">
            <li>3 new responses were submitted today.</li>
            <li>Invite code was shared with 5 members.</li>
            <li>Network map updated with 2 new organisations.</li>
          </ul>
        </div>
        <div className="card">
          <h3>Quick Links</h3>
          <ul className="list">
            <li>Continue CRC self-assessment</li>
            <li>Manage members and invitation links</li>
            <li>Open social network mapping tool</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
