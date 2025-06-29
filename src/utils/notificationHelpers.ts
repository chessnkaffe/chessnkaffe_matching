// src/utils/notificationHelpers.ts
import React from 'react'; // Add React import
import { ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const formatNotificationTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  let date: Date;
  
  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// ✅ Fixed: Proper React element return with React.createElement
export const getNotificationIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'match_invitation':
      return React.createElement(ChevronRight, { className: "notification-type-icon invitation" });
    case 'match_confirmed':
      return React.createElement(CheckCircle, { className: "notification-type-icon confirmed" });
    case 'match_reminder':
      return React.createElement(Clock, { className: "notification-type-icon reminder" });
    case 'match_declined':
      return React.createElement(XCircle, { className: "notification-type-icon declined" });
    default:
      return React.createElement(ChevronRight, { className: "notification-type-icon default" });
  }
};

export const getNotificationPriority = (type: string): 'high' | 'normal' | 'low' => {
  switch (type) {
    case 'match_invitation':
      return 'high';
    case 'match_confirmed':
      return 'high';
    case 'match_reminder':
      return 'normal';
    case 'match_declined':
      return 'normal';
    default:
      return 'low';
  }
};