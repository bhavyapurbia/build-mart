import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  Truck,
  HardHat,
  IndianRupee,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import api from '../../utils/api';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/admin/overview');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading operations dashboard...</div>;
  }

  const { metrics, lowStockProducts = [], recentOrders = [], recentMaterialRequests = [] } = data || {};

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
          Operations Overview
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
          Live metrics for materials inventory, customer quotations, site labour, and order fulfillment
        </p>
      </div>

      {/* KPI Cards Grid (All 9 requested metrics) */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Total Sales</div>
            <div className="kpi-val" style={{ color: '#0F172A' }}>₹{metrics?.totalSales?.toLocaleString('en-IN') || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Pending Material Requests</div>
            <div className="kpi-val" style={{ color: '#D97706' }}>{metrics?.pendingMaterialRequests || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Total Orders</div>
            <div className="kpi-val">{metrics?.totalOrders || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Pending Quotations</div>
            <div className="kpi-val" style={{ color: '#0284C7' }}>{metrics?.pendingQuotations || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Bulk Project Enquiries</div>
            <div className="kpi-val">{metrics?.bulkEnquiries || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <Truck size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Labour Booking Requests</div>
            <div className="kpi-val">{metrics?.labourRequests || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#FFF7ED', color: '#EA580C' }}>
            <HardHat size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Active Catalog Materials</div>
            <div className="kpi-val">{metrics?.totalProducts || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#F1F5F9', color: '#475569' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Registered Contractors</div>
            <div className="kpi-val">{metrics?.totalCustomers || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#F1F5F9', color: '#475569' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Low Stock Alert</div>
            <div className="kpi-val" style={{ color: '#DC2626' }}>{metrics?.lowStockCount || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Material Requests & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Recent Material Requests (Core Workflow) */}
        <div className="admin-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Recent Customer Material Requests
            </h3>
            <Link to="/admin/material-requests" style={{ fontSize: '12.5px', color: '#D97706', fontWeight: 700 }}>
              View All Requests
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentMaterialRequests.map(req => (
                <tr key={req._id}>
                  <td><strong>{req.requestId}</strong></td>
                  <td>
                    <div>{req.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{req.customer?.city}</div>
                  </td>
                  <td>{req.items?.length || 0} products</td>
                  <td>
                    <span className={`badge-status ${req.status === 'Quotation Sent' ? 'badge-sent' : 'badge-pending'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      to="/admin/material-requests"
                      style={{ fontSize: '12px', color: '#2563EB', fontWeight: 700 }}
                    >
                      Process Quote →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#DC2626' }}>
              ⚠️ Low Stock Warnings
            </h3>
            <Link to="/admin/inventory" style={{ fontSize: '12.5px', color: '#D97706', fontWeight: 700 }}>
              Manage Stock
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Available</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.slice(0, 6).map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span style={{ color: '#DC2626', fontWeight: 800 }}>{p.stock}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748B' }}>{p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

