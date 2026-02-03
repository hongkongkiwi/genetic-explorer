import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, FileArchive, Shield } from 'lucide-react';
import { cn } from '~/utils/cn';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function UploadZone({ onUpload, isUploading, uploadProgress }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    // Extended valid extensions including compressed formats
    const validExtensions = ['.txt', '.csv', '.tsv', '.gz', '.gzip', '.zip'];
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      setError('Please upload a .txt, .csv, .tsv, .gz, or .zip file');
      return false;
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return false;
    }

    setError(null);
    return true;
  };

  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().endsWith('.gz') || filename.toLowerCase().endsWith('.gzip')) {
      return <FileArchive className="w-6 h-6 text-purple-500" />;
    }
    if (filename.toLowerCase().endsWith('.zip')) {
      return <FileArchive className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-dna-primary" />;
  };

  const getCompressionBadge = (filename: string) => {
    if (filename.toLowerCase().endsWith('.gz') || filename.toLowerCase().endsWith('.gzip')) {
      return (
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
          GZIP
        </span>
      );
    }
    if (filename.toLowerCase().endsWith('.zip')) {
      return (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
          ZIP
        </span>
      );
    }
    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300',
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".txt,.csv,.tsv,.gz,.gzip,.zip"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                isDragActive ? 'bg-indigo-100 scale-110' : 'bg-slate-100'
              )}>
                <Upload className={cn(
                  'w-8 h-8 transition-colors',
                  isDragActive ? 'text-indigo-600' : 'text-slate-500'
                )} />
              </div>
              
              <div>
                <p className="text-lg font-medium text-slate-900">
                  {isDragActive ? 'Drop your genome file here' : 'Drag & drop your genome file'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or click to browse (supports 23andMe, AncestryDNA, etc.)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600">
                  <FileText className="w-3 h-3" />
                  .txt
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600">
                  <FileText className="w-3 h-3" />
                  .csv
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-purple-600">
                  <FileArchive className="w-3 h-3" />
                  .gz
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded text-blue-600">
                  <FileArchive className="w-3 h-3" />
                  .zip
                </span>
                <span className="text-slate-400">Max 100MB</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Your data is stored securely and never shared</span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-full border border-red-200"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 truncate">{selectedFile.name}</p>
                    {getCompressionBadge(selectedFile.name)}
                  </div>
                  <p className="text-sm text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              {!isUploading && (
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Processing...</span>
                  <span className="text-indigo-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Decompressing (if needed), parsing SNPs, and calculating checksum...
                </p>
              </div>
            )}

            {!isUploading && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Analyze Genome
                </button>
                <button
                  onClick={clearFile}
                  className="px-6 py-3 border border-slate-300 hover:border-slate-400 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
