//src/hooks/useNotifications.ts

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  writeBatch,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../components/NotificationBell/types';

export const useNotifications = (maxNotifications: number = 20) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(maxNotifications)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        try {
          const notifs: Notification[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Filter out expired notifications
            if (data.expiresAt) {
              const expirationDate = new Date(data.expiresAt);
              if (new Date() > expirationDate) {
                return; // Skip expired notification
              }
            }
            
            notifs.push({ 
              id: doc.id, 
              ...data,
              createdAt: data.createdAt || Timestamp.now()
            } as Notification);
          });
          
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.read).length);
          setLoading(false);
        } catch (err) {
          console.error('Error processing notifications:', err);
          setError('Failed to load notifications');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, maxNotifications]);

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw new Error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      
      if (unreadNotifs.length === 0) return;

      const batch = writeBatch(db);
      const timestamp = Timestamp.now();
      
      unreadNotifs.forEach(notification => {
        const notifRef = doc(db, 'notifications', notification.id);
        batch.update(notifRef, { 
          read: true,
          readAt: timestamp
        });
      });
      
      await batch.commit();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw new Error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        deleted: true,
        deletedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw new Error('Failed to delete notification');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};