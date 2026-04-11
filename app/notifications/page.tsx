import NotificationsComponent from './notifications';

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <NotificationsComponent />
      </div>
    </div>
  );
}
