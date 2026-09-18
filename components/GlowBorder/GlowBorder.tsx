import { PropsWithChildren } from 'react';
import './GlowBorder.css';

interface GlowBorderProps {
  className?: string;
}

export function GlowBorder({ children, className = '' }: PropsWithChildren<GlowBorderProps>) {
  return (
    <div className={`glow-wrapper ${className}`}>
      <div className="glow-inner">{children}</div>
    </div>
  );
}