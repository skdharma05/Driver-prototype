import React from 'react';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';

const TruckIcon = ({ category = 'open', size = 36, color = '#374151' }) => {
  // Different SVG shape per category
  const icons = {
    open: (        // flat open body truck
      <Svg width={size} height={size * 0.6} viewBox="0 0 60 36">
        <Rect x="2"  y="10" width="35" height="18" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Rect x="37" y="16" width="20" height="12" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="12" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="48" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Line x1="2" y1="10" x2="2" y2="10" stroke={color} strokeWidth="2"/>
      </Svg>
    ),
    container: (   // closed container truck
      <Svg width={size} height={size * 0.6} viewBox="0 0 60 36">
        <Rect x="2"  y="8"  width="35" height="20" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Rect x="37" y="14" width="20" height="14" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="12" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="48" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Line x1="2" y1="14" x2="37" y2="14" stroke={color} strokeWidth="1.5"/>
      </Svg>
    ),
    lcv: (         // smaller LCV
      <Svg width={size * 0.8} height={size * 0.6} viewBox="0 0 48 36">
        <Rect x="2"  y="10" width="24" height="16" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Rect x="26" y="14" width="18" height="12" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="10" cy="28" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="38" cy="28" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
      </Svg>
    ),
    mini: (        // small pickup/tata ace
      <Svg width={size * 0.7} height={size * 0.6} viewBox="0 0 40 36">
        <Rect x="2"  y="12" width="18" height="14" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Rect x="20" y="16" width="16" height="10" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="9"  cy="28" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="31" cy="28" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
      </Svg>
    ),
    trailer: (     // long trailer
      <Svg width={size * 1.2} height={size * 0.6} viewBox="0 0 72 36">
        <Rect x="2"  y="10" width="48" height="18" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Rect x="50" y="14" width="18" height="14" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="12" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="28" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="60" cy="30" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
      </Svg>
    ),
    industrial: (  // tanker / bulker shape
      <Svg width={size} height={size * 0.6} viewBox="0 0 60 36">
        <Rect x="2"  y="12" width="35" height="14" rx="7" stroke={color} strokeWidth="2.5" fill="none"/>
        <Rect x="37" y="16" width="20" height="10" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="12" cy="28" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
        <Circle cx="48" cy="28" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
      </Svg>
    ),
  };
  return icons[category] || icons.open;
};

export default TruckIcon;
