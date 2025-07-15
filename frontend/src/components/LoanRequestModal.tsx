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
  disbursementDate: string;
  purpose?: string;
  installments?: number;
}

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<LoanRequestData>({
    amount: 0,
    disbursementDate: new Date().toISOString().split('T')[0],
    purpose: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.amount < 10000) {
      newErrors.amount = 'El monto mínimo es $10,000';
    } else if (formData.amount > 10000000) {
      newErrors.amount = 'El monto máximo es $10,000,000';
    }
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
      console.log("formData",formData)
      await onSubmit(formData);
      toast.success('Solicitud de préstamo enviada exitosamente');
      onClose();
      setFormData({
        amount: 0,
        disbursementDate: new Date().toISOString().split('T')[0],
        purpose: ''
      });
      setErrors({});
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
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
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">Propósito (opcional)</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose || ''}
              onChange={handleChange}
              rows={2}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
              placeholder="¿Para qué necesitas el préstamo?"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Solicitar Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestModal; 