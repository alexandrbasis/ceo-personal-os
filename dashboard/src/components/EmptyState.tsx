'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

/**
 * EmptyState - Encouraging empty state display
 * Features:
 * - Animated icon with soft glow effect
 * - Clear hierarchy with title and message
 * - Call-to-action button
 * - Refined, editorial aesthetic
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  ctaText,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6',
        className
      )}
    >
      {/* Icon Container with subtle glow and animation */}
      <div className="relative mb-6 group">
        {/* Soft glow background */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-xl scale-150 opacity-60"
          aria-hidden="true"
        />
        {/* Icon circle */}
        <div
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 border border-border/50 shadow-sm"
        >
          <Icon
            className="w-9 h-9 text-muted-foreground/70"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-muted-foreground max-w-xs text-center leading-relaxed mb-6">
        {message}
      </p>

      {/* CTA Button */}
      <Button asChild size="lg" className="shadow-sm">
        <Link href={ctaHref}>{ctaText}</Link>
      </Button>
    </div>
  );
}
