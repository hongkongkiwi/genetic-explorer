import React, { useState } from 'react';
import { Trash2, AlertTriangle, Dna, Download } from 'lucide-react';
import { useGenomeStatus } from '~/hooks/useGenomeStatus';
import { Button } from '~/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { useToast } from '~/hooks/useToast';

/**
 * Genome Data Settings Component
 * 
 * Allows users to:
 * - View their genome count and status
 * - Export/download their genome data
 * - Delete all genome data (but keep account)
 */
export function GenomeDataSettings() {
  const { hasGenome, genomeCount, isLoading } = useGenomeStatus();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllGenomes = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/genomes/delete-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Genome Data Deleted',
          description: result.message,
        });
        setShowDeleteDialog(false);
        // Reload page to refresh state
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete genome data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            Genome Data
          </CardTitle>
          <CardDescription>
            Manage your uploaded genetic data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Uploaded Genomes</p>
              <p className="text-2xl font-bold">
                {hasGenome ? genomeCount : 'None'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              hasGenome ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Dna className="w-6 h-6" />
            </div>
          </div>

          {/* Actions */}
          {hasGenome && (
            <div className="space-y-3">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Export Genome Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your genetic data
                    </p>
                  </div>
                </div>
                <a href="/api/export-data">
                  <Button variant="outline">
                    Export
                  </Button>
                </a>
              </div>

              {/* Delete Data */}
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Delete Genome Data</p>
                    <p className="text-sm text-muted-foreground">
                      Remove all your genetic data but keep your account. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* No Genome Message */}
          {!hasGenome && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">
                You haven't uploaded any genome data yet.
              </p>
              <a href="/upload" className="inline-block mt-2">
                <Button variant="outline">Upload Genome</Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Genome Data?
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                This will permanently delete all your uploaded genome data, including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>All genome files ({genomeCount} {genomeCount === 1 ? 'file' : 'files'})</li>
                <li>SNP data and genetic variants</li>
                <li>Health reports and analyses</li>
                <li>Ancestry and trait analyses</li>
                <li>Relative matching data</li>
              </ul>
              <p className="text-sm font-medium text-foreground pt-2">
                Your account and settings will be preserved.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllGenomes}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete All Genome Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
