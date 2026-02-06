/**
 * Lazy-loaded ChromosomeVisualizer
 * 
 * Use this component for code splitting - it will only load when needed.
 */

import { lazy, Suspense } from 'react';
import { CardSkeleton } from '../Skeleton';

// Lazy load the heavy component
const ChromosomeVisualizerComponent = lazy(() => import('../ChromosomeVisualizer'));

interface ChromosomeVisualizerLazyProps {
  chromosome: string;
  snps?: Array<{
    rsid: string;
    position: number;
    genotype: string;
    category?: string;
    gene?: string;
    impact?: string;
  }>;
  height?: number;
  onSnpClick?: (snp: { rsid: string; position: number }) => void;
}

export function ChromosomeVisualizerLazy(props: ChromosomeVisualizerLazyProps) {
  return (
    <Suspense fallback={<div style={{ height: '24rem' }}><CardSkeleton /></div>}>
      <ChromosomeVisualizerComponent {...props} />
    </Suspense>
  );
}

export default ChromosomeVisualizerLazy;
