import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/index';
import apiService from '../services/api';
import { updateUserProfileInSlice, Cliente } from '../store/slices/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';
import VerificationModal from '../components/VerificationModal';
import AddressAutocomplete from '../components/AddressAutocomplete';
import ProfileActivities from '../components/ProfileActivities';
import ProfileNotifications from '../components/ProfileNotifications';
import CommentsSection from '../components/CommentsSection';
import {
  setAppDomain, setInterestRate, setCurrency, setMinLoan, setMaxLoan, setNotificationsEnabled, setSupportEmail, setAppLogo, setMaintenanceMode, setDefaultLanguage, setAllowNewClients, setGraceDays, setLastBackup, setLastSync, setLastUpdateCheck
} from '../store/slices/settingsSlice';
import VerifyButton from '../components/Buttons/VerifyButton';
import notifications_types from '../helper/notifications';

import {
  UserIcon,
  EmailIcon,
  PhoneIcon,
  LocationIcon,
  BankIcon,
  SecurityIcon,
  SettingsIcon,
  CheckIcon,
  EditIcon,
  CloseIcon,
} from '../components/icons';


interface InfoFieldProps {
  icon: React.ReactNode;
    label: string;
    value: string;
    isVerified?: boolean;
    onVerify?: () => void;
    isEditing?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    children?: React.ReactNode;
  }



// Componente de badge verificado
const VerifiedBadge = () => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
    <CheckIcon />
    <span className="ml-1">Verificado</span>
  </span>
);


