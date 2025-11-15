// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Контекст и защита
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { PrivateRoute } from './components/PrivateRoute';

// Страницы
import HomePage from './HomePage';
import Login from './pages/admin/Login'; // Убедись, что путь правильный
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddDevice from './pages/admin/AddDevice';
import AddRegion from './pages/admin/AddRegion';
import AddDeviceType from './pages/admin/AddDeviceType';
import History from './pages/admin/History';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Публичная страница логина */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Защищённые маршруты */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/history"
        element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        }
      />

      {/* Админка — доступ только для роли "admin" */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="devices" element={<AddDevice />} />
        <Route path="regions" element={<AddRegion />} />
        <Route path="device-types" element={<AddDeviceType />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Редирект по умолчанию */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
