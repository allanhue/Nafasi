'use client';

import { useState } from 'react';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Payment Received',
    message: 'Rent payment from Unit 5 received',
    type: 'success',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Maintenance Request',
    message: 'New maintenance request for Unit 3',
    type: 'warning',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: '3',
    title: 'Overdue Payment',
    message: 'Unit 7 rent payment is overdue',
    type: 'error',
    timestamp: '3 days ago',
    read: true,
  },
];

export default function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(current =>
      current.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notification-center">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No notifications</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border-l-4 cursor-pointer ${
                notif.read ? 'bg-gray-50' : 'bg-white'
              } ${
                notif.type === 'success'
                  ? 'border-green-500'
                  : notif.type === 'warning'
                    ? 'border-yellow-500'
                    : notif.type === 'error'
                      ? 'border-red-500'
                      : 'border-blue-500'
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
              </div>
              <p className="text-xs text-gray-500 mt-2">{notif.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
