import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar, FiClock, FiUser, FiCheckCircle, FiAlertCircle,
  FiActivity, FiArrowRight, FiUserPlus, FiFileText
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
  'No Show': 'bg-slate-100 text-slate-700',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard/doctor');
      setStats(data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
      console.error('Doctor dashboard error:', errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments?.length || 0,
      icon: FiCalendar,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      title: 'Pending',
      value: stats?.pendingAppointments || 0,
      icon: FiClock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      title: 'Completed',
      value: stats?.completedAppointments || 0,
      icon: FiCheckCircle,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: FiUser,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome Dr. {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-emerald-200 mt-1 text-sm">Manage your appointments and patient consultations.</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-200 text-xs">Specialization</p>
            <p className="font-semibold">{stats?.doctor?.specialization || 'General Medicine'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              <card.icon className={card.color} size={18} />
            </div>
            <p className="text-xl font-bold text-slate-800">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">Today's Appointments</h3>
              <p className="text-xs text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-xs text-blue-600 font-medium">
              {stats?.todayAppointments?.length || 0} appointments
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {stats?.todayAppointments?.length > 0 ? (
              stats.todayAppointments.map((apt, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-blue-50/30 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                    {apt.time?.split(':')[0] || '09'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm truncate">
                      {apt.patient?.name || 'Unknown Patient'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{apt.patient?.age}y, {apt.patient?.gender}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{apt.patient?.phone}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[apt.status] || 'bg-slate-100 text-slate-700'}`}>
                    {apt.status || 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FiCalendar className="mx-auto text-slate-300 mb-2" size={36} />
                <p className="text-slate-400 text-sm">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Doctor Profile */}
          <div className="card">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Your Profile</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  Dr.{user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{stats?.doctor?.name}</p>
                  <p className="text-xs text-slate-500">{stats?.doctor?.specialization}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Consultation Fee</span>
                <span className="text-sm font-medium text-slate-700">₹{stats?.doctor?.consultationFee || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link to="/appointments" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-blue-600" size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">View All Appointments</span>
                </div>
                <FiArrowRight className="text-slate-300" size={14} />
              </Link>
              <Link to="/patients" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiUserPlus className="text-emerald-600" size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">View Patients</span>
                </div>
                <FiArrowRight className="text-slate-300" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Recent Appointments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your recent patient consultations</p>
          </div>
          <Link to="/appointments" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <FiArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.myAppointments?.slice(0, 5).map((apt) => (
                <tr key={apt._id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                        {apt.patient?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{apt.patient?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{apt.patient?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FiClock size={12} className="text-slate-400" />
                      <span className="text-sm">
                        {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs text-slate-400">{apt.time}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[apt.status] || 'bg-slate-100 text-slate-700'}`}>
                      {apt.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.myAppointments || stats.myAppointments.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No appointments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
