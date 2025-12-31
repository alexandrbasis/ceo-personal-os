/**
 * API Route: /api/life-map
 *
 * GET - Get life map scores and assessments
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { LIFE_MAP_PATH } from '@/lib/config';
import { parseLifeMap, getLifeMapChartData } from '@/lib/parsers/life-map';

/**
 * GET /api/life-map
 * Returns the parsed life map with domain scores and chart data
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const content = await fs.readFile(LIFE_MAP_PATH, 'utf-8');
    const lifeMap = parseLifeMap(content);
    const chartData = getLifeMapChartData(lifeMap);

    return NextResponse.json({
      ...lifeMap,
      chartData,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read life map' },
      { status: 500 }
    );
  }
}
