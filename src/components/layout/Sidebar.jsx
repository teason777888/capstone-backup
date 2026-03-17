import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/group-management', label: 'Group Management' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/network-mapping', label: 'Network Mapping' },
];

export default function Sidebar() {
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
