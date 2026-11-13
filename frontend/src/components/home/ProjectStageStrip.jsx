import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Layers, ShieldCheck, Wrench, Lock, Bath, Hammer, Camera, Paintbrush } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORY_ITEMS = [
  {
    name: 'Foundation & Steel',
    category: 'Cement & Steel',
    icon: Building2
  },
  {
    name: 'Asian & Birla Paint',
    category: 'Paints & Wall Care',
    icon: Paintbrush
  },
  {
    name: 'Bricks & Sand',
    category: 'Construction Materials',
    icon: Layers
  },
  {
    name: 'Waterproofing',
    category: 'Waterproofing',
    icon: ShieldCheck
  },
  {
    name: 'Plumbing & Pipes',
    category: 'CPVC, PVC & GI Fittings',
    icon: Wrench
  },
  {
    name: 'Tiles & Grout',
    category: 'Tiles & Adhesives',
    icon: Layers
  },
  {
    name: 'Wood & Hardware',
    category: 'Wood and Hardware',
    icon: Lock
  },
  {
    name: 'Bath & Sanitary',
    category: 'Bathware',
    icon: Bath
  },
  {
    name: 'Tools & Accessories',
    category: 'Tools & Accessories',
    icon: Hammer
  }
];

const ProjectStageStrip = ({ onOpenPaperList }) => {
  const { t } = useLanguage();

  return (
    <section className="project-stage-section sticky-category-nav" id="sticky-trade-categories-nav">
      <div className="container">
        {/* Horizontal Scrollable Categories Pills Navbar (Sticky on Scroll) */}
        <div className="project-stages-scroller">
          {CATEGORY_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={`/products?category=${encodeURIComponent(item.category)}`}
                className="project-stage-pill"
              >
                <div className="stage-icon-circle">
                  <Icon size={17} color="#D97706" />
                </div>
                <div className="stage-text-block">
                  <span className="stage-name-text">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectStageStrip;
