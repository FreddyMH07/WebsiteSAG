import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from './Spinner';

interface Props {
  requiredRole: 'candidate' | 'admin';
  redirectTo: string;
}

export default function ProtectedRoute({ requiredRole, redirectTo }: Props) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) return <Navigate to={redirectTo} replace />;

  if (requiredRole === 'admin' && !['hr_admin', 'super_admin'].includes(profile.role)) {
    return <Navigate to="/hr/login" replace />;
  }

  if (requiredRole === 'candidate' && profile.role !== 'candidate') {
    return <Navigate to="/candidate/login" replace />;
  }

  return <Outlet />;
}
