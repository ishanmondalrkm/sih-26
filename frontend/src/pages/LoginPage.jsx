import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, Shield, User, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [ward, setWard] = useState('Ward 12 - Indiranagar');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide your mobile/email and password.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const res = await login(identifier.trim(), password);
    setIsSubmitting(false);
    if (res.success) {
      if (res.user.role === 'admin' || res.user.role === 'developer') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !password.trim()) {
      setError('Please provide Name, Mobile Number, and Password.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const res = await register({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      password,
      ward
    });
    setIsSubmitting(false);
    if (res.success) {
      navigate('/citizen');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const fillAndLoginDemo = async (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
    setIsSubmitting(true);
    const res = await login(id, pass);
    setIsSubmitting(false);
    if (res && res.success) {
      if (res.user.role === 'admin' || res.user.role === 'developer') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    } else {
      setError(res?.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Landmark className="h-5 w-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 font-outfit">
            Civic<span className="text-blue-600">Pulse</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-slate-800 font-outfit">
          {mode === 'login' ? 'Sign In to Portal' : 'Register New Citizen Account'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Secure Role-Based Access for Citizens and Municipal Administrators
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-slate-200/80 space-y-6">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              data-testid="tab-login-btn"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              data-testid="tab-register-btn"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New Citizen Register
            </button>
          </div>

          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium"
              data-testid="login-error-message"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number or Email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or admin@civicpulse.org"
                  data-testid="login-identifier-input"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="login-password-input"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="login-submit-btn"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  data-testid="register-name-input"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  data-testid="register-mobile-input"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Municipal Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  data-testid="register-ward-select"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ward 12 - Indiranagar">Ward 12 - Indiranagar</option>
                  <option value="Ward 15 - Koramangala">Ward 15 - Koramangala</option>
                  <option value="Ward 08 - Malleshwaram">Ward 08 - Malleshwaram</option>
                  <option value="Ward 22 - Whitefield">Ward 22 - Whitefield</option>
                  <option value="Ward 05 - Jayanagar">Ward 05 - Jayanagar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="register-password-input"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="register-submit-btn"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? 'Creating Account...' : 'Register Citizen Account'}
              </button>
            </form>
          )}

          {/* 1-Click Quick Demo Accounts for Evaluators */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillAndLoginDemo('9876543210', 'citizen123')}
                data-testid="quick-fill-citizen-btn"
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors"
              >
                <span className="text-[11px] font-bold text-blue-700 block">Citizen Ramesh</span>
                <span className="text-[10px] text-slate-500 font-mono">9876543210</span>
              </button>
              <button
                type="button"
                onClick={() => fillAndLoginDemo('admin@civicpulse.org', 'admin123')}
                data-testid="quick-fill-admin-btn"
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors"
              >
                <span className="text-[11px] font-bold text-blue-700 block">Admin Anjali</span>
                <span className="text-[10px] text-slate-500 font-mono">admin@civicpulse.org</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}