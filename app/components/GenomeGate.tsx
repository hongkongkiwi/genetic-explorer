import React from 'react';
import { Link } from '@tanstack/react-router';
import { Dna, Upload, Lock, ChevronRight } from 'lucide-react';
import { useGenomeStatus } from '~/hooks/useGenomeStatus';
import { Button } from '~/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

interface GenomeGateProps {
  children: React.ReactNode;
  featureName?: string;
  featureDescription?: string;
  showPreview?: boolean;
}

/**
 * Genome Gate Component
 * 
 * Wraps gated features and shows an upload prompt if user hasn't uploaded a genome.
 * If user has genome, renders children normally.
 */
export function GenomeGate({
  children,
  featureName = 'This Feature',
  featureDescription = 'Unlock personalized genetic insights by uploading your genome data.',
  showPreview = true,
}: GenomeGateProps) {
  const { hasGenome, isLoading, gatedFeatures, uploadPrompt } = useGenomeStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (hasGenome) {
    return <>{children}</>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Locked Feature Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{featureName} is Locked</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {featureDescription}
        </p>
      </div>

      {/* Upload CTA */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            Upload Your Genome to Unlock
          </CardTitle>
          <CardDescription>{uploadPrompt}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/upload">
              <Button size="lg" className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Upload Genome
              </Button>
            </Link>
            <Link to="/help/upload-guide">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Preview of Gated Features */}
      {showPreview && gatedFeatures.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Features You'll Unlock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gatedFeatures.map((feature) => (
              <Card key={feature.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {feature.icon.charAt(0)}
                    </span>
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Note */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Your genetic data is encrypted and stored securely. You have full control 
            over your data and can delete it at any time from your account settings.
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Compact Genome Gate for inline use (e.g., in navigation or sidebars)
 */
export function CompactGenomeGate() {
  const { hasGenome, isLoading } = useGenomeStatus();

  if (isLoading || hasGenome) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
            <Upload className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Complete Your Setup
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Upload your genome to unlock all features
            </p>
            <Link to="/upload" className="inline-block mt-2">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Upload Now
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Badge to show genome upload status
 */
export function GenomeStatusBadge() {
  const { hasGenome, genomeCount, isLoading } = useGenomeStatus();

  if (isLoading) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
        Loading...
      </span>
    );
  }

  if (hasGenome) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
        <Dna className="w-3 h-3 mr-1" />
        {genomeCount} {genomeCount === 1 ? 'Genome' : 'Genomes'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
      <Lock className="w-3 h-3 mr-1" />
      No Genome
    </span>
  );
}
