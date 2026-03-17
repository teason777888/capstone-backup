import Sidebar from './Sidebar';

export default function AppShell({ title, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
