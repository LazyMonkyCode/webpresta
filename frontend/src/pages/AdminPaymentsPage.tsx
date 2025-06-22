import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import apiService, { Pago } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { format, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentSummary {
  totalPayments: number;
  payments?: Pago[];
  date?: string;
  paidPayments: number;
  pendingPayments: number;
  incompletePayments: number;
  expiredPayments: number;
  paidAmount: number;
  pendingAmount: number;
  incompleteAmount: number;
  totalAmount: number;
}

interface AdminPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Pago | null;
  onPaymentUpdate: (paymentId: string, status: string, amount?: number, method?: string) => void;
}

const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onPaymentUpdate
}) => {

  const [status, setStatus] = useState<string>('paid');
  const [incompleteAmount, setIncompleteAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payment) {
      setStatus(payment.status);
      setIncompleteAmount(payment.incomplete_amount || 0);
      setPaymentMethod(payment.payment_method || 'cash');
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setLoading(true);
    try {
      await onPaymentUpdate(
        payment._id,
        status,
        status === 'incomplete' ? incompleteAmount : undefined,
        paymentMethod
      );
      toast.success('Pago actualizado exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !payment) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestionar Pago
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Información del Pago</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Cliente:</strong> {payment.cliente}</p>
              <p><strong>Préstamo:</strong> {payment.prestamoLabel}</p>
              <p><strong>Cuota:</strong> {payment.installment_number}</p>
              <p><strong>Monto:</strong> {formatCurrency(payment.amount)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Pago
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="incomplete">Incompleto</option>
            </select>
          </div>

          {status === 'incomplete' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Pagado
              </label>
              <input
                type="number"
                value={incompleteAmount}
                onChange={(e) => setIncompleteAmount(Number(e.target.value))}
                min="0"
                max={payment.amount}
                step="1000"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Falta por pagar: {formatCurrency(payment.amount - incompleteAmount)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="mercado_pago">Mercado Pago</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Actualizando...</span>
                </>
              ) : (
                'Actualizar Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPaymentsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalPayments: 0,
    payments: [],
    paidPayments: 0,
    pendingPayments: 0,
    incompletePayments: 0,
    expiredPayments: 0,
    paidAmount: 0,
    pendingAmount: 0,
    incompleteAmount: 0,
    totalAmount: 0,
  });

  const fetchPayments = useCallback(async () => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.getAdminPayments(dateString);
      setPayments(response.payments || []);
      setPaymentSummary({
        totalPayments: response.payments.length,
        paidPayments: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'paid' ? 1 : 0), 0),
        pendingPayments: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'pending' ? 1 : 0), 0),
        expiredPayments: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'expired' ? 1 : 0), 0),
        incompletePayments: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'incomplete' ? 1 : 0), 0),
        totalAmount: response.payments.reduce((acc: number, p: Pago) => acc + p.amount, 0),
        paidAmount: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'paid' ? p.amount : 0), 0),
        pendingAmount: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'pending' ? p.amount : 0), 0),
        incompleteAmount: response.payments.reduce((acc: number, p: Pago) => acc + (p.status === 'incomplete' ? p.amount : 0), 0)
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePaymentUpdate = async (paymentId: string, status: string, amount?: number, method?: string) => {
    try {
      await apiService.updateAdminPayment(paymentId, {
        status,
        incomplete_amount: amount,
        payment_method: method
      });
      
      // Actualizar la lista local con tipos correctos
      setPayments(prev => prev.map(p => 
        p._id === paymentId 
          ? { 
              ...p, 
              status, 
              incomplete_amount: amount, 
              payment_method: method || p.payment_method 
            }
          : p
      ));
      
      // Recargar para actualizar el resumen
      await fetchPayments();
    } catch (error) {
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'paid': { label: 'Pagado', classes: 'bg-green-100 text-green-800' },
      'expired': { label: 'Expirado', classes: 'bg-red-100 text-red-800' },
      'pending': { label: 'Pendiente', classes: 'bg-yellow-100 text-blue-800' },
      'incomplete': { label: 'Incompleto', classes: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, classes: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pagos</h1>
          <p className="text-gray-600">Administra los pagos del día seleccionado</p>
        </div>

        {/* Selector de fecha */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Fecha
              </label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {isToday(selectedDate) ? 'Hoy' : format(selectedDate, 'EEEE, d \'de\' MMMM', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pagos</p>
                <p className="text-2xl font-semibold text-gray-900">{paymentSummary.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pagado</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(paymentSummary.paidAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendiente</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(paymentSummary.pendingAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Incompleto</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(paymentSummary.incompleteAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pagos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pagos del Día</h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No hay pagos programados para esta fecha.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Préstamo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.cliente}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.prestamoLabel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.installment_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.status === 'incomplete' && payment.incomplete_amount && (
                          <div className="text-xs text-orange-600">
                            Pagado: {formatCurrency(payment.incomplete_amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de gestión de pago */}
      <AdminPaymentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onPaymentUpdate={handlePaymentUpdate}
      />
    </div>
  );
};

export default AdminPaymentsPage; 