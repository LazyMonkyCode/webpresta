import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity } from '../types';

const ProfileActivities: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getAdminActivities(user._id);
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // No mostrar toast de error para no molestar al usuario
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      'payment_marked_paid': { label: 'Pagado', classes: 'bg-green-100 text-green-800 border-green-200' },
      'payment_marked_pending': { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'payment_marked_incomplete': { label: 'Incompleto', classes: 'bg-orange-100 text-orange-800 border-orange-200' },
      'payment_updated': { label: 'Actualizado', classes: 'bg-blue-100 text-blue-800 border-blue-200' }
    };

    const config = actionConfig[action as keyof typeof actionConfig] || { 
      label: action, 
      classes: 'bg-gray-100 text-gray-800 border-gray-200' 
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const getActionIcon = (action: string) => {
    const iconConfig = {
      'payment_marked_paid': (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      'payment_marked_pending': (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'payment_marked_incomplete': (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      'payment_updated': (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };

    return iconConfig[action as keyof typeof iconConfig] || (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const handleViewAllActivities = () => {
    navigate('/activities');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades recientes</h3>
        <p className="text-gray-500 mb-4">Aún no se han registrado actividades en tu cuenta.</p>
        <button
          onClick={handleViewAllActivities}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ver todas las actividades
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con botón para ver todas */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Actividades Recientes</h3>
        <button
          onClick={handleViewAllActivities}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ver todas
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Lista de actividades */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start space-x-3">
              {/* Icono de la acción */}
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(activity.action)}
              </div>

              {/* Contenido principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.details}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)}
                      </span>
                      {getActionBadge(activity.action)}
                    </div>
                  </div>
                </div>

                {/* Detalles del pago */}
                <div className="bg-gray-50 rounded-md p-3 mt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Cliente:</span>
                      <span className="ml-1 font-medium text-gray-900">{activity.client_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Préstamo:</span>
                      <span className="ml-1 font-medium text-gray-900">{activity.loan_label}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Monto:</span>
                      <span className="ml-1 font-medium text-gray-900">{formatCurrency(activity.payment_amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {activity.previous_status} → {activity.new_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con enlace a todas las actividades */}
      <div className="text-center pt-4 border-t border-gray-200">
        <button
          onClick={handleViewAllActivities}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Ver historial completo de actividades →
        </button>
      </div>
    </div>
  );
};

export default ProfileActivities; 