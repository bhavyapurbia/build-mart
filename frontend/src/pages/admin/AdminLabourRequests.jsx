import React, { useState, useEffect } from 'react';
import { HardHat, Users, CheckCircle, Clock, MapPin, X, Plus } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminLabourRequests = () => {
  const [labourList, setLabourList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [charges, setCharges] = useState(0);
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [status, setStatus] = useState('Assigned');

  const { showToast } = useNotification();

  const loadLabour = async () => {
    setLoading(true);
    try {
      const res = await api.get('/labour-requests/admin/all');
      setLabourList(res.data || []);
    } catch (err) {
      showToast('Error loading labour bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabour();
  }, []);

  const handleOpenAssign = (booking) => {
    setSelectedBooking(booking);
    setCharges(booking.labourCharges || 2400);
    setStatus(booking.status === 'Pending Review' ? 'Assigned' : booking.status);
    setWorkerName(booking.assignedWorkers?.[0]?.name || '');
    setWorkerPhone(booking.assignedWorkers?.[0]?.phone || '');
    setIsAssignModalOpen(true);
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const assignedWorkers = workerName ? [{
        name: workerName,
        phone: workerPhone,
        trade: selectedBooking.labourType
      }] : selectedBooking.assignedWorkers || [];

      await api.put(`/labour-requests/admin/${selectedBooking._id}`, {
        labourCharges: Number(charges),
        status,
        assignedWorkers
      });

      showToast('Labour booking updated and workers assigned!', 'success');
      setIsAssignModalOpen(false);
      loadLabour();
    } catch (err) {
      showToast('Error updating labour booking', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Labour Workforce Management
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Review site trade requests, calculate labour charges, and assign verified worker squads
          </p>
        </div>
        <button onClick={loadLabour} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Refresh Bookings
        </button>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Trade & Team Size</th>
              <th>Site Location</th>
              <th>Start Date / Duration</th>
              <th>Charges (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labourList.map(b => (
              <tr key={b._id}>
                <td><strong>{b.bookingId}</strong></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.customer?.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{b.customer?.phone}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HardHat size={15} color="#D97706" />
                    <strong>{b.labourType}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{b.workersRequired} worker(s)</div>
                </td>
                <td>
                  <div style={{ maxWidth: '160px', fontSize: '12.5px' }}>
                    {b.customer?.workLocation}, <strong>{b.customer?.city}</strong>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12.5px' }}>{b.preferredStartDate}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Duration: {b.expectedDuration}</div>
                </td>
                <td>
                  <strong style={{ color: '#0F172A' }}>
                    {b.labourCharges > 0 ? `₹${b.labourCharges.toLocaleString('en-IN')}` : 'To Be Quoted'}
                  </strong>
                </td>
                <td>
                  <span className={`badge-status ${b.status === 'Assigned' ? 'badge-confirmed' : 'badge-pending'}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleOpenAssign(b)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <span>Assign & Set Rates</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isAssignModalOpen && selectedBooking && (
        <div className="modal-backdrop" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                Manage Labour Booking #{selectedBooking.bookingId}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAssign}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>Trade:</strong> {selectedBooking.labourType} ({selectedBooking.workersRequired} workers)<br />
                  <strong>Site:</strong> {selectedBooking.customer?.workLocation}, {selectedBooking.customer?.city}<br />
                  <strong>Instructions:</strong> {selectedBooking.additionalInstructions || 'Standard site work'}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Labour Service Charges (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={charges}
                    onChange={e => setCharges(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Lead Mason / Plumber Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={workerName}
                      onChange={e => setWorkerName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Worker Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98111 22334"
                      value={workerPhone}
                      onChange={e => setWorkerPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Booking Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', background: '#FFFFFF' }}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Quoted">Quoted to Customer</option>
                    <option value="Assigned">Assigned & Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn-secondary" style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLabourRequests;

