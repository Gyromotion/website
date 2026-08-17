import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { adminAuth, createUserWithEmailAndPassword } from '../lib/adminAuth';
import { Shield, UserPlus } from 'lucide-react';

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const usersList = [];
      snap.forEach(doc => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setStaff(usersList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    
    try {
      // Create user in secondary auth instance
      const userCred = await createUserWithEmailAndPassword(adminAuth, email, password);
      
      // Save profile to firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        role: 'worker',
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      alert("Doctor account created successfully!");
      loadStaff();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      await setDoc(doc(db, 'users', user.id), { isActive: !user.isActive }, { merge: true });
      loadStaff();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-primary" />
        <h1>Manage Staff</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card glass-panel">
            <h3 className="mb-4 flex items-center gap-2"><UserPlus size={20} /> Add New Doctor</h3>
            {error && <div className="mb-4 text-sm text-danger">{error}</div>}
            <form onSubmit={handleCreateUser}>
              <div className="form-group mb-4">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={creating}>
                {creating ? 'Creating...' : 'Create Doctor Account'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card glass-panel">
            <h3 className="mb-4">Clinic Staff</h3>
            {loading ? <p>Loading...</p> : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(user => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: '500' }}>{user.name}</td>
                        <td className="text-muted">{user.email}</td>
                        <td><span className="badge" style={{ backgroundColor: user.role === 'admin' ? '#fef3c7' : '#e0e7ff', color: user.role === 'admin' ? '#d97706' : '#4338ca', textTransform: 'capitalize' }}>{user.role === 'worker' ? 'Doctor' : user.role}</span></td>
                        <td>
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {user.role !== 'admin' && (
                            <button onClick={() => handleToggleActive(user)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
