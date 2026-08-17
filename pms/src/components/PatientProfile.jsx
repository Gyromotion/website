import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatientById, savePatient, deletePatient, getAppointments, saveAppointment } from '../lib/storage';
import { format, addHours, parseISO } from 'date-fns';
import { Calendar, User, Phone, Activity, CheckCircle, Trash2, Edit, MapPin, FileText, Share2, Clock, Printer } from 'lucide-react';
import { packages, mainPricingMatrix, additionalChargesMatrix } from '../lib/pricingData';
import { useAuth } from '../lib/AuthContext';

export default function PatientProfile() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Session logging state
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [exerciseText, setExerciseText] = useState('');
  const [protocolText, setProtocolText] = useState('');
  const [sessionPrice, setSessionPrice] = useState('');
  const [sessionPaymentMethod, setSessionPaymentMethod] = useState('UPI');
  
  // Pricing matrix state
  const [pkgType, setPkgType] = useState('per_session');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // Appointment scheduling state
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [dayAppointments, setDayAppointments] = useState([]);

  useEffect(() => {
    loadPatient();
  }, [id]);

  useEffect(() => {
    if (aptDate) {
      loadDayAppointments(aptDate);
      setAptTime(''); // reset time when date changes
    }
  }, [aptDate]);

  useEffect(() => {
    if (category && subCategory) {
      const isAdditional = pkgType === 'additional';
      const matrix = isAdditional ? additionalChargesMatrix : mainPricingMatrix;
      const catData = matrix[category];
      if (catData) {
        const subData = catData.options.find(o => o.id === subCategory);
        if (subData) {
           let newPrice = isAdditional ? subData.price : subData.prices[pkgType];
           if (newPrice !== undefined && newPrice !== '') setSessionPrice(newPrice);
           const pkgLabel = packages.find(p => p.id === pkgType)?.label || '';
           setProtocolText(`[${pkgLabel.split(' ')[0]}] ${catData.label} (${subData.label})`);
        }
      }
    }
  }, [pkgType, category, subCategory]);

  const loadPatient = async () => {
    setLoading(true);
    const data = await getPatientById(id);
    if (data) {
      if (data.condition && !data.diagnosis) data.diagnosis = data.condition;
      setPatient(data);
    } else {
      navigate('/patients');
    }
    setLoading(false);
  };

  const loadDayAppointments = async (dateStr) => {
    const allApts = await getAppointments();
    const forDay = allApts.filter(a => a.datetime.startsWith(dateStr));
    setDayAppointments(forDay);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      await deletePatient(id);
      navigate('/patients');
    }
  };

  const handleMarkSession = async () => {
    if (!exerciseText.trim()) {
      alert("Please enter the exercises performed during this session.");
      return;
    }
    
    if (patient.packageDays !== 'daily' && patient.sessions.length >= Number(patient.packageDays)) {
      alert("This package has already been completed.");
      return;
    }

    const newSession = {
      id: Date.now().toString(),
      date: new Date(sessionDate).toISOString(),
      exercises: exerciseText,
      protocol: protocolText,
      amountPaid: patient.packageDays === 'daily' ? sessionPrice : 0,
      paymentMethod: patient.packageDays === 'daily' ? sessionPaymentMethod : null,
      loggedBy: currentUser?.name
    };

    const updatedPatient = {
      ...patient,
      sessions: [...patient.sessions, newSession],
      lastEditedBy: currentUser?.name
    };

    await savePatient(updatedPatient);
    setPatient(updatedPatient);
    setExerciseText('');
    setProtocolText('');
    setSessionPrice('');
    setSessionPaymentMethod('UPI');
  };

  const handleDeleteSession = async (sessionId) => {
      if(window.confirm('Delete this session record?')) {
          const updatedPatient = {
              ...patient,
              sessions: patient.sessions.filter(s => s.id !== sessionId)
          };
          await savePatient(updatedPatient);
          setPatient(updatedPatient);
      }
  }

  // --- APPOINTMENT SCHEDULING LOGIC ---
  const handleScheduleAppointment = async () => {
    if (!aptDate || !aptTime) return alert('Please select a date and time.');
    setScheduling(true);

    try {
      const datetimeStr = `${aptDate}T${aptTime}:00`;
      
      const newApt = {
        patientId: patient.id,
        patientName: patient.name,
        diagnosis: patient.diagnosis || '',
        datetime: datetimeStr
      };
      await saveAppointment(newApt);

      alert('Appointment slot reserved successfully!');
      setAptDate('');
      setAptTime('');
      loadDayAppointments(aptDate); // Refresh slots
    } catch (error) {
      console.error("Scheduling error:", error);
      alert("Error scheduling appointment! " + error.message);
    } finally {
      setScheduling(false);
    }
  };

  // Generate Time Slots from 9:00 AM to 6:00 PM in 30 min intervals
  const timeSlots = [];
  for (let i = 9; i <= 18; i++) {
    for (let mins of ['00', '30']) {
      if (i === 18 && mins === '30') continue; // Stop at 6:00 PM
      
      const timeStr = `${i.toString().padStart(2, '0')}:${mins}`;
      let disabled = true;
      let label = format(parseISO(`2000-01-01T${timeStr}:00`), 'h:mm a');
      
      if (aptDate) {
        const datetimeStr = `${aptDate}T${timeStr}:00`;
        const count = dayAppointments.filter(a => a.datetime === datetimeStr).length;
        disabled = count >= 2;
        if (disabled) label += ' (Full - 2 Booked)';
        else if (count === 1) label += ' (1 Booked)';
      }

      timeSlots.push({ value: timeStr, label, disabled });
    }
  }

  if (loading) return <div>Loading...</div>;
  const handleGenerateInvoice = () => {
    setShowInvoiceModal(true);
  };

  if (!patient) return null;

  const isDaily = patient.packageDays === 'daily';
  const sessionsRemaining = isDaily ? null : Number(patient.packageDays) - patient.sessions.length;
  const isCompleted = !isDaily && sessionsRemaining <= 0;

  const dailyTotalPaid = isDaily 
    ? patient.sessions.reduce((sum, s) => sum + Number(s.amountPaid || 0), 0) + (patient.paymentReceived ? Number(patient.paymentAmount || 0) : 0)
    : 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <h1>Patient Profile</h1>
        <div className="flex gap-2">
          <button onClick={handleGenerateInvoice} className="btn btn-outline" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
            <Printer size={16} /> Generate Invoice
          </button>
          <Link to={`/patients/${patient.id}/edit`} className="btn btn-secondary">
            <Edit size={18} /> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Main Details */}
        <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-full" style={{ backgroundColor: '#f1f5f9' }}>
              <User size={40} className="text-muted" />
            </div>
            <div>
              <h2 className="mb-1">{patient.name}</h2>
              <div className="flex items-center gap-4 text-muted text-sm flex-wrap">
                <span className="flex items-center gap-1"><Phone size={14} /> {patient.phone}</span>
                <span className="flex items-center gap-1"><Activity size={14} /> Age: {patient.age}</span>
                {patient.referredBy && <span className="flex items-center gap-1"><Share2 size={14} /> Ref: {patient.referredBy}</span>}
              </div>
            </div>
          </div>
          
          {(patient.addedBy || patient.lastEditedBy) && (
            <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              {patient.addedBy && <span className="text-muted">Added by: <strong style={{ color: 'var(--text-main)' }}>{patient.addedBy}</strong></span>}
              {patient.lastEditedBy && <span className="text-muted">Last edited by: <strong style={{ color: 'var(--text-main)' }}>{patient.lastEditedBy}</strong></span>}
            </div>
          )}

          <div className="mb-4">
            <h4 className="text-muted mb-1 text-sm uppercase" style={{ letterSpacing: '0.05em' }}><Activity size={12} className="inline mr-1" /> Diagnosis</h4>
            <p style={{ lineHeight: '1.6' }}>{patient.diagnosis}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-muted mb-1 text-sm uppercase" style={{ letterSpacing: '0.05em' }}><FileText size={12} className="inline mr-1" /> Medical History</h4>
            <p style={{ lineHeight: '1.6' }}>{patient.history || 'No history recorded.'}</p>
          </div>

          <div>
            <h4 className="text-muted mb-1 text-sm uppercase" style={{ letterSpacing: '0.05em' }}><MapPin size={12} className="inline mr-1" /> Address</h4>
            <p style={{ lineHeight: '1.6' }}>{patient.address || 'No address recorded.'}</p>
          </div>
        </div>

        {/* Package & Payment Details */}
        <div className="card glass-panel flex" style={{ flexDirection: 'column' }}>
          <h3 className="mb-4">Package Details</h3>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-muted text-sm">Package</span>
              <span style={{ fontWeight: '600' }}>{isDaily ? 'Pay Daily' : `${patient.packageDays} Days`}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-muted text-sm">Attended</span>
              <span style={{ fontWeight: '600' }}>{patient.sessions.length}</span>
            </div>
            {!isDaily && (
              <div className="flex justify-between">
                <span className="text-muted text-sm">Remaining</span>
                <span style={{ fontWeight: '600', color: isCompleted ? 'var(--danger)' : 'var(--success)' }}>
                  {sessionsRemaining}
                </span>
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }}></div>
          
          <div>
             <div className="flex justify-between items-center mb-2">
                <span className="text-muted text-sm">{isDaily ? 'Initial Payment' : 'Payment Status'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">({patient.paymentMethod || 'Cash'})</span>
                  <span className={`badge ${patient.paymentReceived ? 'badge-success' : 'badge-warning'}`}>
                    {patient.paymentReceived ? 'Paid' : 'Pending'}
                  </span>
                </div>
             </div>
             <div className="flex justify-between items-center mb-2">
                <span className="text-muted text-sm">{isDaily ? 'Initial Amount' : 'Amount'}</span>
                <span style={{ fontWeight: '600' }}>₹{patient.paymentAmount}</span>
             </div>
             {isDaily && (
               <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px dashed var(--border-color)' }}>
                  <span className="text-muted text-sm" style={{ fontWeight: '600', color: 'var(--text-main)' }}>Total Paid</span>
                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>₹{dailyTotalPaid}</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Appointment Scheduling */}
      <div className="card glass-panel mb-6" style={{ borderLeft: '4px solid var(--primary-color)' }}>
        <h3 className="mb-4 flex items-center gap-2"><Clock size={20} className="text-primary" /> Schedule Next Appointment</h3>
        <p className="text-sm text-muted mb-4">Select a date to see available time slots. Reserving a slot will instantly save it to the system.</p>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="form-group mb-0 flex-1 min-w-[150px]">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={aptDate} onChange={e => setAptDate(e.target.value)} />
          </div>
          <div className="form-group mb-0 flex-1 min-w-[200px]">
            <label className="form-label">Time Slot (30 Min)</label>
            <select 
              className="form-control" 
              value={aptTime} 
              onChange={e => setAptTime(e.target.value)} 
              disabled={!aptDate}
            >
              <option value="">{aptDate ? '-- Select Time --' : 'Select a date first'}</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value} disabled={slot.disabled}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleScheduleAppointment} className="btn btn-primary" disabled={scheduling || !aptDate || !aptTime}>
            {scheduling ? 'Scheduling...' : 'Reserve Slot'}
          </button>
        </div>
      </div>

      {/* Session Tracking */}
      <div className="card glass-panel mb-6">
        <h2 className="mb-4">Session Tracking</h2>
        
        {!isCompleted ? (
          <div className="bg-secondary p-4 rounded-md mb-6" style={{ backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--radius-md)' }}>
            <h4 className="mb-4">Log New Session</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group mb-0">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-md mb-4 border border-gray-100" style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-color)' }}>
              <h5 className="mb-3 text-sm uppercase text-muted">Auto-Calculate Fees</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Package / Charge Type</label>
                  <select className="form-control" value={pkgType} onChange={e => { setPkgType(e.target.value); setCategory(''); setSubCategory(''); }}>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Treatment Category</label>
                  <select className="form-control" value={category} onChange={e => { setCategory(e.target.value); setSubCategory(''); }}>
                    <option value="">-- Select --</option>
                    {Object.entries(pkgType === 'additional' ? additionalChargesMatrix : mainPricingMatrix).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Duration / Phase</label>
                  <select className="form-control" value={subCategory} onChange={e => setSubCategory(e.target.value)} disabled={!category}>
                    <option value="">-- Select --</option>
                    {category && (pkgType === 'additional' ? additionalChargesMatrix : mainPricingMatrix)[category]?.options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {isDaily && (
                <div className="flex gap-4">
                  <div className="form-group mb-0" style={{ flex: 2 }}>
                    <label className="form-label">Final Amount Paid (₹)</label>
                    <input type="number" className="form-control" placeholder="e.g. 500" value={sessionPrice} onChange={e => setSessionPrice(e.target.value)} />
                    <small className="text-xs text-muted block mt-1">You can override the auto-calculated amount.</small>
                  </div>
                  <div className="form-group mb-0" style={{ flex: 1 }}>
                    <label className="form-label">Method</label>
                    <select className="form-control" value={sessionPaymentMethod} onChange={e => setSessionPaymentMethod(e.target.value)}>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="form-group mb-0" style={{ gridColumn: isDaily ? 'auto' : 'span 2' }}>
                <label className="form-label">Protocol Recorded</label>
                <input type="text" className="form-control" placeholder="e.g. Phase 1 Rehab" value={protocolText} onChange={e => setProtocolText(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="form-group mb-0">
                <label className="form-label">Exercises Performed</label>
                <input type="text" className="form-control" placeholder="e.g. 3x10 Squats" value={exerciseText} onChange={e => setExerciseText(e.target.value)} />
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <button onClick={handleMarkSession} className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
                <CheckCircle size={18} /> Mark Attended
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 text-center rounded-md" style={{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #34d399' }}>
            <strong>Package Completed!</strong> This patient has attended all {patient.packageDays} sessions.
          </div>
        )}

        <h3 className="mb-4 text-muted text-sm uppercase">Attendance History</h3>
        {patient.sessions.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Protocol & Exercises</th>
                  {isDaily && <th>Payment</th>}
                  <th style={{width: '60px'}}></th>
                </tr>
              </thead>
              <tbody>
                {patient.sessions.sort((a,b) => new Date(b.date) - new Date(a.date)).map((session) => (
                  <tr key={session.id}>
                    <td style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      <div className="flex items-center gap-2" style={{ fontWeight: '500' }}>
                        <Calendar size={14} className="text-muted" />
                        {format(new Date(session.date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td>
                      {session.protocol && <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--primary-hover)' }}>{session.protocol}</div>}
                      <div className="text-sm">{session.exercises}</div>
                      {session.loggedBy && <div className="text-xs text-muted mt-1">Logged by: {session.loggedBy}</div>}
                    </td>
                    {isDaily && (
                      <td style={{ verticalAlign: 'top' }}>
                        {session.amountPaid ? (
                          <>
                            <div style={{ fontWeight: '600', color: 'var(--success)' }}>₹{session.amountPaid}</div>
                            <div className="text-xs text-muted">{session.paymentMethod || 'Cash'}</div>
                          </>
                        ) : '-'}
                      </td>
                    )}
                    <td style={{ verticalAlign: 'top' }}>
                      <button onClick={() => handleDeleteSession(session.id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer'}}>
                          <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center py-4">No sessions attended yet.</p>
        )}
      </div>

      {showInvoiceModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => setShowInvoiceModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div 
            className="card glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', width: '90%', padding: '2rem', backgroundColor: '#fff', cursor: 'default' }}
          >
            <h2 className="mb-4 text-xl">Generate Invoice</h2>
            <p className="mb-6">Do you want to include the Attendance History (Dates & Protocol Recorded) in this invoice?</p>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-secondary mr-auto" onClick={(e) => { e.stopPropagation(); setShowInvoiceModal(false); }}>Cancel</button>
              <Link to={`/patients/${id}/invoice?includeHistory=false`} className="btn btn-outline" onClick={(e) => e.stopPropagation()}>No</Link>
              <Link to={`/patients/${id}/invoice?includeHistory=true`} className="btn btn-primary" onClick={(e) => e.stopPropagation()}>Yes</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
