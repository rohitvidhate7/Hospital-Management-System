import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar, FiClock, FiUser, FiCheckCircle, FiAlertCircle,
  FiActivity, FiArrowRight, FiUserPlus, FiDollarSign, FiLayers
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

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard/receptionist');
      setStats(data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
      console.error('Receptionist dashboard error:', errorMsg);
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

  const todayApptCount = stats?.todayAppointments?.length || 0;
  const pendingCount = stats?.pendingAppointments?.length || 0;
  const patientCount = stats?.allPatients?.length || 0;
  const doctorCount = stats?.availableDoctors?.length || 0;

  const statCards = [
    {
      title: "Today's Appointments",
      value: todayApptCount,
      icon: FiCalendar,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      link: '/appointments',
    },
    {
      title: 'Pending Appointments',
      value: pendingCount,
      icon: FiClock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      link: '/appointments',
    },
    {
      title: 'Total Patients',
      value: patientCount,
      icon: FiUser,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
      link: '/patients',
    },
    {
      title: 'Available Doctors',
      value: doctorCount,
      icon: FiActivity,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      link: '/doctors',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-violet-200 mt-1 text-sm">Manage appointments, patients, and bookings from one place.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/appointments/new" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors">
              <FiCalendar size={14} /> New Appointment
            </Link>
            <Link to="/patients/new" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors">
              <FiUserPlus size={14} /> New Patient
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} to={card.link} className="card p-4 hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              <card.icon className={card.color} size={18} />
            </div>
            <p className="text-xl font-bold text-slate-800">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
          </Link>
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
            <Link to="/appointments" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <FiArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.todayAppointments?.length > 0 ? (
                  stats.todayAppointments.map((apt, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                            {apt.patient?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 text-sm">{apt.patient?.name || 'N/A'}</p>
                            <p className="text-xs text-slate-400">{apt.patient?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-slate-700">{apt.doctor?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{apt.doctor?.specialization}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-600">{apt.time || '--:--'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[apt.status] || 'bg-slate-100 text-slate-700'}`}>
                          {apt.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">
                      No appointments scheduled for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link to="/appointments/new" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-blue-600" size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">New Appointment</span>
                </div>
                <FiArrowRight className="text-slate-300" size={14} />
              </Link>
              <Link to="/patients/new" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <FiUserPlus className="text-violet-600" size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Register Patient</span>
                </div>
                <FiArrowRight className="text-slate-300" size={14} />
              </Link>
              <Link to="/payments/new" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-emerald-600" size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Create Invoice</span>
                </div>
                <FiArrowRight className="text-slate-300" size={14} />
              </Link>
              <Link to="/all-bookings" className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FiLayers className="text-amber-600" size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">All Bookings</span>
                </div>
                <FiArrowRight className="text-slate-300" size={14} />
              </Link>
            </div>
          </div>

          {/* Available Doctors */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Available Doctors</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ready for consultation</p>
              </div>
              <Link to="/doctors" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All
              </Link>
            </div>
            <div className="p-3 max-h-48 overflow-y-auto">
              {stats?.availableDoctors?.length > 0 ? (
                stats.availableDoctors.map((doctor, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-emerald-50 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {doctor.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 text-sm truncate">Dr. {doctor.name}</p>
                      <p className="text-xs text-slate-400">{doctor.specialization}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">No doctors available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Appointments */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">Pending Appointments</h3>
              <p className="text-xs text-slate-400 mt-0.5">Awaiting confirmation</p>
            </div>
            <Link to="/appointments" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats?.pendingAppointments?.length > 0 ? (
              stats.pendingAppointments.slice(0, 5).map((apt, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-amber-50/30 transition-colors">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FiClock className="text-amber-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm truncate">{apt.patient?.name}</p>
                    <p className="text-xs text-slate-400">Dr. {apt.doctor?.name}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-sm">No pending appointments</div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Patients</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recently registered</p>
            </div>
            <Link to="/patients" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats?.allPatients?.length > 0 ? (
              stats.allPatients.slice(0, 5).map((patient, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-blue-50/30 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                    {patient.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm truncate">{patient.name}</p>
                    <p className="text-xs text-slate-400">{patient.phone}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {patient.age}y
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-sm">No patients registered</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
