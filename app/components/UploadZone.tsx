import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, FileArchive, Shield } from 'lucide-react';
import { cn } from '~/utils/shared/cn';
import { 
  validateDnaFile, 
  detectCompression, 
  getFormatDisplayName,
  type DnaFileValidation 
} from '~/utils/genome/dna-validation';

interface UploadZoneProps {
  onUpload: (file: File, validation: DnaFileValidation) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function UploadZone({ onUpload, isUploading, uploadProgress }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<DnaFileValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = async (file: File): Promise<boolean> => {
    setIsValidating(true);
    try {
      const result = await validateDnaFile(file);
      setValidation(result);
      setIsValidating(false);
      return result.isValid;
    } catch (error) {
      setValidation({
        isValid: false,
        format: 'unknown',
        compression: detectCompression(file.name),
        estimatedSnpCount: 0,
        errors: ['Validation failed: ' + (error as Error).message],
        warnings: [],
      });
      setIsValidating(false);
      return false;
    }
  };

  const getFileIcon = (filename: string) => {
    const compression = detectCompression(filename);
    if (compression === 'gzip' || compression === 'zip') {
      return <FileArchive className="w-6 h-6 text-purple-500" />;
    }
    return <FileText className="w-6 h-6 text-dna-primary" />;
  };

  const getCompressionBadge = (filename: string) => {
    const compression = detectCompression(filename);
    if (compression === 'gzip') {
      return (
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
          GZIP
        </span>
      );
    }
    if (compression === 'zip') {
      return (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
          ZIP
        </span>
      );
    }
    return null;
  };

  const getFormatBadge = (format: string) => {
    if (format === 'unknown') return null;
    return (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
        {getFormatDisplayName(format as any)}
      </span>
    );
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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValid = await validateFile(file);
      if (isValid) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValid = await validateFile(file);
      if (isValid) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile && validation) {
      onUpload(selectedFile, validation);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setValidation(null);
  };

  // Get the first error or warning to display
  const getStatusMessage = (): { message: string; type: 'error' | 'warning' | null } => {
    if (!validation) return { message: '', type: null };
    if (validation.errors.length > 0) {
      return { message: validation.errors[0], type: 'error' };
    }
    if (validation.warnings.length > 0) {
      return { message: validation.warnings[0], type: 'warning' };
    }
    return { message: '', type: null };
  };

  const status = getStatusMessage();

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'relative border-2 border-dashed rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center transition-all duration-300 min-h-[200px] sm:min-h-0 flex flex-col justify-center',
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : status.type === 'error'
                  ? 'border-red-300 bg-red-50/50'
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-target"
              aria-label="Upload genome file"
            />
            
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className={cn(
                'w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300',
                isDragActive ? 'bg-indigo-100 scale-110' : 'bg-slate-100'
              )}>
                <Upload className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 transition-colors',
                  isDragActive ? 'text-indigo-700' : 'text-slate-600'
                )} />
              </div>
              
              <div>
                <p className="text-base sm:text-lg font-medium text-slate-900">
                  {isDragActive ? 'Drop your genome file here' : 'Tap to upload your genome file'}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  or drag & drop (supports 23andMe, AncestryDNA, etc.)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600">
                  <FileText className="w-3 h-3" />
                  .txt
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600">
                  <FileText className="w-3 h-3" />
                  .csv
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-purple-700">
                  <FileArchive className="w-3 h-3" />
                  .gz
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded text-blue-700">
                  <FileArchive className="w-3 h-3" />
                  .zip
                </span>
                <span className="text-slate-400 text-xs">Max 100MB</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-xs">Your data is stored securely</span>
              </div>
            </div>

            {isValidating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-indigo-600 text-xs sm:text-sm bg-indigo-50 px-3 sm:px-4 py-2 rounded-full border border-indigo-200 whitespace-nowrap"
              >
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Validating file...
              </motion.div>
            )}

            {status.type === 'error' && !isValidating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-600 text-xs sm:text-sm bg-red-50 px-3 sm:px-4 py-2 rounded-full border border-red-200 whitespace-nowrap max-w-[90%]"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{status.message}</span>
              </motion.div>
            )}

            {status.type === 'warning' && !isValidating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber-700 text-xs sm:text-sm bg-amber-50 px-3 sm:px-4 py-2 rounded-full border border-amber-200 whitespace-nowrap max-w-[90%]"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{status.message}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 truncate text-sm sm:text-base">{selectedFile.name}</p>
                    {getCompressionBadge(selectedFile.name)}
                    {validation && getFormatBadge(validation.format)}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    {validation && validation.estimatedSnpCount > 0 && (
                      <span className="ml-2 text-slate-400">
                        ~{validation.estimatedSnpCount.toLocaleString()} SNPs
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {!isUploading && (
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors touch-target flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>

            {validation && validation.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> {validation.warnings[0]}
                </p>
              </div>
            )}

            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
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
              <div className="mt-4 flex gap-2 sm:gap-3">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 touch-target"
                >
                  <CheckCircle className="w-5 h-5" />
                  Analyze Genome
                </button>
                <button
                  onClick={clearFile}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-300 hover:border-slate-400 rounded-xl transition-colors text-slate-600 hover:text-slate-900 touch-target"
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
