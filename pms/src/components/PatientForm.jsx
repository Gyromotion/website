import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { savePatient, getPatientById } from '../lib/storage';
import { useAuth } from '../lib/AuthContext';

export default function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    diagnosis: '', // formerly condition
    history: '',
    address: '',
    referredBy: '',
    packageDays: '12',
    paymentAmount: '',
    paymentReceived: false,
    paymentMethod: 'UPI',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function load() {
      if (id) {
        const existing = await getPatientById(id);
        if (existing) {
          // Map old 'condition' to 'diagnosis' if present
          if (existing.condition && !existing.diagnosis) {
             existing.diagnosis = existing.condition;
          }
          setFormData(prev => ({...prev, ...existing}));
        }
      }
    }
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const patientData = { ...formData };
      if (!id) {
        patientData.addedBy = currentUser?.name;
      }
      patientData.lastEditedBy = currentUser?.name;

      await savePatient(patientData);
      navigate('/patients');
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("Failed to save patient.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="mb-6">{id ? 'Edit Patient' : 'Add New Patient'}</h1>
      
      <form onSubmit={handleSubmit} className="card glass-panel">
        <h3 className="mb-4">Personal Details</h3>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="form-group mb-0">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Phone Number</label>
            <input type="tel" name="phone" className="form-control" required value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Age</label>
            <input type="number" name="age" className="form-control" required value={formData.age} onChange={handleChange} />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Start Date</label>
            <input type="date" name="startDate" className="form-control" required value={formData.startDate} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group mb-6">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-control" rows="2" value={formData.address || ''} onChange={handleChange}></textarea>
        </div>

        <h3 className="mb-4">Medical Details</h3>
        <div className="form-group mb-4">
          <label className="form-label">Diagnosis / Reason for Visit</label>
          <textarea name="diagnosis" className="form-control" rows="2" required value={formData.diagnosis} onChange={handleChange}></textarea>
        </div>
        
        <div className="form-group mb-4">
          <label className="form-label">Medical History</label>
          <textarea name="history" className="form-control" rows="2" value={formData.history || ''} onChange={handleChange}></textarea>
        </div>

        <div className="form-group mb-6">
          <label className="form-label">Referred By</label>
          <input type="text" name="referredBy" className="form-control" value={formData.referredBy || ''} onChange={handleChange} />
        </div>

        <h3 className="mb-4 mt-6">Package & Payment Details</h3>
        
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="form-group mb-0">
            <label className="form-label">Treatment Package</label>
            <select name="packageDays" className="form-control" value={formData.packageDays} onChange={handleChange}>
              <option value="daily">Pay Per Session (No Package)</option>
              <option value="12">2 Weeks Package (12 Sessions)</option>
              <option value="25">4 Weeks Package (25 Sessions)</option>
            </select>
          </div>
          
          <div className="form-group mb-0">
            <label className="form-label">Payment Amount (₹)</label>
            <input type="number" name="paymentAmount" className="form-control" required value={formData.paymentAmount} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 items-center">
            <div className="form-group mb-0">
              <label className="form-label">Payment Method</label>
              <select name="paymentMethod" className="form-control" value={formData.paymentMethod} onChange={handleChange}>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="form-group flex items-center gap-2 mt-4 mb-0">
              <input type="checkbox" id="paymentReceived" name="paymentReceived" checked={formData.paymentReceived} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
              <label htmlFor="paymentReceived" className="form-label" style={{ marginBottom: 0 }}>Payment Received</label>
            </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Patient'}
          </button>
          <button type="button" onClick={() => navigate('/patients')} className="btn btn-secondary" disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
