import React, { useState, useEffect/*, useMemo*/ } from 'react';
import { Link } from 'react-router-dom';
// import { Button } from 'react-bootstrap';
// Comentado o eliminado: import { Row, Col, Card, /*ListGroup,*/ Alert, Badge } from 'react-bootstrap';
import apiService, { Prestamo } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import LoanRequestModal, { LoanRequestData } from '../components/LoanRequestModal';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

interface PrestamoConTotales extends Prestamo {
  totalPagadoCuotas: number;
  totalDeudaCuotas: number;
}

const LoansPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [prestamos, setPrestamos] = useState<PrestamoConTotales[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  // const [cuotasPagadas, setCuotasPagadas] = useState(0);
  // const [montoTotalPagado, setMontoTotalPagado] = useState(0);
  // const [montoTotalDeuda, setMontoTotalDeuda] = useState(0);

  useEffect(() => {
    const fetchPrestamos = async () => {
      if (!user || !user._id) return;
      
      try {
        setIsLoading(true);
        const data = await apiService.getPrestamosCliente(user._id);
        // setPrestamos(data);
        //console.log(data)
        const totals = data.reduce((acc, prestamo) => {
          const totalPagado = prestamo.payments.reduce((sum, pago) => 
            pago.status === 'paid' ? sum + pago.amount : sum, 0);
          const totalPendiente = prestamo.total_amount - totalPagado;
          
          acc[prestamo._id] = { ...prestamo, totalPagadoCuotas: totalPagado, totalDeudaCuotas: totalPendiente };
          return acc;
        }, {} as {[key: string]: PrestamoConTotales});
        
        //console.log(totals)
        setPrestamos(Object.values(totals).reverse());
        setError(null);
      } catch (err: any) {
        console.error('Error al obtener préstamos:', err);
        setError('No se pudieron cargar los préstamos. Intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrestamos();
  }, [user]);

  const handleLoanRequest = async (loanData: LoanRequestData) => {
    try {
      // Llamar a la API para crear la solicitud
      const response = await apiService.requestLoan(loanData);
      
      // Agregar el préstamo pendiente a la lista
      const newLoan: PrestamoConTotales = {
        ...response.prestamo,
        totalPagadoCuotas: 0,
        totalDeudaCuotas: loanData.amount
      };
      
      setPrestamos(prev => [newLoan, ...prev]);

      // Enviar notificación
      toast.success('Se ha enviado una solicitud para tu préstamo');

      // Emitir evento al socket
      socketService.emit('loan_request', {
        clientId: user?._id,
        loanData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al solicitar préstamo:', error);
      toast.error('Error al enviar la solicitud');
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Error</h3>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (prestamos.length === 0) {
    return (
      <div className="m-3 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md shadow-sm" role="alert">
        <p className="font-bold">Información</p>
        <p>No tiene préstamos registrados en el sistema.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getBadgeClasses = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'pagado':
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'en curso':
      case 'active':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'vencido':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'pendiente':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'incompleto':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'aprobado':
        return 'bg-teal-100 text-teal-700 border border-teal-300';
      case 'rechazado':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const translateLoanStatusToSpanish = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'En curso';
      case 'completed':
        return 'Completado';
      case 'paid':
        return 'Pagado';
      case 'pagado':
        return 'Pagado';
      case 'en curso':
        return 'En curso';
      case 'vencido':
        return 'Vencido';
      case 'pendiente':
      case 'pending':
        return 'Pendiente de Aprobación';
      case 'incompleto':
        return 'Incompleto';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return status || 'Desconocido';
    }
  };

  const getProgressBarBgClass = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'paid':
      case 'pagado':
      case 'completed':
        return 'bg-green-500';
      case 'en curso':
      case 'active':
        return 'bg-blue-500';
      case 'vencido':
      case 'expired':
        return 'bg-red-500';
      case 'incomplete':
      case 'incompleto':
        return 'bg-orange-500';
      case 'aprobado':
        return 'bg-teal-500';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const translatePaymentIntervalToSpanish = (interval: string) => {
    switch (interval) {
      case 'daily':
        return 'Diario';
      case 'fortnightly':
      case 'fortnight':
        return 'Quincenal';
      case 'monthly':
        return 'Mensual';
      case 'quarterly':
        return 'Trimestral';
      case 'semiannual':
        return 'Semestral';
      case 'yearly':
        return 'Anual';
      case 'weekly':
        return 'Semanal';
      case 'biweekly':
        return 'Bi-Semanal';
      case 'custom':
        return 'Irregular';
      default:
        return interval;
    }
  };

  const getProgressPercent = (prestamo: PrestamoConTotales) => {
    if (prestamo.total_amount === 0) return '0';
    return ((prestamo.totalPagadoCuotas / prestamo.total_amount) * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header con botón de solicitud */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Préstamos</h1>
            <p className="text-gray-600">Gestiona y solicita tus préstamos</p>
          </div>
          <button
            onClick={() => setShowLoanModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 mt-4 sm:mt-0"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Solicitar Préstamo
          </button>
        </div>

        {prestamos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes préstamos</h3>
            <p className="text-gray-600 mb-6">Comienza solicitando tu primer préstamo</p>
            <button
              onClick={() => setShowLoanModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Solicitar Préstamo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prestamos.map((prestamo) => (
              <div 
                key={prestamo._id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl ${
                  prestamo.status === 'pending' ? 'opacity-75' : ''
                }`}
              >
                {/* Overlay para préstamos pendientes */}
                {prestamo.status === 'pending' && (
                  <div className="inset-0 bg-yellow-100 bg-opacity-20 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Pendiente de Aprobación
                    </div>
                  </div>
                )}

                <div className="p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {formatCurrency(prestamo.amount)}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getBadgeClasses(prestamo.status)}`}>
                      {translateLoanStatusToSpanish(prestamo.status)}
                    </span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="bg-gray-200 rounded-full h-2.5 w-full">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarBgClass(prestamo.status)}`}
                        style={{ width: `${getProgressPercent(prestamo)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{formatCurrency(prestamo.totalPagadoCuotas)} pagado</span>
                      <span>{getProgressPercent(prestamo)}%</span>
                    </div>
                  </div>
                  
                  {/* Información del préstamo */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plazo:</span>
                      <span className="font-medium">{translatePaymentIntervalToSpanish(prestamo.payment_interval)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tasa:</span>
                      <span className="font-medium">{prestamo.interest_rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desembolso:</span>
                      <span className="font-medium">{formatDate(prestamo.loan_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cuotas:</span>
                      <span className="font-medium">
                        {prestamo.payments.filter(pago => pago.status === 'paid').length} / {prestamo.installment_number}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botón de acción */}
                  <Link 
                    to={`/loans/${prestamo._id}`} 
                    className={`block w-full text-center py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      prestamo.status === 'pending' 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {prestamo.status === 'pending' ? 'Pendiente' : 'Ver Detalle'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de solicitud de préstamo */}
      <LoanRequestModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onSubmit={handleLoanRequest}
      />
    </div>
  );
};

export default LoansPage; 