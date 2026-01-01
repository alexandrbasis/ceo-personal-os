'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { DailyForm } from '@/components/DailyForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * New Daily Review Page
 * Displays empty form for creating a new daily review
 */
export default function NewDailyReviewPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    date: string;
    energyLevel: number;
    energyFactors?: string;
    meaningfulWin: string;
    frictionPoint?: string;
    frictionAction?: 'address' | 'letting_go';
    thingToLetGo?: string;
    tomorrowPriority: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/reviews/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save review');
      }

      toast.success('Daily review saved successfully!');

      // Redirect to dashboard after short delay for toast to show
      setTimeout(() => {
        router.push('/');
      }, 500);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save review';
      toast.error(message);
      return { success: false };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New Daily Review</CardTitle>
              <Button asChild variant="outline">
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DailyForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
