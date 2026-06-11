import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { LangProvider } from '@/hooks/useLang';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AntiFraudPopup from '@/components/common/AntiFraudPopup';

// Public pages
import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import Apply from '@/pages/Apply';
import ThankYou from '@/pages/ThankYou';
import Contact from '@/pages/Contact';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Candidate pages
import CandidateRegister from '@/pages/candidate/Register';
import CandidateLogin from '@/pages/candidate/Login';
import CandidateProfile from '@/pages/candidate/Profile';
import CandidateDashboard from '@/pages/candidate/Dashboard';
import CandidateApplications from '@/pages/candidate/Applications';

// HR pages
import HRLogin from '@/pages/hr/Login';
import HRDashboard from '@/pages/hr/Dashboard';
import HRJobs from '@/pages/hr/Jobs';
import HRApplications from '@/pages/hr/Applications';
import HRApplicationDetail from '@/pages/hr/ApplicationDetail';
import HRCandidates from '@/pages/hr/Candidates';

import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <ToastProvider>
            <AntiFraudPopup />
            <Routes>
              {/* Public career portal */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:slug" element={<JobDetail />} />
              <Route path="/apply/:slug" element={<Apply />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Candidate auth */}
              <Route path="/candidate/register" element={<CandidateRegister />} />
              <Route path="/candidate/login" element={<CandidateLogin />} />

              {/* Candidate protected */}
              <Route element={<ProtectedRoute requiredRole="candidate" redirectTo="/candidate/login" />}>
                <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/profile" element={<CandidateProfile />} />
                <Route path="/candidate/applications" element={<CandidateApplications />} />
              </Route>

              {/* HR auth */}
              <Route path="/hr/login" element={<HRLogin />} />

              {/* HR protected */}
              <Route element={<ProtectedRoute requiredRole="admin" redirectTo="/hr/login" />}>
                <Route path="/hr/dashboard" element={<HRDashboard />} />
                <Route path="/hr/jobs" element={<HRJobs />} />
                <Route path="/hr/applications" element={<HRApplications />} />
                <Route path="/hr/applications/:id" element={<HRApplicationDetail />} />
                <Route path="/hr/candidates" element={<HRCandidates />} />
              </Route>

              {/* Legacy redirects */}
              <Route path="/careers" element={<Navigate to="/jobs" replace />} />
              <Route path="/careers/:slug" element={<Navigate to="/jobs" replace />} />
              <Route path="/admin/login" element={<Navigate to="/hr/login" replace />} />
              <Route path="/admin/*" element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
