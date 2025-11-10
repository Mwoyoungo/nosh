/**
 * Simple SVG Icon System
 * Clean, minimal icons using inline SVG
 */

import { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

const defaultProps = {
  size: 24,
  color: 'currentColor',
  className: '',
  style: {},
};

// Home Icon
const HomeIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12h6v10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// User/Profile Icon
const UserIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Heart Icon
const HeartIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Message/Chat Icon
const MessageIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Add/Plus Icon
const AddIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Search Icon
const SearchIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/>
    <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Mail Icon
const MailIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2"/>
    <path d="m2 7 10 7 10-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Location Icon
const LocationIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);

// Settings Icon
const SettingsIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Edit Icon
const EditIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Close Icon
const CloseIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Star Icon
const StarIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Fire Icon
const FireIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Grid Icon
const GridIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2"/>
  </svg>
);

// Camera Icon
const CameraIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2"/>
  </svg>
);

// Play Icon
const PlayIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M10 8l6 4-6 4V8z" fill={color}/>
  </svg>
);

// Arrow Right Icon
const ArrowRightIcon = ({ size = 24, color = 'currentColor', className = '', style = {} }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Export all icons
export const Icons = {
  Home: HomeIcon,
  Profile: UserIcon,
  User: UserIcon,
  Heart: HeartIcon,
  Messages: MessageIcon,
  Add: AddIcon,
  Search: SearchIcon,
  Mail: MailIcon,
  Location: LocationIcon,
  Settings: SettingsIcon,
  Edit: EditIcon,
  Close: CloseIcon,
  Star: StarIcon,
  Fire: FireIcon,
  Grid: GridIcon,
  Camera: CameraIcon,
  Play: PlayIcon,
  ArrowRight: ArrowRightIcon,
  Restaurant: GridIcon,  // Reuse Grid for Restaurant
  Service: SettingsIcon, // Reuse Settings for Service
};

export default Icons;
