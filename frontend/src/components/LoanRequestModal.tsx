import React, { useState } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

interface LoanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (loanData: LoanRequestData) => void;
}

export interface LoanRequestData {
  amount: number;
  installments: number;
  disbursementDate: string;
}

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<LoanRequestData>({
    amount: 0,
    installments: 12,
    disbursementDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar monto
    if (formData.amount < 10000) {
      newErrors.amount = 'El monto mínimo es $10,000';
    } else if (formData.amount > 10000000) {
      newErrors.amount = 'El monto máximo es $10,000,000';
    }

    // Validar número de cuotas
    if (formData.installments < 1) {
      newErrors.installments = 'Debe tener al menos 1 cuota';
    } else if (formData.installments > 60) {
      newErrors.installments = 'Máximo 60 cuotas';
    }

    // Validar fecha de desembolso
    const selectedDate = new Date(formData.disbursementDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.disbursementDate = 'La fecha de desembolso no puede ser anterior a hoy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success('Solicitud de préstamo enviada exitosamente');
      onClose();
      setFormData({
        amount: 0,
        installments: 12,
        disbursementDate: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'installments' ? Number(value) : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Solicitar Nuevo Préstamo
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto del Préstamo *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                min="10000"
                max="10000000"
                step="1000"
                className={`block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="50,000"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Monto mínimo: $10,000 | Monto máximo: $10,000,000
            </p>
          </div>

          <div>
            <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cuotas *
            </label>
            <input
              type="number"
              id="installments"
              name="installments"
              value={formData.installments}
              onChange={handleChange}
              min="1"
              max="60"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.installments ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="12"
            />
            {errors.installments && (
              <p className="mt-1 text-sm text-red-600">{errors.installments}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo: 1 cuota | Máximo: 60 cuotas
            </p>
          </div>

          <div>
            <label htmlFor="disbursementDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Desembolso *
            </label>
            <input
              type="date"
              id="disbursementDate"
              name="disbursementDate"
              value={formData.disbursementDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.disbursementDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.disbursementDate && (
              <p className="mt-1 text-sm text-red-600">{errors.disbursementDate}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Información del Préstamo</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Monto:</strong> ${formData.amount.toLocaleString()}</p>
              <p><strong>Cuotas:</strong> {formData.installments}</p>
              <p><strong>Cuota estimada:</strong> ${formData.amount > 0 ? Math.round(formData.amount / formData.installments).toLocaleString() : 0}</p>
              <p><strong>Desembolso:</strong> {new Date(formData.disbursementDate).toLocaleDateString('es-CO')}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
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
                  <span className="ml-2">Enviando...</span>
                </>
              ) : (
                'Solicitar Préstamo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestModal; 