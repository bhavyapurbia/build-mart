import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/customers');
        const payload = res.data?.data || res.data;
        const list = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.customers)
            ? payload.customers
            : (Array.isArray(res.data?.customers) ? res.data.customers : []));
        setCustomers(list);
      } catch (err) {
        showToast('Error loading customers', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
          Registered Contractor & Customer Directory
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
          Manage buyer profiles, saved site locations, and purchase activity
        </p>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Details</th>
              <th>Site Addresses</th>
              <th>Account Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(customers) || customers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted)', fontSize: '13.5px' }}>
                  No registered customers found.
                </td>
              </tr>
            ) : (
              customers.map(c => (
              <tr key={c._id}>
                <td>
                  <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>{c.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 700 }}>
                    ID: #{c._id?.slice(-6)}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '13px' }}>{c.email}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{c.phone || 'No phone recorded'}</div>
                </td>
                <td>
                  <div style={{ fontSize: '12px', color: 'var(--text-sub)', maxWidth: '240px' }}>
                    {c.addresses?.[0] ? `${c.addresses[0].street}, ${c.addresses[0].city} (${c.addresses[0].pincode})` : 'Default site not set'}
                  </div>
                </td>
                <td style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span className="badge-status badge-confirmed">Active</span>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;

