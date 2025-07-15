import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { BellAlert16Solid } from './icons'; // Usaremos este ícono
import { Notification } from '../types';
import { Link } from 'react-router-dom';
import { DollarSign } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationItem: React.FC<{ notification: Notification; onRead: (id: string) => void }> = 
({ notification, onRead }) => {
  
  const options = { addSuffix: true, locale: es }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
      case 'loan_created':
        return 'border-green-500';
      case 'loan_approved':
        return 'border-green-500';
      case 'loan_rejected':
        return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleString();
  };


  const notificationTitle = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'Notificación de éxito';
      case 'error': return 'Notificación de error';
      case 'warning': return 'Notificación de advertencia';
      case 'info': return 'Notificación de información';
      case 'loan_created': return 'Notificación de préstamo';
      case 'loan_approved': return 'Notificación de préstamo aprobado';
      case 'loan_rejected': return 'Notificación de préstamo rechazado';
      case 'loan_paid': return 'Notificación de préstamo pagado';
      case 'loan_overdue': return 'Notificación de préstamo vencido';
      case 'loan_cancelled': return 'Notificación de préstamo cancelado';
      case 'loan_expired': return 'Notificación de préstamo expirado';
      case 'loan_renewed': return 'Notificación de préstamo renovado';
      default: return 'Notificación';
    }
  };


  const notificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'loan_created': return <DollarSign className="rounded-full bg-green-500 w-4 h-4 text-white" />;
      case 'loan_approved': return <DollarSign className="rounded-full bg-green-500 w-4 h-4 text-white" />;
      case 'loan_rejected': return <DollarSign className="rounded-full bg-red-500 w-4 h-4 text-white" />;
      default: return <DollarSign className="rounded-full p-4 bg-blue-500 w-4 h-4 text-white" />;
    }
  };
  return (
    <div 
      className={`p-3 mb-2 border-l-4 ${getNotificationColor(notification.type)}
       ${notification.read ? 'bg-gray-50' : 'bg-white'} 
       shadow-sm hover:shadow-md transition-shadow duration-150 rounded-r-md cursor-pointer`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex gap-2 justify-between items-center">
        <h4 className={`font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
        <div className="flex items-center gap-2">
      {notificationIcon(notification.type)}
      {notificationTitle(notification.type)}
    </div>
    </h4>
        {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
      </div>
      <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mt-1`}>{notification.message}</p>
      <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(notification.created_at || ''), options)}</p>
      {notification.link && (
        <Link to={notification.link} className="text-xs text-blue-500 hover:underline mt-1 inline-block">
          Ver detalles
        </Link>
      )}
    </div>
  );
};

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown si se hace clic afuera
  useEffect(() => {
    console.log("notifications",notifications)
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <BellAlert16Solid className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2">
            <span className="block h-full w-full rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                disabled={unreadCount === 0}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No tienes notificaciones.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto p-2">
              {notifications.map(notif => (
                <NotificationItem key={notif.id} notification={notif} onRead={markAsRead} />
              ))}
            </div>
          )}
          {notifications.length > 0 && (
             <div className="p-2 border-t text-center">
                <button 
                    onClick={clearNotifications} 
                    className="text-sm text-red-500 hover:underline"
                >
                    Limpiar todas
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 