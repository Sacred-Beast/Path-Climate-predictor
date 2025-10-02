import React from 'react';
import './Skeleton.css';

export default function Skeleton({ height = 16, width = '100%', style = {} }) {
  const h = typeof height === 'number' ? `${height}px` : height;
  return <div className="skeleton" style={{ width, height: h, ...style }} />;
}
