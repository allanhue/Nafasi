import NotificationsComponent from './notifications';

export default function NotificationsPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Updates and alerts across your workspaces.</p>
      </div>
      <div className="card">
        <NotificationsComponent />
      </div>
    </div>
  );
}
