import { useState, useEffect } from 'react';
import { getAppointments, deleteAppointment } from '../lib/storage';
import { format, parseISO } from 'date-fns';
import { Clock, Trash2, User, CalendarDays } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApts();
  }, []);

  const loadApts = async () => {
    try {
      const data = await getAppointments();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const upcoming = data.filter(a => new Date(a.datetime) >= today);
      upcoming.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      setAppointments(upcoming);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cancel this appointment block?")) {
      await deleteAppointment(id);
      loadApts();
    }
  };

  if (loading) return <div className="p-8">Loading appointments...</div>;

  const grouped = {};
  appointments.forEach(apt => {
    const dateStr = apt.datetime.split('T')[0];
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(apt);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="flex items-center gap-3"><CalendarDays size={28} /> Schedule & Appointments</h1>
      </div>

      <div className="mb-6">
        {Object.keys(grouped).length > 0 ? (
          <div className="flex flex-col gap-8">
            {Object.keys(grouped).map(dateStr => {
               const apts = grouped[dateStr];
               const dateObj = parseISO(dateStr);
               const isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
               
               return (
                 <div key={dateStr} className="calendar-day-group">
                   <h3 className="mb-4 pb-2" style={{ borderBottom: '2px solid var(--border-color)', color: isToday ? 'var(--primary-color)' : 'var(--text-main)', fontSize: '1.25rem', fontWeight: '600' }}>
                     {isToday ? 'Today, ' : ''}{format(dateObj, 'EEEE, MMMM d')}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {apts.map(apt => {
                        const isPast = new Date(apt.datetime) < new Date();
                        return (
                          <div key={apt.id} className="card glass-panel" style={{ opacity: isPast ? 0.6 : 1, padding: '1.25rem', borderLeft: '4px solid ' + (isPast ? 'var(--text-muted)' : 'var(--primary-color)'), backgroundColor: isToday ? 'rgba(239, 246, 255, 0.3)' : 'rgba(255,255,255,0.7)' }}>
                            <div className="flex justify-between items-start mb-3">
                              <div style={{ fontWeight: '700', fontSize: '1.25rem', color: isPast ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                <Clock size={16} className="inline mr-2 text-muted" />
                                {format(new Date(apt.datetime), 'h:mm a')}
                              </div>
                              <button onClick={() => handleDelete(apt.id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem'}}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-1" style={{ fontWeight: '600' }}>
                              <User size={16} className="text-muted" />
                              {apt.patientName}
                            </div>
                            <div className="text-sm text-muted">{apt.diagnosis}</div>
                          </div>
                        )
                     })}
                   </div>
                 </div>
               )
            })}
          </div>
        ) : (
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p>No upcoming appointments found in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}
