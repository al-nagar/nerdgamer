export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-dashboard" style={{ padding: '20px' }}>
      {/* We can add a shared header or nav bar for the admin panel here later */}
      {children}
    </div>
  );
} 