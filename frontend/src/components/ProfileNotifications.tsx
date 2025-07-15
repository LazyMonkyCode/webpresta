import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ProfileNotifications: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);

  useEffect(() => {
    // Mostrar solo las últimas 10 notificaciones
    setFilteredNotifications(notifications.slice(0, 10));
  }, [notifications]);

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const getNotificationIcon = (type: string) => {
    const iconConfig = {
      'payment_marked_as_paid': (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      'warning': (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      'error': (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'info': (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'admin_activity': (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'loan_created': (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };

    return iconConfig[type as keyof typeof iconConfig] || iconConfig.info;
  };

  const getNotificationBadge = (type: string) => {
    const badgeConfig = {
      'success': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-100 text-red-800 border-red-200',
      'info': 'bg-blue-100 text-blue-800 border-blue-200',
      'admin_activity': 'bg-purple-100 text-purple-800 border-purple-200',
      'loan_created': 'bg-green-100 text-green-800 border-green-200',
      'payment_marked_as_paid': 'bg-green-100 text-green-800 border-green-200',
      'payment_marked_as_overdue': 'bg-red-100 text-red-800 border-red-200'
    };

    return badgeConfig[type as keyof typeof badgeConfig] || badgeConfig.info;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Aquí podrías agregar navegación si hay un link
    if (notification.link) {
      // navigate(notification.link);
    }
  };

  const notificationTitle = (notification: any) => {
    if(notification.type === 'loan_request'){
      return 'Nuevo préstamo pendiente de aprobación: '+notification.data.clienteNombre;
    }
    if(notification.type === 'loan_request_approved'){
      return 'Préstamo aprobado: '+notification.data.clienteNombre;
    }
    if(notification.type === 'loan_request_rejected'){
      return 'Préstamo rechazado: '+notification.data.clienteNombre;
    }
    if(notification.type === 'payment_marked_as_paid'){ 
      return 'Pago marcado como pagado: '+notification.data.prestamoId+' - '+notification.data.prestamoLabel;
    }
    if(notification.type === 'payment_marked_as_overdue'){
      return 'Pago marcado como vencido: '+notification.data.prestamoId+' - '+notification.data.prestamoLabel;
    }
    return notification.message;
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
        <p className="text-gray-500">Aún no tienes notificaciones en tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notificaciones Recientes</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredNotifications.filter(n => !n.read).length} sin leer
          </span>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
              notification.read ? 'border-gray-200 opacity-75' : 'border-indigo-200 bg-indigo-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Icono */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {notification.timestamp ? formatDate(notification.timestamp) : ''}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getNotificationBadge(notification.type)}`}>
                        {notificationTitle(notification)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Datos adicionales para notificaciones de pago */}
                {notification.data && notification.type !== 'admin_activity' && (
                  <div className="bg-gray-50 rounded-md p-3 mt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Préstamo:</span>
                        <span className="ml-1 font-medium text-gray-900">{notification.data.loan_label}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Monto:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format(notification.data.payment_amount)}
                        </span>
                      </div>
                      {notification.data.incomplete_amount && (
                        <div>
                          <span className="text-gray-500">Pagado:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(notification.data.incomplete_amount)}
                          </span>
                        </div>
                      )}
                      {notification.data.payment_method && (
                        <div>
                          <span className="text-gray-500">Método:</span>
                          <span className="ml-1 font-medium text-gray-900">{notification.data.payment_method}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Mostrando las últimas {filteredNotifications.length} notificaciones
        </p>
      </div>
    </div>
  );
};

export default ProfileNotifications; 