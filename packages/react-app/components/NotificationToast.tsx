import React from 'react';
import { useNotifications, useAppStore } from '../lib/store';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const notificationStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function NotificationToast() {
  const notifications = useNotifications();
  const removeNotification = useAppStore((state) => state.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type];
        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-center p-4 border rounded-lg shadow-lg max-w-sm transition-all duration-300',
              notificationStyles[notification.type]
            )}
          >
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{notification.title}</div>
              <div className="text-sm opacity-90">{notification.message}</div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
} 