import { Outlet } from 'react-router';
import { AuthProvider } from '../../contexts/AuthContext';
import { Toaster } from 'sonner';

export function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
