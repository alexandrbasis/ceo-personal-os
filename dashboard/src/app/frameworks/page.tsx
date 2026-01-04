'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Framework metadata with descriptions from README.md
 */
const FRAMEWORKS = [
  {
    slug: 'annual-review',
    name: 'Annual Review',
    description: 'Structured year-end reflection',
    source: 'Dr. Anthony Gustin',
  },
  {
    slug: 'vivid-vision',
    name: 'Vivid Vision',
    description: 'Detailed future-state visualization',
    source: 'Tony Robbins tradition',
  },
  {
    slug: 'ideal-life-costing',
    name: 'Ideal Lifestyle Costing',
    description: 'Understanding what your life actually costs',
    source: 'Tim Ferriss',
  },
] as const;

/**
 * Frameworks Page
 * Route: /frameworks
 *
 * Lists all available frameworks with descriptions from README.md
 * Links to individual framework view/edit pages
 */
export default function FrameworksPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Frameworks</h1>
            <p className="text-muted-foreground mt-2">
              Thinking tools for reflection and planning
            </p>
          </div>
          <Button variant="outline" asChild aria-label="Back to Dashboard">
            <Link href="/">Back</Link>
          </Button>
        </div>

        {/* Frameworks Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FRAMEWORKS.map((framework) => (
            <Link
              key={framework.slug}
              href={`/frameworks/${framework.slug}`}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              aria-label={framework.name}
            >
              <Card
                data-testid="framework-card"
                className="h-full transition-colors hover:bg-accent/50"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <CardDescription>{framework.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Source: {framework.source}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
