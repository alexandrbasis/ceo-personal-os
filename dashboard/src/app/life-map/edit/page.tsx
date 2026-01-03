'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { LifeMapEditor } from '@/components/LifeMapEditor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LifeMap } from '@/lib/types';

/**
 * Life Map Edit Page
 * Route: /life-map/edit
 *
 * Features:
 * - Fetches current life map data from GET /api/life-map
 * - Shows loading state while fetching
 * - Shows error state with retry button if fetch fails
 * - Uses LifeMapEditor component for editing
 * - Calls PUT /api/life-map on save
 * - Shows toast notifications on success/error
 * - Navigates to dashboard after successful save
 * - Navigates back on cancel
 */
export default function LifeMapEditPage() {
  const router = useRouter();
  const [lifeMap, setLifeMap] = useState<LifeMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const fetchLifeMap = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/life-map');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load life map');
      }

      const data = await response.json();
      setLifeMap(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load life map';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLifeMap();
  }, [fetchLifeMap]);

  // Focus management after loading
  useEffect(() => {
    if (!loading && mainRef.current) {
      // Focus will be handled by LifeMapEditor component
      // but we ensure main is focusable for accessibility
      const firstFocusable = mainRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="slider"]'
      );
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    }
  }, [loading, error, lifeMap]);

  const handleSave = useCallback(
    async (data: LifeMap): Promise<void> => {
      const response = await fetch('/api/life-map', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || 'Failed to save life map';
        toast.error(message);
        throw new Error(message);
      }

      toast.success('Life map saved successfully!');

      // Navigate to dashboard after successful save
      router.push('/');
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(() => {
    fetchLifeMap();
  }, [fetchLifeMap]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main ref={mainRef} className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (error || !lifeMap) {
    return (
      <div className="min-h-screen bg-background">
        <main ref={mainRef} className="container mx-auto px-4 py-8 max-w-6xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-destructive mb-4">
                  {error || 'Failed to load life map'}
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleRetry} aria-label="Try again">
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main ref={mainRef} className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <h1>Edit Life Map</h1>
              </CardTitle>
              <Button variant="outline" asChild aria-label="Back to Dashboard">
                <Link href="/">Back to Dashboard</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LifeMapEditor
              initialData={lifeMap}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
