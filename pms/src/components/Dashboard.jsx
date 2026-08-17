import { useState, useEffect } from 'react';
import { getDashboardStats, getAppointments } from '../lib/storage';
import { Users, Activity, ArrowRight, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ totalPatients: 0, activePatients: 0, totalRevenue: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [nextPatient, setNextPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getDashboardStats(selectedMonth, selectedYear);
        setStats({
          totalPatients: data.totalPatients,
          activePatients: data.activePatients,
          totalRevenue: data.totalRevenue
        });
        
        // Sort by most recent (assuming ID is timestamp)
        setRecentPatients(data.patients.sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5));

        // Get Next Patient
        const apts = await getAppointments();
        const now = new Date();
        const futureApts = apts.filter(a => new Date(a.datetime) >= now).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        if (futureApts.length > 0) {
          setNextPatient(futureApts[0]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth, selectedYear]);

  if (loading && recentPatients.length === 0) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="mb-6">Overview</h1>
      
      {nextPatient && (
        <div className="card glass-panel mb-6" style={{ borderLeft: '4px solid var(--primary-color)', backgroundColor: 'rgba(239, 246, 255, 0.4)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-primary mb-2 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}><Clock size={20} /> Next Patient</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }} className="flex items-center gap-2">
                  <User size={24} className="text-muted" />
                  {nextPatient.patientName}
                </div>
                <div className="text-muted flex items-center gap-2">
                  <span className="badge badge-warning" style={{ fontSize: '0.9rem' }}>{format(new Date(nextPatient.datetime), 'h:mm a (MMM dd)')}</span>
                  {nextPatient.diagnosis && <span>• {nextPatient.diagnosis}</span>}
                </div>
              </div>
            </div>
            <Link to={`/patients/${nextPatient.patientId}`} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>View Profile</Link>
          </div>
        </div>
      )}

      {currentUser?.role === 'admin' && (
        <div className="card glass-panel mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-muted">Monthly Revenue</h3>
              <div className="flex gap-2">
                <select 
                  className="form-control" 
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <select 
                  className="form-control" 
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                >
                  {[currentDate.getFullYear() - 2, currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '50%' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₹</span>
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '700' }}>₹{stats.totalRevenue?.toLocaleString('en-IN')}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted">Total Patients</h3>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '50%' }}>
              <Users size={24} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalPatients}</p>
        </div>

        <div className="card glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted">Active Packages</h3>
            <div className="p-2 bg-green-100 rounded-full text-green-600" style={{ backgroundColor: '#d1fae5', color: '#059669', borderRadius: '50%' }}>
              <Activity size={24} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.activePatients}</p>
        </div>
      </div>

      <div className="card glass-panel">
        <div className="flex items-center justify-between mb-6">
          <h2>Recent Patients</h2>
          <Link to="/patients" className="btn btn-outline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        {recentPatients.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Condition</th>
                  <th>Package</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map(p => {
                  const isPaid = p.paymentReceived;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '500' }}>{p.name}</td>
                      <td className="text-muted">{p.condition}</td>
                      <td>
                        {p.packageDays === 'daily' ? 'Pay Daily' : (
                          <span className={`badge ${p.sessions?.length >= Number(p.packageDays) ? 'badge-success' : 'badge-warning'}`}>
                            {p.sessions?.length >= Number(p.packageDays) ? `${p.packageDays} Days (Completed)` : `${p.packageDays} Days (${p.sessions?.length || 0} done)`}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p className="mb-4">No patients added yet.</p>
            <Link to="/patients/new" className="btn btn-primary">Add Your First Patient</Link>
          </div>
        )}
      </div>
    </div>
  );
}
