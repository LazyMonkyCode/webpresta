import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRouteComponentFromFile from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoansPage from './pages/LoansPage';
import LoanDetailPage from './pages/LoanDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import NotFoundPage from './pages/NotFoundPage';
import Navigation from './components/Navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { RootState } from './store/index';

interface PrivateRouteProps {
  children: React.ReactNode;
}
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {

  const { isAuthenticated, isLoading,user } = useSelector((state: RootState) => state.auth);
  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
      <NotificationProvider>
        <AppContent />
        <ToastContainer />
      </NotificationProvider>
   
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading,user } = useSelector((state: RootState) => state.auth);

  const showNav = isAuthenticated && !isLoading;

  return (
    <>
      {showNav && <Navigation />}
      <div className={showNav ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={<PrivateRoute>{
            user?.role === "admin" ? <AdminPaymentsPage /> : <DashboardPage />
            }</PrivateRoute>} 
          />
          <Route 
            path="/profile"
            element={<PrivateRoute><ProfilePage /></PrivateRoute>}
          />
          <Route 
            path="/loans"
            element={<PrivateRoute><LoansPage /></PrivateRoute>}
          />
          <Route 
            path="/loans/:loanId"
            element={<PrivateRoute><LoanDetailPage /></PrivateRoute>}
          />
          <Route 
            path="/payments"
            element={<PrivateRoute><PaymentsPage /></PrivateRoute>}
          />
        {/*   <Route 
            path="/admin"
            element={<PrivateRoute><AdminPaymentsPage /></PrivateRoute>}
          />
          <Route 
            path="/activities"
            element={<PrivateRoute><ActivitiesPage /></PrivateRoute>}
          /> */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App; 