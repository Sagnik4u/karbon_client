import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupView from './pages/GroupView';
import TargetCursor from './components/TargetCursor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const guestMode = localStorage.getItem('guestMode');

  if (!token && !guestMode) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased dark">
      <TargetCursor
        targetSelector="button, a, input, [role='button']"
        spinDuration={2}
        hoverDuration={0.3}
        hideDefaultCursor={true}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              <GroupView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
