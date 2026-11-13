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
        setData(res.data?.data || res.data);
      } catch (err) {
        console.error('Error fetching admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-muted)' }}>Loading operations dashboard...</div>;
  }

  const { metrics, lowStockProducts = [], recentOrders = [], recentMaterialRequests = [] } = data || {};

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
          Operations Overview
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
          Live metrics for materials inventory, customer quotations, site labour, and order fulfillment
        </p>
      </div>

      {/* KPI Cards Grid (All 9 requested metrics) */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Total Sales</div>
            <div className="kpi-val" style={{ color: 'var(--color-ink)' }}>₹{metrics?.totalSales?.toLocaleString('en-IN') || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--accent-green-light)', color: 'var(--color-success)' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Pending Material Requests</div>
            <div className="kpi-val" style={{ color: 'var(--primary-dark)' }}>{metrics?.pendingMaterialRequests || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Total Orders</div>
            <div className="kpi-val">{metrics?.totalOrders || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Pending Quotations</div>
            <div className="kpi-val" style={{ color: 'var(--accent-blue)' }}>{metrics?.pendingQuotations || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Bulk Project Enquiries</div>
            <div className="kpi-val">{metrics?.bulkEnquiries || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--color-paper-3)', color: 'var(--secondary)' }}>
            <Truck size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Labour Booking Requests</div>
            <div className="kpi-val">{metrics?.labourRequests || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--primary-deep)' }}>
            <HardHat size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Active Catalog Materials</div>
            <div className="kpi-val">{metrics?.totalProducts || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--color-paper-3)', color: 'var(--text-sub)' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Registered Contractors</div>
            <div className="kpi-val">{metrics?.totalCustomers || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--color-paper-3)', color: 'var(--text-sub)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontWeight: 600 }}>Low Stock Alert</div>
            <div className="kpi-val" style={{ color: 'var(--color-error)' }}>{metrics?.lowStockCount || 0}</div>
          </div>
          <div className="kpi-icon" style={{ background: 'var(--accent-red-light)', color: 'var(--color-error)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Material Requests & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Recent Material Requests (Core Workflow) */}
        <div className="admin-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>
              Recent Customer Material Requests
            </h3>
            <Link to="/admin/material-requests" style={{ fontSize: '12.5px', color: 'var(--primary-dark)', fontWeight: 700 }}>
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
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{req.customer?.city}</div>
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
                      style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 700 }}
                    >
                      Process Quote
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-error)' }}>
              Low Stock Warnings
            </h3>
            <Link to="/admin/inventory" style={{ fontSize: '12.5px', color: 'var(--primary-dark)', fontWeight: 700 }}>
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
                    <span style={{ color: 'var(--color-error)', fontWeight: 800 }}>{p.stock}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{p.unit}</td>
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

