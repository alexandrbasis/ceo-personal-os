'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * InfoTooltip - A refined tooltip component with (i) icon
 * Features:
 * - Hover to reveal on desktop
 * - Tap to toggle on mobile
 * - Smooth animations with scale and fade
 * - Accessible with proper ARIA attributes
 */
export function InfoTooltip({
  content,
  className,
  iconClassName,
  side = 'top',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Detect touch device on mount
  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTouchDevice) {
      setIsOpen((prev) => !prev);
    }
  };

  // Close on outside click for touch devices
  React.useEffect(() => {
    if (!isTouchDevice || !isOpen) return;

    const handleOutsideClick = () => setIsOpen(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isTouchDevice, isOpen]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 dark:border-t-zinc-200 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 dark:border-b-zinc-200 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 dark:border-l-zinc-200 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 dark:border-r-zinc-200 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-full p-0.5',
          'text-muted-foreground/60 hover:text-muted-foreground',
          'transition-all duration-200 ease-out',
          'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'cursor-help',
          iconClassName
        )}
        aria-label="More information"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? 'tooltip-content' : undefined}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      {/* Tooltip */}
      <span
        id="tooltip-content"
        role="tooltip"
        className={cn(
          'absolute z-50 w-max max-w-[240px] px-3 py-2',
          'text-xs leading-relaxed text-zinc-100 dark:text-zinc-900',
          'bg-zinc-800 dark:bg-zinc-200',
          'rounded-lg shadow-lg',
          'pointer-events-none',
          'transition-all duration-200 ease-out',
          positionClasses[side],
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none',
          side === 'top' && !isOpen && 'translate-y-1',
          side === 'bottom' && !isOpen && '-translate-y-1',
          side === 'left' && !isOpen && 'translate-x-1',
          side === 'right' && !isOpen && '-translate-x-1'
        )}
      >
        {content}
        {/* Arrow */}
        <span
          className={cn(
            'absolute w-0 h-0 border-[5px]',
            arrowClasses[side]
          )}
        />
      </span>
    </span>
  );
}

/**
 * LabelWithTooltip - Convenience wrapper for Label + InfoTooltip
 * Use this when you need a form label with an info tooltip
 */
interface LabelWithTooltipProps {
  htmlFor?: string;
  children: React.ReactNode;
  tooltip: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function LabelWithTooltip({
  htmlFor,
  children,
  tooltip,
  tooltipSide = 'top',
  className,
}: LabelWithTooltipProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'flex items-center gap-1.5 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
    >
      {children}
      <InfoTooltip content={tooltip} side={tooltipSide} />
    </label>
  );
}

/**
 * TitleWithTooltip - For card titles with info tooltips
 * Use this in CardTitle components
 */
interface TitleWithTooltipProps {
  children: React.ReactNode;
  tooltip: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function TitleWithTooltip({
  children,
  tooltip,
  tooltipSide = 'top',
  className,
}: TitleWithTooltipProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {children}
      <InfoTooltip content={tooltip} side={tooltipSide} />
    </span>
  );
}
