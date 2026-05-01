import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Simplified form data (task requirement)
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    amount: '',
    status: 'Pending',
    paymentMethod: 'Cash',
    transactionId: '',
    notes: '',
  });

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchPayment();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const patRes = await API.get('/patients', { params: { limit: 100 } });
      // API response format: { success: true, data: { patients: [...] } }
      const patientsData = patRes.data?.data?.patients || patRes.data?.patients || [];
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const fetchAppointments = async (patientId) => {
    if (!patientId) { setAppointments([]); return; }
    try {
      const { data } = await API.get(`/appointments?patient=${patientId}`);
      setAppointments(data.appointments || data);
    } catch (error) {
      setAppointments([]);
    }
  };

  const fetchPayment = async () => {
    try {
      const { data } = await API.get(`/payments/${id}`);
      const payment = data.data || data;
      setFormData({
        patientId: payment.patient?._id || payment.patient || '',
        appointmentId: payment.appointment?._id || payment.appointment || '',
        amount: payment.amount || '',
        status: payment.status || 'Pending',
        paymentMethod: payment.paymentMethod || 'Cash',
        transactionId: payment.transactionId || '',
        notes: payment.notes || '',
      });
      if (payment.patient?._id || payment.patient) {
        fetchAppointments(payment.patient?._id || payment.patient);
      }
    } catch (error) {
      toast.error('Failed to load payment');
      navigate('/payments');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'patientId') {
      fetchAppointments(value);
      // Reset appointment when patient changes
      setFormData(prev => ({ ...prev, appointmentId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      toast.error('Patient is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Valid amount is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientId: formData.patientId,
        appointmentId: formData.appointmentId || null,
        amount: parseFloat(formData.amount),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        notes: formData.notes,
      };

      if (isEdit) {
        await API.put(`/payments/${id}`, payload);
        toast.success('Payment updated');
      } else {
        await API.post('/payments', payload);
        toast.success('Payment created');
      }
      navigate('/payments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/payments')} 
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Payments
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Payment' : 'New Payment'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? 'Update payment details' : 'Create a new payment record'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient + Appointment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select 
                name="patientId" 
                value={formData.patientId} 
                onChange={handleChange} 
                className="form-select"
              >
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Appointment (optional)</label>
              <select 
                name="appointmentId" 
                value={formData.appointmentId} 
                onChange={handleChange} 
                className="form-select"
                disabled={!formData.patientId}
              >
                <option value="">None</option>
                {appointments.map(a => (
                  <option key={a._id} value={a._id}>
                    {new Date(a.date).toLocaleDateString()} — {a.doctor?.name || a.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="0" 
              min="1"
              step="0.01"
            />
          </div>

          {/* Status + Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="form-select"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                name="paymentMethod" 
                value={formData.paymentMethod} 
                onChange={handleChange} 
                className="form-select"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="form-group">
            <label className="form-label">Transaction ID</label>
            <input 
              type="text" 
              name="transactionId" 
              value={formData.transactionId} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="e.g. TXN123456789"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="form-textarea" 
              rows="3" 
              placeholder="Additional notes (optional)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Payment' : 'Create Payment'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/payments')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
