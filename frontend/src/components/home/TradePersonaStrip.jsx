import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Paintbrush, Hammer, Building2, Grid, Layers } from 'lucide-react';

const TRADES = [
  { id: 'all', label: 'All', icon: Wrench, category: '' },
  { id: 'plumber', label: 'Plumber', icon: Wrench, category: 'CPVC, PVC & GI Fittings' },
  { id: 'painter', label: 'Painter', icon: Paintbrush, category: 'Waterproofing' },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer, category: 'Hardware & Locks' },
  { id: 'civil', label: 'Civil / Mason', icon: Building2, category: 'Cement & Steel' },
  { id: 'tiler', label: 'Tiler', icon: Grid, category: 'Tiles & Adhesives' }
];

const TradePersonaStrip = ({ activeTrade = 'all', onSelectTrade }) => {
  const [selected, setSelected] = useState(activeTrade);
  const navigate = useNavigate();

  const handleTradeClick = (trade) => {
    setSelected(trade.id);
    if (onSelectTrade) {
      onSelectTrade(trade);
    } else if (trade.category) {
      navigate(`/products?category=${encodeURIComponent(trade.category)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <section className="trade-persona-strip-section">
      <div className="container">
        <div className="trade-persona-scroll">
          {TRADES.map(t => {
            const IconComponent = t.icon;
            const isActive = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`trade-persona-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTradeClick(t)}
              >
                <div className="trade-persona-icon-box">
                  <IconComponent size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                </div>
                <span className="trade-persona-label">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TradePersonaStrip;

