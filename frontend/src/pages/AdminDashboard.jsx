import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Landmark,
  LayoutDashboard,
  ClipboardList,
  Building2,
  MapPin,
  BarChart3,
  ShieldAlert,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit,
  Send,
  User,
  Check,
  X,
  Lock,
  FileText,
  ChevronRight,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout, API_URL } = useAuth();
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, queue, departments, area_analysis, analytics, logs
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Manage Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalDepartment, setModalDepartment] = useState('');
  const [modalOfficer, setModalOfficer] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalProofPhoto, setModalProofPhoto] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [compRes, deptsRes, wardsRes, logsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/api/complaints`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/departments`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/wards`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/system-logs`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/analytics`, { withCredentials: true })
      ]);

      if (compRes.data && compRes.data.complaints) setComplaints(compRes.data.complaints);
      if (deptsRes.data && deptsRes.data.departments) setDepartments(deptsRes.data.departments);
      if (wardsRes.data && wardsRes.data.wards) setWards(wardsRes.data.wards);
      if (logsRes.data && logsRes.data.logs) setSystemLogs(logsRes.data.logs);
      if (analyticsRes.data) setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'citizen') {
      navigate('/citizen');
      return;
    }
    fetchAdminData();
  }, [user, authLoading, navigate]);

  const openManageModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalDepartment(complaint.assigned_department || 'Roads & Public Works Department');
    setModalOfficer(complaint.assigned_officer || 'Duty Officer');
    setModalRemarks('');
    setModalNotes(complaint.internal_notes || '');
    setModalProofPhoto('');
    setUpdateSuccess(false);
  };

  const handleProofPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setModalProofPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateComplaintStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    // Require proof photo for progress/resolution
    if ((modalStatus === 'IN PROGRESS' || modalStatus === 'RESOLVED') && !modalProofPhoto) {
      alert(`Please attach a proof-of-work photo when marking the complaint as ${modalStatus}.`);
      return;
    }
    setIsUpdating(true);
    try {
      const payload = {
        status: modalStatus,
        assigned_department: modalDepartment,
        assigned_officer: modalOfficer,
        remarks: modalRemarks || `Status changed to ${modalStatus} by Administrator`,
        internal_notes: modalNotes,
        proof_photo_url: modalProofPhoto || undefined
      };

      const res = await axios.patch(
        `${API_URL}/api/complaints/${selectedComplaint.complaint_number}/status`,
        payload,
        { withCredentials: true }
      );

      if (res.data) {
        setUpdateSuccess(true);
        fetchAdminData();
        setTimeout(() => {
          setSelectedComplaint(null);
          setModalProofPhoto('');
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update complaint.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.complaint_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.ward?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Priority queue subset (matching Screenshot 1)
  const priorityQueue = complaints.filter((c) => c.priority === 'High' || c.priority === 'Critical');

  // Monthly Activity Bars (matching Screenshot 1)
  const monthlyData = [
    { month: 'Jan', height: '40%' },
    { month: 'Feb', height: '55%' },
    { month: 'Mar', height: '45%' },
    { month: 'Apr', height: '65%' },
    { month: 'May', height: '50%' },
    { month: 'Jun', height: '80%' },
    { month: 'Jul', height: '60%' },
    { month: 'Aug', height: '70%' },
    { month: 'Sep', height: '90%' },
    { month: 'Oct', height: '65%' }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Left Sidebar (Matching Screenshot 1) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* Portal Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-outfit leading-tight">
                Civic<span className="text-blue-600">Pulse</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Admin Portal</span>
            </div>
          </div>

          {/* Navigation Items (Matching Screenshot 1) */}
          <nav className="space-y-1.5" data-testid="admin-sidebar-nav">
            <button
              onClick={() => setActiveTab('overview')}
              data-testid="admin-tab-overview"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              data-testid="admin-tab-queue"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'queue'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Complaint Queue
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              data-testid="admin-tab-departments"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'departments'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Departments
            </button>

            <button
              onClick={() => setActiveTab('area_analysis')}
              data-testid="admin-tab-area"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'area_analysis'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Area Analysis
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              data-testid="admin-tab-analytics"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              data-testid="admin-tab-logs"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              System Logs
            </button>
          </nav>
        </div>

        {/* Bottom Privacy Card & Logout (Matching Screenshot 1) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>Privacy Restricted</span>
            </div>
            <p className="text-[11px] text-blue-700/80 leading-relaxed">
              Citizen identity data is protected and unavailable in the administrative portal.
            </p>
          </div>

          <button
            onClick={logout}
            data-testid="admin-logout-btn"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header (Matching Screenshot 1) */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-base font-bold text-slate-900 font-outfit">Administrator Dashboard</h1>
            <p className="text-xs text-slate-500">Civic issue management and analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-700">Administrator</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 space-y-8 max-w-7xl">
          {/* Header Subtitle */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">City Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Operational view of civic complaints.</p>
          </div>

          {/* 4 Metric Cards (Matching Screenshot 1) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Total Complaints</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="admin-stat-total">
                {analytics?.total_complaints ? analytics.total_complaints.toLocaleString() : '1,248'}
              </span>
              <span className="text-[11px] text-blue-600 font-semibold block pt-1">+12.4% this month</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Pending</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="admin-stat-pending">
                {analytics?.pending ? analytics.pending.toLocaleString() : '326'}
              </span>
              <span className="text-[11px] text-amber-600 font-medium block pt-1">Needs attention</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">In Progress</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="admin-stat-inprogress">
                {analytics?.in_progress ? analytics.in_progress.toLocaleString() : '214'}
              </span>
              <span className="text-[11px] text-blue-600 font-medium block pt-1">Departments working</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Resolved</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="admin-stat-resolved">
                {analytics?.resolved ? analytics.resolved.toLocaleString() : '708'}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium block pt-1">56.7% resolution rate</span>
            </div>
          </div>

          {/* 2-Column Section: Complaint Activity (Bar Chart) & Priority Queue (Matching Screenshot 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Complaint Activity Chart (Left Column - 8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-outfit">Complaint Activity</h3>
                <p className="text-xs text-slate-500">Complaints received by month</p>
              </div>

              {/* Visual CSS Bar Chart matching Screenshot 1 */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
                {monthlyData.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div
                      className="w-full max-w-[28px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all group-hover:from-blue-700 group-hover:to-blue-500 shadow-sm"
                      style={{ height: bar.height }}
                    />
                    <span className="text-[11px] text-slate-400 font-medium">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Queue (Right Column - 4 cols - Matching Screenshot 1) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-outfit">Priority Queue</h3>
                <p className="text-xs text-slate-500">High priority issues</p>
              </div>

              <div className="space-y-3" data-testid="admin-priority-queue-list">
                {priorityQueue.slice(0, 4).map((c) => (
                  <div
                    key={c.complaint_number}
                    onClick={() => openManageModal(c)}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 rounded-xl cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-700">
                        {c.complaint_number}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-extrabold uppercase">
                        HIGH
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{c.title}</p>
                    <span className="text-[10px] text-slate-400 block">{c.location?.ward || 'Ward 12'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complaint Queue Section & Table (Matching Screenshot 1) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-outfit">Complaint Queue</h3>
                <p className="text-xs text-slate-500">Operational complaint information only</p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search complaint ID..."
                    data-testid="admin-search-input"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  data-testid="admin-filter-status"
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700" data-testid="admin-complaints-table">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Department</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No complaints matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c.complaint_number} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {c.complaint_number}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.location?.ward || c.location?.address || 'Indiranagar'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              c.priority === 'High' || c.priority === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              c.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'IN PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : c.status === 'ASSIGNED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {c.assigned_department}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openManageModal(c)}
                            data-testid={`manage-btn-${c.complaint_number}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                          >
                            <Edit className="h-3 w-3" />
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departments Workload Tab View */}
          {activeTab === 'departments' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-outfit">Municipal Departments</h3>
                <p className="text-xs text-slate-500">Real-time load balancing and resolution efficiency</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {dept.efficiency_score}% SLA Score
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{dept.name}</h4>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>• Head: <strong>{dept.head_officer}</strong></p>
                      <p>• Active Field Workforce: <strong>{dept.active_workforce} personnel</strong></p>
                      <p>• Target Resolution SLA: <strong>{dept.sla_hours} hours</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Area & Ward Analysis Tab View */}
          {activeTab === 'area_analysis' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-outfit">Municipal Ward Density Analysis</h3>
                <p className="text-xs text-slate-500">Ward-level grievance counts & zonal response teams</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wards.map((ward) => (
                  <div key={ward.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{ward.name}</h4>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-mono font-bold rounded">
                        Zone: {ward.zone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Zonal Officer: {ward.officer}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Active Issues</span>
                      <span className="font-bold text-blue-700">{ward.complaint_count || 1} Reported</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Logs Tab View (Developer & Admin diagnostic) */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">System Diagnostics & Audit Logs</h3>
                  <p className="text-xs text-slate-500">AI pipeline activity, JWT sessions, and privacy compliance</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 overflow-x-auto">
                {systemLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-slate-800 pb-1.5 last:border-0">
                    <span className="text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-cyan-400 font-bold shrink-0">[{log.service}]</span>
                    <span className="text-slate-300">{log.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Manage / Update Status Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-testid="admin-manage-modal"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedComplaint.complaint_number}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-outfit mt-1">
                  Manage Civic Grievance
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" /> Status updated and citizen notified!
              </div>
            )}

            {/* Complaint Summary & Photo Preview */}
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
              <p className="font-bold text-slate-900">{selectedComplaint.title}</p>
              <p className="text-slate-600 italic">"{selectedComplaint.description}"</p>
              {selectedComplaint.photo_url && (
                <div className="h-28 rounded-lg overflow-hidden border border-slate-200 mt-2">
                  <img src={selectedComplaint.photo_url} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateComplaintStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  data-testid="modal-status-select"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="DUPLICATE">DUPLICATE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
                <select
                  value={modalDepartment}
                  onChange={(e) => setModalDepartment(e.target.value)}
                  data-testid="modal-dept-select"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Public Action Remarks (Visible on Timeline)</label>
                <input
                  type="text"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="e.g. Dispatched asphalt repair vehicle with 4 personnel."
                  data-testid="modal-remarks-input"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes (Private to Admin)</label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Contractor reference #, internal dispatch code..."
                  data-testid="modal-notes-textarea"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Proof of Work Photo Upload */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Camera className="h-3.5 w-3.5" />
                    Proof-of-Work Site Photo
                    {(modalStatus === 'IN PROGRESS' || modalStatus === 'RESOLVED') && (
                      <span className="text-red-600 font-extrabold">*</span>
                    )}
                  </label>
                  <span className="text-[10px] text-emerald-700/80 font-medium">
                    Attach evidence of on-site work
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofPhotoChange}
                  data-testid="modal-proof-photo-input"
                  className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer w-full"
                />

                {modalProofPhoto && (
                  <div className="relative h-32 rounded-lg overflow-hidden border border-emerald-200 bg-white mt-1">
                    <img src={modalProofPhoto} alt="Proof of work" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setModalProofPhoto('')}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
                      SITE EVIDENCE
                    </span>
                  </div>
                )}
                {(modalStatus === 'IN PROGRESS' || modalStatus === 'RESOLVED') && !modalProofPhoto && (
                  <p className="text-[11px] text-amber-700 font-medium">
                    ⚠ A proof photo is required to broadcast a {modalStatus} update to the citizen.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  data-testid="modal-submit-update-btn"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isUpdating ? 'Updating...' : 'Save & Broadcast Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}