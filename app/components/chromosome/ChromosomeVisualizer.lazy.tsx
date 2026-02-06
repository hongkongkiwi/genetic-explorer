/**
 * Lazy-loaded ChromosomeVisualizer
 * 
 * Use this component for code splitting - it will only load when needed.
 */

import { lazy, Suspense } from 'react';
import { CardSkeleton } from '../Skeleton';

// Lazy load the heavy component
const ChromosomeVisualizerComponent = lazy(() => import('./ChromosomeVisualizer'));

interface ChromosomeVisualizerLazyProps {
  genomeData?: {
    snps: Array<{
      chromosome: string;
      position: number;
      rsid: string;
    }>;
  };
  selectedChromosome?: string;
  onChromosomeSelect?: (chromosome: string) => void;
  height?: number;
}

export function ChromosomeVisualizerLazy(props: ChromosomeVisualizerLazyProps) {
  return (
    <Suspense fallback={<CardSkeleton className="h-96" />}>
      <ChromosomeVisualizerComponent {...props} />
    </Suspense>
  );
}

export default ChromosomeVisualizerLazy;
