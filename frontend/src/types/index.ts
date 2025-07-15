export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admin_activity' | 'loan_created' | 'loan_approved' | 'loan_rejected' | 'loan_paid' | 'loan_overdue' | 'loan_cancelled' | 'loan_expired' | 'loan_renewed';
  title: string;
  message: string;
  timestamp: string; // Usaremos string para simplificar, se puede convertir a Date si es necesario
  read: boolean;
  link?: string; // Opcional: para redirigir al hacer clic
  data?: any; // Para datos adicionales como los de actividad de admin
  created_at?: string;
}

export interface User {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  role: 'admin' | 'collector' | 'user';
  sqlite_id?: string;
  // Propiedades opcionales que pueden existir en Cliente
  nickname?: string;
  phone?: string;
  address?: string;
  cbu?: string;
  aliasCbu?: string;
  codigoAcceso?: string;
}

export interface Activity {
  _id: string;
  admin_id: {
    _id: string;
    name: string;
    lastname: string;
    role: string;
  };
  admin_name: string;
  admin_role: string;
  action: string;
  payment_id: string;
  payment_sqlite_id: number;
  client_sqlite_id: number;
  client_name: string;
  loan_label: string;
  payment_amount: number;
  previous_status: string;
  new_status: string;
  payment_method?: string;
  incomplete_amount?: number;
  details: string;
  timestamp: string;
}

// Puedes añadir otras interfaces globales aquí si es necesario 