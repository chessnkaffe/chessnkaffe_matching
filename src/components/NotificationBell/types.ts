//src/components/NotificationBell/types.ts

export interface Notification {
  id: string;
  userId: string;
  type: 'match_invitation' | 'match_confirmed' | 'match_reminder' | 'match_declined';
  title: string;
  message: string;
  data: {
    matchId: string;
    senderName?: string;
    opponentName?: string;
    date?: string;
    location?: string;
    time?: string;
  };
  read: boolean;
  createdAt: any; // Firestore Timestamp
  expiresAt?: string;
}

export interface NotificationBellProps {
  className?: string;
  maxNotifications?: number;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}