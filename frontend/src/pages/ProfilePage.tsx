import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import apiService from '../services/api';
import { useDispatch } from 'react-redux';
import { updateUserProfileInSlice, Cliente } from '../store/slices/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';
import VerificationModal from '../components/VerificationModal';
import AddressAutocomplete from '../components/AddressAutocomplete';
import ProfileActivities from '../components/ProfileActivities';
import ProfileNotifications from '../components/ProfileNotifications';

// Iconos SVG como componentes
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BankIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Componente de badge verificado
const VerifiedBadge = () => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
    <CheckIcon />
    <span className="ml-1">Verificado</span>
  </span>
);

// Componente de botón de verificación
const VerifyButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors ml-2"
  >
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    Verificar
  </button>
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
}: {
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
}) => (
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

// Validaciones
const validations = {
  name: (value: string) => {
    if (!value.trim()) return 'El nombre es requerido';
    if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras';
    return '';
  },
  lastname: (value: string) => {
    if (!value.trim()) return 'El apellido es requerido';
    if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido solo puede contener letras';
    return '';
  },
  email: (value: string) => {
    if (!value.trim()) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'El email no es válido';
    return '';
  },
  phone: (value: string) => {
    if (!value.trim()) return 'El teléfono es requerido';
    const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(value)) return 'Ingresa un teléfono válido';
    if (value.replace(/\D/g, '').length < 10) return 'El teléfono debe tener al menos 10 dígitos';
    return '';
  },
  address: (value: string) => {
    if (!value.trim()) return 'La dirección es requerida';
    if (value.length < 10) return 'La dirección debe tener al menos 10 caracteres';
    
    // Validar que tenga al menos una calle y un número
    const addressParts = value.trim().split(/\s+/);
    if (addressParts.length < 2) {
      return 'La dirección debe incluir nombre de calle y número';
    }

    // Buscar un número en la dirección (3-5 dígitos)
    const numberPattern = /\b\d{3,5}\b/;
    const hasNumber = numberPattern.test(value);

    if (!hasNumber) {
      return 'La dirección debe incluir un número de 3 a 5 dígitos';
    }

    return '';
  },
  cbu: (value: string) => {
    if (!value.trim()) return '';
    if (!/^\d{22}$/.test(value.replace(/\D/g, ''))) return 'El CBU debe tener exactamente 22 dígitos';
    return '';
  },
  aliasCbu: (value: string) => {
    if (!value.trim()) return '';
    if (value.length < 3) return 'El alias debe tener al menos 3 caracteres';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'El alias solo puede contener letras y números';
    return '';
  }
};

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'notifications' | 'activities'>('info');
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
        socketService.emit('update_client_profile', response.cliente);
      }
      setIsEditing(false);
      setErrors({});
    } catch (err: any) {
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
                    <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Contraseña Actual
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {loading ? <LoadingSpinner /> : <CheckIcon />}
                          <span className="ml-2">{loading ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                        </button>
                      </div>
                    </form>
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