// Componente de campo de información
const InfoField = ({ 
  icon, 
  label, 
  value, 
  isVerified = false, 
  onVerify, 
  isEditing = false, 
  onChange, 
  name, 
  type = "text",
  placeholder = "",
  error = "",
  required = false,
  children
}: InfoFieldProps) => (
  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center">
        <p className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
        {isVerified ? <VerifiedBadge /> : onVerify && <VerifyButton onClick={onVerify} />}
      </div>
      {isEditing ? (
        <div>
          {children || (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-600 mt-1">{value || 'No especificado'}</p>
      )}
    </div>
  </div>
);

// Validaciones (ahora todos los campos son opcionales)
const validations = {
  name: (_value: string) => '',
  lastname: (_value: string) => '',
  email: (value: string) => {
    if (!value.trim()) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'El email no es válido';
    return '';
  },
  phone: (_value: string) => '',
  address: (_value: string) => '',
};

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'notifications' | 'activities' | 'advanced'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    cbu: '',
    aliasCbu: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para configuraciones
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados para verificación
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [verificationValue, setVerificationValue] = useState('');

  // Configuraciones de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    phoneNotifications: true,
    browserNotifications: true,
    paymentViewMode: 'table' as 'table' | 'list'
  });

  // Simulación de verificación (reemplaza por tus flags reales)
  const emailVerified = false;
  const phoneVerified = false;

  const settings = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        cbu: user.cbu || '',
        aliasCbu: user.aliasCbu || '',
      });
    }
  }, [user]);

  // Cargar configuraciones guardadas
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
      }
    }
  }, []);

  const validateField = (name: string, value: string) => {
    const validation = validations[name as keyof typeof validations];
    return validation ? validation(value) : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validar campo en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, address: value });
    
    // Validar dirección
    const error = validateField('address', value);
    setErrors(prev => ({
      ...prev,
      address: error
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar campos requeridos
    const requiredFields = ['name', 'lastname', 'email', 'phone', 'address'];
    requiredFields.forEach(field => {
      const fieldValue = formData[field as keyof typeof formData];
      const error = validateField(field, String(fieldValue || ''));
      if (error) newErrors[field] = error;
    });

    // Validar campos opcionales
    if (formData.cbu) {
      const error = validateField('cbu', formData.cbu);
      if (error) newErrors.cbu = error;
    }

    if (formData.aliasCbu) {
      const error = validateField('aliasCbu', formData.aliasCbu);
      if (error) newErrors.aliasCbu = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    const profileDataToUpdate: Partial<Omit<Cliente, 'id' | 'codigoAcceso' | 'nickname'>> = {};

    const editableKeys: Array<keyof typeof profileDataToUpdate> = [
      'name', 'lastname', 'email', 'phone', 'address', 'cbu', 'aliasCbu'
    ];

    editableKeys.forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        profileDataToUpdate[key] = formData[key] as any;
      }
    });

    try {
      const response = await apiService.updateProfile(profileDataToUpdate);
      
      toast.success(response.mensaje || 'Perfil actualizado con éxito');
      if (response.cliente) {
        dispatch(updateUserProfileInSlice(response.cliente as Cliente));
        //socketService.emit('update_client_profile', response.cliente);

        const data = notifications_types.update_profile

        data.message = data.message.replace('{name}', response.cliente.nickname || '');
        data.link = data.link.replace('{id}', response.cliente.sqlite_id);
        
        socketService.emit('new_notification', {
          ...data,
          from_client: response.cliente,
          to_user:"every_user",
          data: {
            ...response.cliente,
          }
        });
        const _response = await apiService.createClientActivity({
          action: 'profile_update',
          details: 'Actualizaste tu información personal',
          data: {
            ...response.cliente,
          }
        });
        console.log(_response);
      }
      setIsEditing(false);
      setErrors({});
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.mensaje || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Aquí deberías implementar la llamada a la API para cambiar contraseña
      // await apiService.changePassword(passwordData);
      toast.success('Contraseña actualizada con éxito');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    if (!formData.email) {
      toast.error('Primero debes ingresar un email válido');
      return;
    }
    setVerificationType('email');
    setVerificationValue(formData.email);
    setShowVerificationModal(true);
  };

  const handleVerifyPhone = () => {
    if (!formData.phone) {
      toast.error('Primero debes ingresar un teléfono válido');
      return;
    }
    setVerificationType('phone');
    setVerificationValue(formData.phone);
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = () => {
    // Aquí deberías actualizar el estado del usuario para reflejar la verificación
    toast.success(`${verificationType === 'email' ? 'Email' : 'Teléfono'} verificado exitosamente`);
  };

  const handleNotificationSettingChange = (setting: keyof typeof notificationSettings, value: boolean | string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    // Guardar en localStorage para persistencia
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...notificationSettings,
      [setting]: value
    }));

    // Mostrar notificación de cambio
    const settingNames = {
      emailNotifications: 'Notificaciones por email',
      phoneNotifications: 'Notificaciones por teléfono',
      browserNotifications: 'Notificaciones del navegador',
      paymentViewMode: 'Vista de pagos'
    };

    toast.success(`${settingNames[setting]} ${typeof value === 'boolean' ? (value ? 'activadas' : 'desactivadas') : 'cambiada'}`);
  };

  const handlePaymentViewModeChange = (mode: 'table' | 'list') => {
    handleNotificationSettingChange('paymentViewMode', mode);
  };

  // Detectar si el usuario tiene contraseña (user.hasPassword o user.password !== undefined)
  const hasPassword = !!user?.hasPassword;

  if (!user && loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return <p className="text-center p-4">Usuario no encontrado o no autenticado.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header con avatar */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 h-64">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
              <UserIcon />
            </div>
            <h1 className="text-3xl font-bold text-white break-words px-4">
              {user.username ? user.username : user.name ? `${user.name} ${user.lastname}` : 'Usuario'}
            </h1>
            <p className="text-indigo-100 mt-2 px-4">Administra tu perfil y configuraciones</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-8">
        {/* Tabs de navegación */}
        <div className="bg-white rounded-xl shadow-lg -mt-8 relative z-10">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <UserIcon />
                  <span className="ml-2">Información Personal</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="ml-2">Notificaciones</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="ml-2">Actividades</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <SettingsIcon />
                  <span className="ml-2">Configuraciones</span>
                </div>
              </button>
             {/*  <button
                onClick={() => setActiveTab('advanced')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advanced' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <SettingsIcon />
                  <span className="ml-2">Configuración Avanzada</span>
                </div>
              </button> */}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) {
                        setErrors({});
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isEditing ? <CloseIcon /> : <EditIcon />}
                    <span className="ml-2">{isEditing ? 'Cancelar' : 'Editar'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField
                        icon={<UserIcon />}
                        label="Nombre"
                        value={formData.name || ''}
                        isEditing={true}
                        onChange={handleChange}
                        name="name"
                        placeholder="Tu nombre"
                        error={errors.name}
                        required={true}
                      />
                      <InfoField
                        icon={<UserIcon />}
                        label="Apellido"
                        value={formData.lastname || ''}
                        isEditing={true}
                        onChange={handleChange}
                        name="lastname"
                        placeholder="Tu apellido"
                        error={errors.lastname}
                        required={true}
                      />
                    </div>

                    <InfoField
                      icon={<EmailIcon />}
                      label="Email"
                      value={formData.email || ''}
                      isVerified={emailVerified}
                      onVerify={!emailVerified ? handleVerifyEmail : undefined}
                      isEditing={true}
                      onChange={handleChange}
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      error={errors.email}
                      required={true}
                    />

                    <InfoField
                      icon={<PhoneIcon />}
                      label="Teléfono"
                      value={formData.phone || ''}
                      isVerified={phoneVerified}
                      onVerify={!phoneVerified ? handleVerifyPhone : undefined}
                      isEditing={true}
                      onChange={handleChange}
                      name="phone"
                      placeholder="+54 9 11 1234-5678"
                      error={errors.phone}
                      required={true}
                    />

                    <InfoField
                      icon={<LocationIcon />}
                      label="Dirección"
                      value={formData.address || ''}
                      isEditing={true}
                      error={errors.address}
                      required={true}
                    >
                      <AddressAutocomplete
                        value={formData.address || ''}
                        onChange={handleAddressChange}
                        placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                        error={errors.address}
                        required={true}
                      />
                    </InfoField>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <BankIcon />
                        <span className="ml-2">Información Bancaria</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                          icon={<BankIcon />}
                          label="CBU"
                          value={formData.cbu || ''}
                          isEditing={true}
                          onChange={handleChange}
                          name="cbu"
                          placeholder="22 dígitos"
                          error={errors.cbu}
                        />
                        <InfoField
                          icon={<BankIcon />}
                          label="Alias CBU"
                          value={formData.aliasCbu || ''}
                          isEditing={true}
                          onChange={handleChange}
                          name="aliasCbu"
                          placeholder="Tu alias"
                          error={errors.aliasCbu}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {loading ? <LoadingSpinner /> : <CheckIcon />}
                        <span className="ml-2">{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField
                        icon={<UserIcon />}
                        label="Nombre"
                        value={formData.name || ''}
                      />
                      <InfoField
                        icon={<UserIcon />}
                        label="Apellido"
                        value={formData.lastname || ''}
                      />
                    </div>

                    <InfoField
                      icon={<EmailIcon />}
                      label="Email"
                      value={formData.email || ''}
                      isVerified={emailVerified}
                      onVerify={!emailVerified ? handleVerifyEmail : undefined}
                    />

                    <InfoField
                      icon={<PhoneIcon />}
                      label="Teléfono"
                      value={formData.phone || ''}
                      isVerified={phoneVerified}
                      onVerify={!phoneVerified ? handleVerifyPhone : undefined}
                    />

                    <InfoField
                      icon={<LocationIcon />}
                      label="Dirección"
                      value={formData.address || ''}
                    />

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <BankIcon />
                        <span className="ml-2">Información Bancaria</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                          icon={<BankIcon />}
                          label="CBU"
                          value={formData.cbu || ''}
                        />
                        <InfoField
                          icon={<BankIcon />}
                          label="Alias CBU"
                          value={formData.aliasCbu || ''}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Configuraciones de Seguridad</h2>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                        <SecurityIcon />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Cambiar Contraseña</h3>
                        <p className="text-sm text-gray-500">Actualiza tu contraseña para mantener tu cuenta segura</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cambiar Contraseña
                    </button>
                  </div>

                  {showChangePassword && (
                    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <SecurityIcon />
                        <span className="ml-2">{hasPassword ? 'Cambiar Contraseña' : 'Establecer Contraseña'}</span>
                      </h3>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {hasPassword ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                              <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                                autoComplete="current-password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                              <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                minLength={6}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                                autoComplete="new-password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                minLength={6}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                                autoComplete="new-password"
                              />
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Establecer Contraseña</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              minLength={6}
                              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                              autoComplete="new-password"
                            />
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none"
                          >
                            {hasPassword ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <EmailIcon />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Verificación de Email</h3>
                      <p className="text-sm text-gray-500">
                        {emailVerified ? 'Tu email está verificado' : 'Verifica tu dirección de email para mayor seguridad'}
                      </p>
                    </div>
                    {!emailVerified && (
                      <button
                        onClick={handleVerifyEmail}
                        className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Verificar Email
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <PhoneIcon />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Verificación de Teléfono</h3>
                      <p className="text-sm text-gray-500">
                        {phoneVerified ? 'Tu teléfono está verificado' : 'Verifica tu número de teléfono para mayor seguridad'}
                      </p>
                    </div>
                    {!phoneVerified && (
                      <button
                        onClick={handleVerifyPhone}
                        className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Verificar Teléfono
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuraciones de Notificaciones */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Configuraciones de Notificaciones</h3>
                      <p className="text-sm text-gray-500">Personaliza cómo recibir notificaciones</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Notificaciones por Email */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <EmailIcon />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Notificaciones por Email</p>
                          <p className="text-sm text-gray-500">Recibe notificaciones en tu correo electrónico</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingChange('emailNotifications', !notificationSettings.emailNotifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          notificationSettings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Notificaciones por Teléfono */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <PhoneIcon />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Notificaciones por Teléfono</p>
                          <p className="text-sm text-gray-500">Recibe SMS y llamadas de notificación</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingChange('phoneNotifications', !notificationSettings.phoneNotifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          notificationSettings.phoneNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.phoneNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Notificaciones del Navegador */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Notificaciones del Navegador</p>
                          <p className="text-sm text-gray-500">Recibe notificaciones push en tu navegador</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingChange('browserNotifications', !notificationSettings.browserNotifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          notificationSettings.browserNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notificationSettings.browserNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Configuración de Vista de Pagos */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Vista de Pagos</h3>
                      <p className="text-sm text-gray-500">Elige cómo ver tus pagos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handlePaymentViewModeChange('table')}
                      className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                        notificationSettings.paymentViewMode === 'table'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Vista de Tabla</p>
                          <p className="text-sm text-gray-500">Formato tradicional en tabla</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePaymentViewModeChange('list')}
                      className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                        notificationSettings.paymentViewMode === 'list'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Vista de Lista</p>
                          <p className="text-sm text-gray-500">Formato moderno en tarjetas</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <ProfileNotifications />
            )}

            {activeTab === 'activities' && (
              <ProfileActivities />
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración Global de la App</h2>
                {/* Dominio y tasa de interés */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dominio de la App</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={settings.appDomain} onChange={e => dispatch(setAppDomain(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés (%)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={settings.interestRate} onChange={e => dispatch(setInterestRate(Number(e.target.value)))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={settings.currency} onChange={e => dispatch(setCurrency(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Préstamo Mínimo</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={settings.minLoan} onChange={e => dispatch(setMinLoan(Number(e.target.value)))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Préstamo Máximo</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={settings.maxLoan} onChange={e => dispatch(setMaxLoan(Number(e.target.value)))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de Soporte</label>
                    <input type="email" className="w-full border rounded px-3 py-2" value={settings.supportEmail} onChange={e => dispatch(setSupportEmail(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idioma Predeterminado</label>
                    <input type="text" className="w-full border rounded px-3 py-2" value={settings.defaultLanguage} onChange={e => dispatch(setDefaultLanguage(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={settings.notificationsEnabled} onChange={e => dispatch(setNotificationsEnabled(e.target.checked))} />
                    <span className="text-sm">Notificaciones Globales</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={settings.maintenanceMode} onChange={e => dispatch(setMaintenanceMode(e.target.checked))} />
                    <span className="text-sm">Modo Mantenimiento</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={settings.allowNewClients} onChange={e => dispatch(setAllowNewClients(e.target.checked))} />
                    <span className="text-sm">Permitir nuevos clientes</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días de Gracia</label>
                    <input type="number" className="w-full border rounded px-3 py-2" value={settings.graceDays} onChange={e => dispatch(setGraceDays(Number(e.target.value)))} />
                  </div>
                </div>
                {/* Acciones de base de datos */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Base de Datos</h3>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Importar Base de Datos</button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Exportar Base de Datos</button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Backup</button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Sincronizar</button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Buscar Actualizaciones</button>
                  </div>
                </div>
                {/* Logo de la app */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Logo de la App</h3>
                  <input type="file" className="mt-2" onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => dispatch(setAppLogo(ev.target?.result as string));
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                  {settings.appLogo && <img src={settings.appLogo} alt="Logo" className="h-16 mt-2" />}
                </div>
                {/* Sección de comentarios */}
                <CommentsSection />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de verificación */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type={verificationType}
        value={verificationValue}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default ProfilePage;