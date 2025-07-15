import React, { useState, useEffect/*, useMemo*/ } from 'react';
import { Link } from 'react-router-dom';
// import { Button } from 'react-bootstrap';
// Comentado o eliminado: import { Row, Col, Card, /*ListGroup,*/ Alert, Badge } from 'react-bootstrap';
import apiService, { Prestamo} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import LoanRequestModal, { LoanRequestData } from '../components/LoanRequestModal';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import PendingLoanEditModal, { PendingLoanEditData } from '../components/PendingLoanEditModal';
import notifications_types from '../helper/notifications';

interface PrestamoConTotales extends Prestamo {
  totalPagadoCuotas: number;
  totalDeudaCuotas: number;
  purpose?: string;
  proposito?: string;
  sqlite_id?: number;
 
  
}

interface Cliente {
  nickname: string;
  _id: string;
}

type TabType = 'active' | 'pending';

const LoansPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [prestamos, setPrestamos] = useState<PrestamoConTotales[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editPendingLoan, setEditPendingLoan] = useState<PrestamoConTotales | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [deletePendingLoan, setDeletePendingLoan] = useState<PrestamoConTotales | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  // const [cuotasPagadas, setCuotasPagadas] = useState(0);
  // const [montoTotalPagado, setMontoTotalPagado] = useState(0);
  // const [montoTotalDeuda, setMontoTotalDeuda] = useState(0);

  // Filtrar préstamos según la pestaña activa
  const activeLoans = prestamos.filter(prestamo => 
    prestamo.status !== 'pending' && prestamo.status !== 'rejected'
  );
  
  const pendingLoans = prestamos.filter(prestamo => 
    prestamo.status === 'pending'
  );

  const currentLoans = activeTab === 'active' ? activeLoans : pendingLoans;

  useEffect(() => {

    console.log("deletePendingLoan",deletePendingLoan)
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
      const response = await apiService.requestLoan({
        amount: loanData.amount,
        disbursementDate: loanData.disbursementDate,
        proposito: loanData.purpose || '',
        installments: loanData.installments || 0
      });
      // Agregar el préstamo pendiente a la lista
      const newLoan: PrestamoConTotales = {
        ...response.prestamo,
        totalPagadoCuotas: 0,
        totalDeudaCuotas: loanData.amount
      };
      setPrestamos(prev => [newLoan, ...prev]);
      toast.success('Se ha enviado una solicitud para tu préstamo');
      console.log(user)
       socketService.emit('loan_request', {
        clientId: user?._id,
        loanData,
        timestamp: new Date().toISOString()
      }); 

      socketService.emit('new_notification', {
        message: notifications_types.loan_request.message.replace('{name}', user?.name || ''),
        link: notifications_types.loan_request.link.replace('{id}', user?._id || ''),
        type: notifications_types.loan_request.type,
        to_user:"every_user",
        data: {
          ...response.prestamo,
          cliente: response.cliente
        }
        
      });


      apiService.createClientActivity({
        action: 'pending_loan_request',
        details: 'Has enviado una solicitud para tu préstamo de $' + loanData.amount ,
        data: {
          ...response.prestamo,
          cliente: response.cliente
        }
      });


       
    } catch (error) {
      console.error('Error al solicitar préstamo:', error);
      toast.error('Error al enviar la solicitud');
      throw error;
    }
  }; 

  // Handler para actualizar préstamo pendiente
  const handleUpdatePendingLoan = async (data: PendingLoanEditData) => {
    if (!editPendingLoan) return;
    try {
      // Llamar a la API para actualizar el préstamo pendiente
      const updated = await apiService.updatePendingLoan(editPendingLoan._id, data);
      setPrestamos(prev => prev.map(p => p._id === editPendingLoan._id ? { ...p, ...updated } : p));

      // Crear actividad del cliente
      apiService.createClientActivity({
        action: 'pending_loan_update',
        details: 'Has actualizado tu solicitud de préstamo de $' + data.amount,
        data: {
          ...updated,
          cliente: updated.cliente
        }
      });
      setEditPendingLoan(null);
      toast.success('Préstamo pendiente actualizado');
    } catch (err) {
      toast.error('Error al actualizar el préstamo');
      throw err;
    }
  };

  // Handler para eliminar préstamo pendiente
  const handleDeletePendingLoan = async () => {
    if (!deletePendingLoan) return;
    try {
      // Llamar a la API para eliminar el préstamo pendiente
      await apiService.deleteLoan(deletePendingLoan._id);
      setPrestamos(prev => prev.filter(p => p._id !== deletePendingLoan._id));
      setDeletePendingLoan(null);
      toast.success('Préstamo pendiente eliminado correctamente');
      
      /* socketService.emit('new_notification', {
        message: notifications_types.pending_loan_deleted.message.replace('{name}', deletePendingLoan.cliente?.nickname || ''),
        link: notifications_types.pending_loan_deleted.link.replace('{id}', deletePendingLoan.sqlite_id?.toString() || ''),
        type: notifications_types.pending_loan_deleted.type,
        to_user:"every_user",
        data: {
          ...deletePendingLoan,
          cliente: deletePendingLoan.cliente
        }  
      });
 */
      // Crear actividad del cliente
      apiService.createClientActivity({
        action: 'pending_loan_deleted',
        details: 'Has eliminado tu solicitud de préstamo de $' + deletePendingLoan.amount,
        data: {
          loanId: deletePendingLoan._id,
          sqlite_id: deletePendingLoan.sqlite_id,
          amount: deletePendingLoan.amount,
          cliente: deletePendingLoan.cliente
        }
      });
    } catch (err: any) {
      console.error('Error al eliminar préstamo:', err);
      toast.error(err.response?.data?.mensaje || 'Error al eliminar el préstamo');
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

/*   if (prestamos.length === 0) {
    return (
      <div className="m-3 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md shadow-sm" role="alert">
        <p className="font-bold">Información</p>
        <p>No tiene préstamos registrados en el sistema.</p>
      </div>
    );
  } */

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

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'active'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Préstamos Activos</span>
                  {activeLoans.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {activeLoans.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Préstamos Pendientes</span>
                  {pendingLoans.length > 0 && (
                    <span className="bg-yellow-100 text-yellow-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {pendingLoans.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
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
        ) : currentLoans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              activeTab === 'active' ? 'bg-indigo-100' : 'bg-yellow-100'
            }`}>
              <svg className={`w-8 h-8 ${
                activeTab === 'active' ? 'text-indigo-600' : 'text-yellow-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'active' ? 'No tienes préstamos activos' : 'No tienes préstamos pendientes'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' 
                ? 'Todos tus préstamos están pendientes de aprobación o no tienes préstamos aún'
                : 'No tienes solicitudes de préstamo pendientes'
              }
            </p>
            {activeTab === 'pending' && (
              <button
                onClick={() => setShowLoanModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Solicitar Préstamo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLoans.map((prestamo) => (
              <div 
                key={prestamo._id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl relative ${
                  prestamo.status === 'pending' ? 'opacity-75' : ''
                }`}
                style={{ cursor: 'default' }}
              >
                {/* Overlay para préstamos pendientes */}
                {prestamo.status === 'pending' && (
              <div className="absolute inset-0 bg-yellow-100 bg-opacity-20 z-10 flex items-center justify-center pointer-events-none">
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
                  {prestamo.status === 'pending' ? (
                    <div className="space-y-2 mt-4">
                      <button
                        type="button"
                        className="block w-full text-center py-2 px-4 rounded-lg font-semibold transition-all duration-200 bg-yellow-200 text-yellow-800 cursor-pointer border border-yellow-400 hover:bg-yellow-300"
                        onClick={() => setEditPendingLoan(prestamo)}
                      >
                        Editar Solicitud
                      </button>
                      <button
                        type="button"
                        className="block w-full text-center py-2 px-4 rounded-lg font-semibold transition-all duration-200 bg-red-100 text-red-700 cursor-pointer border border-red-300 hover:bg-red-200"
                        onClick={() => {
                          /* (prestamo.cliente|| */
                          setCliente(null)
                          setDeletePendingLoan(prestamo)
                        }}
                      >
                        Eliminar Solicitud
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to={`/loans/${prestamo._id}`} 
                      className="block w-full text-center py-2 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 mt-4"
                    >
                      Ver Detalle
                    </Link>
                  )}
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
      {/* Modal de edición de préstamo pendiente */}
      <PendingLoanEditModal
        isOpen={!!editPendingLoan}
        onClose={() => setEditPendingLoan(null)}
        onSubmit={handleUpdatePendingLoan}
        initialData={editPendingLoan ? {
          amount: editPendingLoan.amount,
          disbursementDate: editPendingLoan.loan_date.split('T')[0],
          purpose: editPendingLoan.purpose || ''
        } : { amount: 0, disbursementDate: '', purpose: '' }}
      />

      {/* Modal de confirmación para eliminar préstamo pendiente */}
      {deletePendingLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              ¿Eliminar solicitud de préstamo?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              ¿Estás seguro de que quieres eliminar tu solicitud de préstamo por{' '}
              <span className="font-semibold">{formatCurrency(deletePendingLoan.amount)}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeletePendingLoan(null)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePendingLoan}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansPage; 