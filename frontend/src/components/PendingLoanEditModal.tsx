import React, { useState } from 'react';

export interface PendingLoanEditData {
  amount: number;
  disbursementDate: string;
  purpose?: string;
  nickname?:string;
}

interface PendingLoanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PendingLoanEditData) => Promise<void>;
  initialData: PendingLoanEditData;
}

const PendingLoanEditModal: React.FC<PendingLoanEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<PendingLoanEditData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);

  React.useEffect(() => {
    setFormData(initialData);
    setErrors({});
    setSuccessMsg(null);
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.amount < 10000) {
      newErrors.amount = 'El monto mínimo es $10,000';
    } else if (formData.amount > 10000000) {
      newErrors.amount = 'El monto máximo es $10,000,000';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      await onSubmit(formData);
      setSuccessMsg('Préstamo actualizado correctamente');
      onClose();
    } catch (err) {
      setErrors({ general: 'Error al actualizar el préstamo' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Editar Préstamo Pendiente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min={10000}
              max={10000000}
              step={1000}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.amount ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="50,000"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>
          <div>
            <label htmlFor="disbursementDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Desembolso *</label>
            <input
              type="date"
              id="disbursementDate"
              name="disbursementDate"
              value={formData.disbursementDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.disbursementDate ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.disbursementDate && <p className="mt-1 text-sm text-red-600">{errors.disbursementDate}</p>}
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
          {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
          {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PendingLoanEditModal; 