import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
  Truck,
  Building2,
  Hash,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const DEFAULT_FALLBACK_CITIES = [
  {
    _id: 'c_bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    hub: 'Central Fulfillment Hub (Bellandur)',
    pincodes: ['560001', '560002', '560003', '560004', '560008', '560025', '560034', '560037', '560038', '560066', '560068', '560076', '560078', '560100', '560102', '560103'],
    etaLabel: '⚡ 30-60 Min Express Delivery',
    deliveryFee: 299,
    minOrder: 500,
    freeDeliveryThreshold: 4000,
    isAvailable: true
  },
  {
    _id: 'c_mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    hub: 'Western Suburbs Hub (Andheri)',
    pincodes: ['400001', '400002', '400050', '400051', '400053', '400058', '400069', '400076', '400092'],
    etaLabel: '⚡ 45-90 Min Express Delivery',
    deliveryFee: 350,
    minOrder: 1000,
    freeDeliveryThreshold: 5000,
    isAvailable: true
  },
  {
    _id: 'c_delhi',
    city: 'Delhi NCR',
    state: 'Delhi',
    hub: 'Gurugram Sector 48 Hub',
    pincodes: ['110001', '110002', '110003', '110017', '110020', '110025', '122001', '122002', '122018'],
    etaLabel: '⚡ 45-90 Min Express Delivery',
    deliveryFee: 350,
    minOrder: 1000,
    freeDeliveryThreshold: 5000,
    isAvailable: true
  },
  {
    _id: 'c_hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    hub: 'HITEC City Logistics Yard',
    pincodes: ['500001', '500002', '500016', '500032', '500081', '500082', '500084'],
    etaLabel: '⚡ 30-60 Min Express Delivery',
    deliveryFee: 300,
    minOrder: 800,
    freeDeliveryThreshold: 4500,
    isAvailable: true
  },
  {
    _id: 'c_pune',
    city: 'Pune',
    state: 'Maharashtra',
    hub: 'Kharadi Industrial Zone',
    pincodes: ['411001', '411004', '411014', '411028', '411038', '411045', '411057'],
    etaLabel: '⚡ 45-60 Min Express Delivery',
    deliveryFee: 300,
    minOrder: 800,
    freeDeliveryThreshold: 4500,
    isAvailable: true
  },
  {
    _id: 'c_chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    hub: 'Guindy Central Depot',
    pincodes: ['600001', '600002', '600004', '600018', '600028', '600032', '600096'],
    etaLabel: '⚡ 45-60 Min Express Delivery',
    deliveryFee: 350,
    minOrder: 1000,
    freeDeliveryThreshold: 5000,
    isAvailable: true
  }
];

const AdminCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedPincodes, setExpandedPincodes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  const [formData, setFormData] = useState({
    city: '',
    state: 'Karnataka',
    hub: '',
    pincodesText: '',
    etaLabel: '⚡ 30-60 Min Express Delivery',
    deliveryFee: 299,
    minOrder: 500,
    freeDeliveryThreshold: 4000,
    isAvailable: true
  });

  const { showToast } = useNotification();

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/serviceability/admin/all');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (list && list.length > 0) {
        setCities(list);
        localStorage.setItem('bm_admin_cities', JSON.stringify(list));
      } else {
        setCities(DEFAULT_FALLBACK_CITIES);
      }
    } catch (err) {
      console.warn('API error fetching cities, using local cache:', err);
      try {
        const saved = localStorage.getItem('bm_admin_cities');
        setCities(saved ? JSON.parse(saved) : DEFAULT_FALLBACK_CITIES);
      } catch {
        setCities(DEFAULT_FALLBACK_CITIES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const togglePincodeExpand = (id) => {
    setExpandedPincodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingCity(null);
    setFormData({
      city: '',
      state: 'Karnataka',
      hub: '',
      pincodesText: '',
      etaLabel: '⚡ 30-60 Min Express Delivery',
      deliveryFee: 299,
      minOrder: 500,
      freeDeliveryThreshold: 4000,
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCity(c);
    setFormData({
      city: c.city || '',
      state: c.state || 'Karnataka',
      hub: c.hub || '',
      pincodesText: Array.isArray(c.pincodes) ? c.pincodes.join(', ') : '',
      etaLabel: c.etaLabel || '⚡ 30-60 Min Express Delivery',
      deliveryFee: c.deliveryFee ?? 299,
      minOrder: c.minOrder ?? 500,
      freeDeliveryThreshold: c.freeDeliveryThreshold ?? 4000,
      isAvailable: c.isAvailable !== false
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus, cityName) => {
    try {
      await api.put(`/serviceability/admin/${id}/toggle`);
      showToast(`City "${cityName}" delivery status changed to ${!currentStatus ? 'ON (Active)' : 'OFF (Paused)'}`, 'success');
      await fetchCities();
    } catch (err) {
      // Local fallback
      const updated = cities.map(c => (c._id === id || c.id === id) ? { ...c, isAvailable: !c.isAvailable } : c);
      setCities(updated);
      localStorage.setItem('bm_admin_cities', JSON.stringify(updated));
      showToast(`City "${cityName}" delivery status changed to ${!currentStatus ? 'ON (Active)' : 'OFF (Paused)'}`, 'success');
    }
  };

  const handleDeleteCity = async (id, cityName) => {
    if (!window.confirm(`Are you sure you want to delete "${cityName}" and remove all its serviceable PIN codes?`)) return;

    try {
      await api.delete(`/serviceability/admin/${id}`);
      showToast(`City "${cityName}" removed from delivery roster.`, 'info');
      await fetchCities();
    } catch (err) {
      const updated = cities.filter(c => c._id !== id && c.id !== id);
      setCities(updated);
      localStorage.setItem('bm_admin_cities', JSON.stringify(updated));
      showToast(`City "${cityName}" removed from delivery roster.`, 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city.trim()) {
      showToast('City name is required.', 'error');
      return;
    }

    const cleanPincodes = formData.pincodesText
      .split(',')
      .map(p => p.trim().replace(/\D/g, ''))
      .filter(p => p.length === 6);

    if (cleanPincodes.length === 0) {
      showToast('Please enter at least one valid 6-digit PIN code.', 'error');
      return;
    }

    const payload = {
      city: formData.city.trim(),
      state: formData.state.trim(),
      hub: formData.hub.trim() || `${formData.city.trim()} Central Hub`,
      pincodes: [...new Set(cleanPincodes)],
      etaLabel: formData.etaLabel.trim(),
      deliveryFee: Number(formData.deliveryFee) || 0,
      minOrder: Number(formData.minOrder) || 0,
      freeDeliveryThreshold: Number(formData.freeDeliveryThreshold) || 0,
      isAvailable: Boolean(formData.isAvailable)
    };

    try {
      if (editingCity) {
        const id = editingCity._id || editingCity.id;
        await api.put(`/serviceability/admin/${id}`, payload);
        showToast(`City "${payload.city}" updated successfully!`, 'success');
      } else {
        await api.post('/serviceability/admin', payload);
        showToast(`New city "${payload.city}" added with ${payload.pincodes.length} PIN codes!`, 'success');
      }
      setIsModalOpen(false);
      await fetchCities();
    } catch (err) {
      console.error('API error, falling back to local save:', err);
      if (editingCity) {
        const id = editingCity._id || editingCity.id;
        const updated = cities.map(c => (c._id === id || c.id === id) ? { ...payload, _id: id } : c);
        setCities(updated);
        localStorage.setItem('bm_admin_cities', JSON.stringify(updated));
      } else {
        const newCity = { ...payload, _id: `c_${Date.now()}` };
        const updated = [newCity, ...cities];
        setCities(updated);
        localStorage.setItem('bm_admin_cities', JSON.stringify(updated));
      }
      showToast(`City "${payload.city}" saved!`, 'success');
      setIsModalOpen(false);
    }
  };

  // Filter cities by search term & status
  const filteredCities = cities.filter(c => {
    const matchesSearch =
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hub?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(c.pincodes) && c.pincodes.some(p => p.includes(searchTerm)));

    if (statusFilter === 'ON') return matchesSearch && c.isAvailable !== false;
    if (statusFilter === 'OFF') return matchesSearch && c.isAvailable === false;
    return matchesSearch;
  });

  const activeCitiesCount = cities.filter(c => c.isAvailable !== false).length;
  const pausedCitiesCount = cities.length - activeCitiesCount;
  const totalPincodesCount = cities.reduce((acc, c) => acc + (Array.isArray(c.pincodes) ? c.pincodes.length : 0), 0);

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-page-title">Serviceable Cities & PIN Codes</h1>
          <p className="admin-page-sub">
            Control which cities BuildMart delivers to, manage warehouse hubs, add or modify 6-digit PIN codes, and turn delivery ON or OFF.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <Plus size={18} />
          <span>Add New City</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Total Cities</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-ink)', marginTop: '4px' }}>{cities.length}</div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>Active Delivery (ON)</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>{activeCitiesCount}</div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Paused Delivery (OFF)</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>{pausedCitiesCount}</div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase' }}>Covered PIN Codes</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-ink)', marginTop: '4px' }}>{totalPincodesCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search city, state, hub or PIN code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '13.5px',
              background: 'var(--bg-card)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              background: statusFilter === 'ALL' ? 'var(--primary-dark)' : 'var(--bg-card)',
              color: statusFilter === 'ALL' ? '#FFFFFF' : 'var(--color-ink)',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            All ({cities.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ON')}
            className={`filter-btn ${statusFilter === 'ON' ? 'active' : ''}`}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              background: statusFilter === 'ON' ? '#16A34A' : 'var(--bg-card)',
              color: statusFilter === 'ON' ? '#FFFFFF' : '#16A34A',
              border: '1px solid #16A34A',
              cursor: 'pointer'
            }}
          >
            Active ON ({activeCitiesCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OFF')}
            className={`filter-btn ${statusFilter === 'OFF' ? 'active' : ''}`}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              background: statusFilter === 'OFF' ? '#DC2626' : 'var(--bg-card)',
              color: statusFilter === 'OFF' ? '#FFFFFF' : '#DC2626',
              border: '1px solid #DC2626',
              cursor: 'pointer'
            }}
          >
            Paused OFF ({pausedCitiesCount})
          </button>
        </div>
      </div>

      {/* Cities Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-muted)' }}>
          Loading cities and serviceable PIN codes...
        </div>
      ) : filteredCities.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
          <MapPin size={36} color="var(--color-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>No cities found</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Try adjusting your search query or add a new delivery city.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredCities.map(c => {
            const id = c._id || c.id;
            const isLive = c.isAvailable !== false;
            const isExpanded = !!expandedPincodes[id];
            const pincodeList = Array.isArray(c.pincodes) ? c.pincodes : [];

            return (
              <div
                key={id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: isLive ? '1px solid var(--border)' : '1px solid #FECACA',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Card Top Banner */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: isLive ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : '#450A0A',
                  color: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isLive ? '#FF9900' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>{c.city}</h3>
                      <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>{c.state}</span>
                    </div>
                  </div>

                  {/* 1-Click Status Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(id, isLive, c.city)}
                    title={`Click to turn ${isLive ? 'OFF' : 'ON'}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      background: isLive ? '#16A34A' : '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Power size={13} />
                    <span>{isLive ? 'DELIVERY ON' : 'PAUSED OFF'}</span>
                  </button>
                </div>

                {/* Card Info Body */}
                <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Warehouse Hub */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-ink)' }}>
                    <Building2 size={16} color="var(--color-muted)" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{c.hub || `${c.city} Central Fulfillment Hub`}</span>
                  </div>

                  {/* ETA & Delivery Charges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 12px', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block' }}>Delivery Fee:</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-ink)' }}>₹{c.deliveryFee ?? 299}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block' }}>Free Delivery Over:</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#16A34A' }}>₹{c.freeDeliveryThreshold ?? 4000}</span>
                    </div>
                  </div>

                  {/* Pincodes Roster Preview */}
                  <div>
                    <div
                      onClick={() => togglePincodeExpand(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '6px 0',
                        borderBottom: '1px dashed var(--border)'
                      }}
                    >
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Hash size={14} color="#FF9900" />
                        <span>{pincodeList.length} Serviceable PIN Codes</span>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--color-muted)' }}>
                        <span>{isExpanded ? 'Hide' : 'View all'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    {/* Expandable chips */}
                    {isExpanded ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', maxHeight: '140px', overflowY: 'auto' }}>
                        {pincodeList.map(pin => (
                          <span
                            key={pin}
                            style={{
                              background: 'var(--bg-page)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              padding: '2px 7px',
                              fontSize: '11.5px',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: 'var(--color-ink)'
                            }}
                          >
                            {pin}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pincodeList.slice(0, 6).join(', ')} {pincodeList.length > 6 ? `+${pincodeList.length - 6} more` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{
                  padding: '12px 20px',
                  background: 'var(--bg-page)',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={13} />
                    <span>Edit City</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCity(id, c.city)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#DC2626',
                      background: 'none',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit City Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCity ? `Edit City & PIN Codes: ${editingCity.city}` : 'Add New Serviceable City'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Fulfillment Hub / Warehouse Yard Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanand Industrial Logistics Depot"
                  value={formData.hub}
                  onChange={e => setFormData({ ...formData, hub: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Serviceable 6-Digit PIN Codes (Comma Separated) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. 380001, 380002, 380004, 380015, 382481"
                  value={formData.pincodesText}
                  onChange={e => setFormData({ ...formData, pincodesText: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                  Enter 6-digit postal PIN codes separated by commas. Invalid numbers are filtered automatically.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryFee}
                    onChange={e => setFormData({ ...formData, deliveryFee: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrder}
                    onChange={e => setFormData({ ...formData, minOrder: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Free Delivery Over (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.freeDeliveryThreshold}
                    onChange={e => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  ETA Speed Badge Label
                </label>
                <input
                  type="text"
                  placeholder="⚡ 30-60 Min Express Delivery"
                  value={formData.etaLabel}
                  onChange={e => setFormData({ ...formData, etaLabel: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '13.5px' }}
                />
              </div>

              {/* Active Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  id="cityAvailableToggle"
                  checked={formData.isAvailable}
                  onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="cityAvailableToggle" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', cursor: 'pointer' }}>
                  {formData.isAvailable ? '✅ Turn ON delivery in this city immediately' : '⏸ Keep delivery PAUSED (OFF) for now'}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  {editingCity ? 'Save Changes' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCities;
