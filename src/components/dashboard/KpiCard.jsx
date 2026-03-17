export default function KpiCard({ label, value, helper }) {
  return (
    <div className="card">
      <p className="muted">{label}</p>
      <h3>{value}</h3>
      <p className="muted">{helper}</p>
    </div>
  );
}
