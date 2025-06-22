import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithCode, loginWithCredentials, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import axios from 'axios';

interface FormErrors {
  email?: string;
  password?: string;
  codigoAcceso?: string;
}

const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'code' | 'credentials'>('code');
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string|null>(null);
  const [forgotError, setForgotError] = useState<string|null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Limpiar errores cuando cambia el método de autenticación
    setErrors({});
    dispatch(clearError());
  }, [authMethod, dispatch]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (authMethod === 'code') {
      if (!codigoAcceso.trim()) {
        newErrors.codigoAcceso = 'El código de acceso es requerido';
      } else if (codigoAcceso.trim().length < 3) {
        newErrors.codigoAcceso = 'El código de acceso debe tener al menos 3 caracteres';
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'El email no es válido';
      }

      if (!password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    
    e.preventDefault();
    
    console.log("asdasdasdasdasdasdasdo");

    console.log("authMethod",authMethod);

    if (!validateForm()) {
      return;
    }
    
    console.log("authMethod",authMethod);
    try {
      if (authMethod === 'code') {
        await dispatch(loginWithCode({ codigoAcceso })).unwrap();
      } else {

        console.log("email",email);
        console.log("password",password);
        await dispatch(loginWithCredentials({ username: email, password })).unwrap();
      }
    } catch (error) {
      console.error('Error en el login:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (field === 'codigoAcceso') setCodigoAcceso(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  const handleForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotError(null);
    if (!forgotEmail.trim() || !forgotCode.trim() || !forgotPassword.trim()) {
      setForgotError('Todos los campos son obligatorios');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('El email no es válido');
      return;
    }
    if (forgotPassword.length < 6) {
      setForgotError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setForgotLoading(true);
    try {
      await axios.post('/api/auth/set-password-email', {
        email: forgotEmail,
        codigoAcceso: forgotCode,
        password: forgotPassword
      });
      setForgotMsg('¡Contraseña actualizada! Ya puedes iniciar sesión.');
      setForgotEmail('');
      setForgotCode('');
      setForgotPassword('');
    } catch (err: any) {
      setForgotError(err.response?.data?.mensaje || 'Error al actualizar la contraseña');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PrestaWeb</h1>
          <p className="text-gray-600">Sistema de Gestión de Préstamos</p>
        </div>
        
        {/* Card principal */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">Iniciar Sesión</h2>
          
          {/* Toggle de método de autenticación */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMethod('code')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                authMethod === 'code'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Código de Acceso
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('credentials')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                authMethod === 'credentials'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email y Contraseña
            </button>
          </div>
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{error}</span>
              <button 
                onClick={() => dispatch(clearError())} 
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {!showForgot ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {authMethod === 'code' ? (
                  /* Formulario con código de acceso */
                  <div>
                    <label htmlFor="codigoAcceso" className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Acceso
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="codigoAcceso"
                        placeholder="Ingrese su código de acceso"
                        value={codigoAcceso}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('codigoAcceso', e.target.value)}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.codigoAcceso ? 'border-red-300' : 'border-gray-300'
                        } ${isLoading ? 'bg-gray-50' : 'bg-white'}`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                    </div>
                    {errors.codigoAcceso && (
                      <p className="mt-1 text-sm text-red-600">{errors.codigoAcceso}</p>
                    )}
                  </div>
                ) : (
                  /* Formulario con email y contraseña */
                  <>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          placeholder="Ingrese su email"
                          value={email}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                          disabled={isLoading}
                          className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } ${isLoading ? 'bg-gray-50' : 'bg-white'}`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          placeholder="Ingrese su contraseña"
                          value={password}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
                          className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                          } ${isLoading ? 'bg-gray-50' : 'bg-white'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                  </>
                )}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline focus:outline-none"
                  onClick={() => setShowForgot(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-2 text-center">Recuperar Contraseña</h3>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={forgotLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Acceso</label>
                  <input
                    type="text"
                    value={forgotCode}
                    onChange={e => setForgotCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={forgotLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={forgotPassword}
                    onChange={e => setForgotPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={forgotLoading}
                  />
                </div>
                {forgotError && <p className="text-red-600 text-sm">{forgotError}</p>}
                {forgotMsg && <p className="text-green-600 text-sm">{forgotMsg}</p>}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:underline"
                    onClick={() => { setShowForgot(false); setForgotMsg(null); setForgotError(null); }}
                  >
                    Volver al login
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {authMethod === 'code' 
              ? 'Si olvidó su código de acceso, contacte al administrador.'
              : '¿No tiene cuenta? Contacte al administrador para registrarse.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 