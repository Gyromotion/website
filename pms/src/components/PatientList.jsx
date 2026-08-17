import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients } from '../lib/storage';
import { Plus, Search, Eye, ArrowUpDown } from 'lucide-react';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'startDate') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    } else if (sortConfig.key === 'paymentReceived') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Patients Directory</h1>
        <Link to="/patients/new" className="btn btn-primary">
          <Plus size={18} /> Add Patient
        </Link>
      </div>

      <div className="card glass-panel mb-6">
        <div className="flex items-center gap-2 mb-4" style={{ maxWidth: '400px' }}>
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search patients by name or phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted">Loading patients...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>Phone <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th onClick={() => handleSort('diagnosis')} style={{ cursor: 'pointer' }}>Diagnosis / Condition <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th onClick={() => handleSort('startDate')} style={{ cursor: 'pointer' }}>Added Date <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th onClick={() => handleSort('addedBy')} style={{ cursor: 'pointer' }}>Added By <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th onClick={() => handleSort('packageDays')} style={{ cursor: 'pointer' }}>Package <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th onClick={() => handleSort('paymentReceived')} style={{ cursor: 'pointer' }}>Status <ArrowUpDown size={14} className="inline ml-1 text-muted" /></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.length > 0 ? (
                  sortedPatients.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '500' }}>{p.name}</td>
                      <td>{p.phone}</td>
                      <td className="text-muted">{p.diagnosis || p.condition}</td>
                      <td className="text-sm text-muted">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}</td>
                      <td className="text-sm text-muted">{p.addedBy || 'Owner'}</td>
                      <td>
                        {p.packageDays === 'daily' ? 'Pay Daily' : (
                          <span className={`badge ${p.sessions?.length >= Number(p.packageDays) ? 'badge-success' : 'badge-warning'}`}>
                            {p.sessions?.length >= Number(p.packageDays) ? `${p.packageDays} Days (Completed)` : `${p.packageDays} Days (${p.sessions?.length || 0} done)`}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${p.paymentReceived ? 'badge-success' : 'badge-warning'}`}>
                          {p.paymentReceived ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/patients/${p.id}`} className="btn btn-outline" style={{ padding: '0.375rem 0.75rem' }}>
                          <Eye size={16} /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
