'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, Map, Zap, ClipboardCheck, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'ceo-os-has-seen-tour';

interface TourStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    icon: <Map className="w-8 h-8" />,
    title: 'Life Map',
    subtitle: 'Your compass for growth',
    description:
      'Track your satisfaction across 6 key life domains: Career, Relationships, Health, Meaning, Finances, and Fun. Each domain is scored 1-10.',
    accentColor: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 2,
    icon: <Zap className="w-8 h-8" />,
    title: 'Quick Actions',
    subtitle: 'Start your day with intention',
    description:
      'Start your daily review here. The status indicator shows when you last completed a review.',
    accentColor: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 3,
    icon: <ClipboardCheck className="w-8 h-8" />,
    title: 'Daily Review',
    subtitle: 'Reflect. Refine. Rise.',
    description:
      "Reflect on your energy, wins, friction points, and set tomorrow's priority. A timer tracks your reflection time.",
    accentColor: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    id: 4,
    icon: <History className="w-8 h-8" />,
    title: 'Recent Reviews',
    subtitle: 'Your journey, documented',
    description:
      'Access your review history. Click any entry to view details or edit.',
    accentColor: 'from-purple-500/20 to-pink-500/20',
  },
];

interface WelcomeTourProps {
  /** Force show the tour regardless of localStorage */
  forceShow?: boolean;
  /** Callback when tour is completed or skipped */
  onComplete?: () => void;
}

/**
 * Check if tour should be shown on initial render
 * This runs only on client-side
 */
function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false;
  const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
  return !hasSeenTour;
}

/**
 * Custom hook to manage tour visibility with SSR support
 * Handles both localStorage check and forceShow prop
 */
function useTourVisibility(forceShow: boolean): [boolean, (open: boolean) => void, boolean] {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Track previous forceShow to detect changes
  const [prevForceShow, setPrevForceShow] = useState(forceShow);

  // Handle mounting - runs once on client
  useEffect(() => {
    // Use requestAnimationFrame to defer state updates
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      if (forceShow || shouldShowTour()) {
        setIsOpen(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle forceShow prop changes after initial mount
  if (mounted && forceShow !== prevForceShow) {
    setPrevForceShow(forceShow);
    if (forceShow) {
      setIsOpen(true);
    }
  }

  return [isOpen, setIsOpen, mounted];
}

export function WelcomeTour({ forceShow = false, onComplete }: WelcomeTourProps) {
  const [isOpen, setIsOpen, mounted] = useTourVisibility(forceShow);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // Reset step when forceShow triggers a re-open
  const [prevForceShow, setPrevForceShow] = useState(forceShow);
  if (forceShow && !prevForceShow) {
    setPrevForceShow(forceShow);
    setCurrentStep(0);
  } else if (!forceShow && prevForceShow) {
    setPrevForceShow(forceShow);
  }

  const closeTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    onComplete?.();
  }, [setIsOpen, onComplete]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;

    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      closeTour();
    }
  }, [currentStep, isAnimating, closeTour]);

  const handlePrevious = useCallback(() => {
    if (isAnimating || currentStep === 0) return;

    setIsAnimating(true);
    setSlideDirection('right');
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 300);
  }, [currentStep, isAnimating]);

  const handleSkip = useCallback(() => {
    closeTour();
  }, [closeTour]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (isAnimating || index === currentStep) return;

      setIsAnimating(true);
      setSlideDirection(index > currentStep ? 'left' : 'right');
      setTimeout(() => {
        setCurrentStep(index);
        setIsAnimating(false);
      }, 300);
    },
    [currentStep, isAnimating]
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        closeTour();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeTour, handleNext, handlePrevious]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !isOpen) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeTour}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden',
          'animate-in zoom-in-95 fade-in duration-300',
          'border border-border/50'
        )}
      >
        {/* Decorative gradient background */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-500',
            step.accentColor
          )}
        />

        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Close button */}
        <button
          onClick={closeTour}
          className={cn(
            'absolute top-4 right-4 z-10 p-2 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-black/5 dark:hover:bg-white/5',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative px-8 pt-12 pb-8">
          {/* Step counter */}
          <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-6">
            Step {currentStep + 1} of {tourSteps.length}
          </div>

          {/* Step content with transition */}
          <div
            className={cn(
              'transition-all duration-300 ease-out',
              isAnimating && slideDirection === 'left' && 'opacity-0 -translate-x-8',
              isAnimating && slideDirection === 'right' && 'opacity-0 translate-x-8'
            )}
          >
            {/* Icon with animated background */}
            <div className="relative mb-6">
              <div
                className={cn(
                  'inline-flex items-center justify-center w-16 h-16 rounded-2xl',
                  'bg-primary/10 text-primary',
                  'ring-1 ring-primary/20'
                )}
              >
                {step.icon}
              </div>
              {/* Decorative ring animation */}
              <div
                className={cn(
                  'absolute inset-0 w-16 h-16 rounded-2xl',
                  'ring-2 ring-primary/20 animate-ping',
                  'opacity-0'
                )}
                style={{ animationDuration: '2s', animationIterationCount: '1' }}
              />
            </div>

            {/* Title */}
            <h2
              id="tour-title"
              className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight font-[family-name:var(--font-playfair)]"
            >
              {step.title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm font-medium text-primary/80 mb-4 tracking-wide">
              {step.subtitle}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8 mb-6" role="tablist">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  'transition-all duration-300 rounded-full',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  index === currentStep
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                role="tab"
                aria-selected={index === currentStep}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} disabled={isAnimating}>
                  Back
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={isAnimating}
                className={cn(
                  'min-w-[120px] gap-2',
                  isLastStep &&
                    'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                )}
              >
                {isLastStep ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}

/**
 * HelpButton - Floating button to re-trigger the welcome tour
 */
interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-12 h-12 rounded-full',
        'bg-card border border-border shadow-lg',
        'flex items-center justify-center',
        'text-muted-foreground hover:text-primary',
        'transition-all duration-300 ease-out',
        'hover:scale-110 hover:shadow-xl',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isHovered && 'bg-primary/5'
      )}
      aria-label="Show welcome tour"
      title="Take the tour"
    >
      <span
        className={cn(
          'text-xl font-bold transition-transform duration-300 font-[family-name:var(--font-playfair)]',
          isHovered && 'scale-110'
        )}
      >
        ?
      </span>

      {/* Tooltip */}
      <span
        className={cn(
          'absolute right-full mr-3 px-3 py-1.5 rounded-lg',
          'bg-popover border border-border shadow-md',
          'text-sm text-popover-foreground whitespace-nowrap',
          'transition-all duration-200',
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        )}
      >
        Take the tour
      </span>
    </button>
  );
}

/**
 * Utility function to reset tour state (for testing/development)
 */
export function resetTourState(): void {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
