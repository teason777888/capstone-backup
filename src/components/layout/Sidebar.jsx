import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const baseLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/group-management', label: 'Group Management' },
  { to: '/assessment-welcome', label: 'Assessment' },
  { to: '/network-mapping', label: 'Network Mapping' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user.role === 'admin'
    ? [...baseLinks, { to: '/admin/questions', label: 'Question Admin' }]
    : baseLinks;

  return (
    <aside className="sidebar">
      <div>
        <h2>CommuniCare</h2>
        <p>Recovery platform</p>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
