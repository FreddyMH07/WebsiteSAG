import { Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-8xl font-black text-sag-green/20">404</p>
        <h1 className="mt-4 text-2xl font-black text-sag-green">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
