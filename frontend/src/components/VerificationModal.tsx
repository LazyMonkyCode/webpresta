import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'email' | 'phone';
  value: string;
  onVerificationSuccess: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  type,
  value,
  onVerificationSuccess
}) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60); // 60 segundos de espera
      setCanResend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Solo permitir un dígito
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente campo
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 5) {
      toast.error('Por favor ingresa el código completo de 5 dígitos');
      return;
    }

    setLoading(true);
    try {
      // Aquí deberías implementar la llamada a la API para verificar el código
      // await apiService.verifyCode(type, value, verificationCode);
      
      // Simulación de verificación exitosa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${type === 'email' ? 'Email' : 'Teléfono'} verificado exitosamente`);
      onVerificationSuccess();
      onClose();
      setCode(['', '', '', '', '']);
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'Código inválido. Intenta nuevamente');
      setCode(['', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      // Aquí deberías implementar la llamada a la API para reenviar el código
      // await apiService.resendVerificationCode(type, value);
      
      // Simulación de reenvío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Código reenviado a tu ${type === 'email' ? 'email' : 'teléfono'}`);
      setTimeLeft(60);
      setCanResend(false);
      setCode(['', '', '', '', '']);
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Verificar {type === 'email' ? 'Email' : 'Teléfono'}
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
          <p className="text-gray-600 mb-2">
            Hemos enviado un código de verificación de 5 dígitos a:
          </p>
          <p className="font-medium text-gray-900">{value}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ingresa el código de verificación:
            </label>
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg font-semibold"
                  placeholder="0"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading || code.join('').length !== 5}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Verificando...</span>
                </div>
              ) : (
                'Verificar Código'
              )}
            </button>

            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-500">
                  Reenviar código en {timeLeft} segundos
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || !canResend}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reenviar código
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Si no recibiste el código, verifica que el {type === 'email' ? 'email' : 'teléfono'} sea correcto
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal; 