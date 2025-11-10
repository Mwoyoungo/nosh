/**
 * Bottom Navigation Bar
 * Navigation between Feed, Explore, and Profile pages
 * Auto-hides on scroll down, shows on scroll up
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { CSSProperties, useState, useEffect, useRef } from 'react';
import { Icons } from '@/theme';

interface BottomNavProps {
  hide?: boolean;
}

const BottomNav = ({ hide = false }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Icons.Home, label: 'Feed' },
    { path: '/explore', icon: Icons.Location, label: 'Explore' },
    { path: '/messages', icon: Icons.Messages, label: 'Messages' },
    { path: '/profile', icon: Icons.Profile, label: 'Profile' },
  ];

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: hide ? '-50px' : 0,
    left: 0,
    right: 0,
    height: '50px',
    backgroundColor: 'var(--dark-card)',
    borderTop: '1px solid var(--dark-border)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 10px',
    zIndex: 1000,
    transition: 'bottom 0.3s ease',
  };

  const navItemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '4px 12px',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    color: isActive ? 'var(--coral-400)' : 'var(--text-secondary)',
  });

  const labelStyle: CSSProperties = {
    fontSize: '10px',
    fontWeight: '500',
  };

  return (
    <nav style={containerStyle}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <button
            key={item.path}
            style={{
              ...navItemStyle(isActive),
              background: 'none',
              border: 'none',
            }}
            onClick={() => navigate(item.path)}
          >
            <Icon size={20} color={isActive ? 'var(--coral-400)' : 'var(--text-secondary)'} />
            <span style={labelStyle}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
