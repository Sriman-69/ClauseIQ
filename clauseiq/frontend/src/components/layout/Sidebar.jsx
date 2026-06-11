import React from 'react';
import { FileText, LayoutDashboard, SplitSquareHorizontal, Download, Activity, Settings, ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import { cn } from '../../lib/utils';
import './layout.css';

const Sidebar = ({ isCollapsed, setIsCollapsed, activeRoute, setActiveRoute }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'comparison', label: 'Comparison', icon: SplitSquareHorizontal },
    { id: 'exports', label: 'Exports', icon: Download },
    { id: 'metrics', label: 'System Metrics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="layout-sidebar" style={{ width: isCollapsed ? '72px' : '280px' }}>
      <div className="sidebar-logo">
        <Scale size={24} color="var(--brand-primary)" />
        {!isCollapsed && <span>ClauseIQ</span>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={cn('sidebar-item', activeRoute === item.id && 'active')}
            onClick={() => setActiveRoute(item.id)}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-toggle">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
