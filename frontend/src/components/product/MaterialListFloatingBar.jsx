import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { useMaterialList } from '../../context/MaterialListContext';

const MaterialListFloatingBar = () => {
  const { materialCount, items } = useMaterialList();
  const location = useLocation();

  // Hide on material list page or checkout
  if (materialCount === 0 || location.pathname === '/material-list' || location.pathname === '/checkout') {
    return null;
  }

  return (
    <div className="floating-material-bar">
      <div className="floating-bar-info">
        <ClipboardList size={22} color="#F59E0B" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="floating-count-badge">{materialCount}</span>
            <strong style={{ fontSize: '13.5px' }}>Material{materialCount > 1 ? 's' : ''} Selected</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            Click to set quantities & get verified quotation
          </div>
        </div>
      </div>

      <Link to="/material-list" className="floating-btn-review">
        <span>Review Material List</span>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
};

export default MaterialListFloatingBar;

