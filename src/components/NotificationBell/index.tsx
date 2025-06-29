// src/components/NotificationBell/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellDot, Check, Trash2, X } from 'lucide-react'; // ✅ Fixed: Changed MarkdownIcon to Check
import { useNotifications } from '../../hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { NotificationBellProps, Notification } from './types';
import { formatNotificationTime, getNotificationIcon } from '../../utils/notificationHelpers';
import './styles.css';

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className = '',
  maxNotifications = 20 
}) => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications(maxNotifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'match_invitation':
        case 'match_confirmed':
        case 'match_declined':
          router.push('/matches');
          break;
        default:
          router.push('/profile');
      }

      setShowDropdown(false);
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    setIsMarkingAllRead(true);
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className={`notification-bell ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        className="bell-button"
        onClick={handleBellClick}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={showDropdown}
      >
        {unreadCount > 0 ? (
          <BellDot className="bell-icon bell-icon-unread" />
        ) : (
          <Bell className="bell-icon" />
        )}
        
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3 className="notification-title">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="mark-all-read-button"
                aria-label="Mark all notifications as read"
              >
                <Check className="mark-all-icon" /> {/* ✅ Fixed: Changed to Check */}
                {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="notification-error">
                <span>Error loading notifications</span>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell className="no-notifications-icon" />
                <span>No notifications yet</span>
                <p>You'll see chess match updates here</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    onDeleteClick={handleDeleteNotification}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                onClick={() => {
                  router.push('/matches'); // ✅ Changed from /notifications to /matches
                  setShowDropdown(false);
                }}
                className="view-all-button"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onDeleteClick: (id: string, event: React.MouseEvent) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
  onDeleteClick
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async (event: React.MouseEvent) => {
    setIsDeleting(true);
    try {
      await onDeleteClick(notification.id, event);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`notification-item ${!notification.read ? 'notification-item-unread' : ''}`}
      onClick={() => onNotificationClick(notification)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onNotificationClick(notification);
        }
      }}
    >
      {/* Icon */}
      <div className="notification-item-icon">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="notification-item-content">
        <div className="notification-item-title">{notification.title}</div>
        <div className="notification-item-message">{notification.message}</div>
        
        {/* Metadata */}
        <div className="notification-item-meta">
          <span className="notification-item-time">
            {formatNotificationTime(notification.createdAt)}
          </span>
          {notification.data.location && (
            <span className="notification-item-location">
              📍 {notification.data.location}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="notification-item-actions">
        {!notification.read && <div className="unread-dot" />}
        
        <button
          className="notification-delete-button"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          aria-label="Delete notification"
        >
          {isDeleting ? (
            <div className="delete-spinner"></div>
          ) : (
            <X className="delete-icon" />
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationBell;