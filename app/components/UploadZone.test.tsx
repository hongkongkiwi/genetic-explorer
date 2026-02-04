import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadZone } from './UploadZone';

// Mock the DNA validation utilities
vi.mock('~/utils/genome/dna-validation', async () => {
  const actual = await vi.importActual('~/utils/genome/dna-validation');
  return {
    ...actual as any,
    validateDnaFile: vi.fn(),
  };
});

import { validateDnaFile } from '~/utils/genome/dna-validation';

describe('UploadZone', () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area', () => {
    render(<UploadZone onUpload={mockOnUpload} />);
    expect(screen.getByText('Tap to upload your genome file')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload genome file')).toBeInTheDocument();
  });

  it('shows supported file formats', () => {
    render(<UploadZone onUpload={mockOnUpload} />);
    expect(screen.getByText('.txt')).toBeInTheDocument();
    expect(screen.getByText('.csv')).toBeInTheDocument();
    expect(screen.getByText('.gz')).toBeInTheDocument();
    expect(screen.getByText('.zip')).toBeInTheDocument();
  });

  it('shows security message', () => {
    render(<UploadZone onUpload={mockOnUpload} />);
    expect(screen.getByText('Your data is stored securely')).toBeInTheDocument();
  });

  it('validates file on selection', async () => {
    const mockValidation = {
      isValid: true,
      format: '23andme' as const,
      compression: 'none' as const,
      estimatedSnpCount: 600000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'genome.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(validateDnaFile).toHaveBeenCalledWith(file);
    });
  });

  it('shows error for invalid file', async () => {
    const mockValidation = {
      isValid: false,
      format: 'unknown' as const,
      compression: 'none' as const,
      estimatedSnpCount: 0,
      errors: ['Invalid file format'],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['invalid'], 'bad.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Invalid file format')).toBeInTheDocument();
    });
  });

  it('shows compression badge for gzip files', async () => {
    const mockValidation = {
      isValid: true,
      format: '23andme' as const,
      compression: 'gzip' as const,
      estimatedSnpCount: 600000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['compressed'], 'genome.txt.gz', { type: 'application/gzip' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('GZIP')).toBeInTheDocument();
    });
  });

  it('shows compression badge for zip files', async () => {
    const mockValidation = {
      isValid: true,
      format: 'ancestry' as const,
      compression: 'zip' as const,
      estimatedSnpCount: 700000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['zipped'], 'genome.zip', { type: 'application/zip' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('ZIP')).toBeInTheDocument();
    });
  });

  it('calls onUpload when analyze button is clicked', async () => {
    const mockValidation = {
      isValid: true,
      format: '23andme' as const,
      compression: 'none' as const,
      estimatedSnpCount: 600000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'genome.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Analyze Genome')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Analyze Genome'));
    
    expect(mockOnUpload).toHaveBeenCalledWith(file, mockValidation);
  });

  it('clears file when cancel is clicked', async () => {
    const mockValidation = {
      isValid: true,
      format: '23andme' as const,
      compression: 'none' as const,
      estimatedSnpCount: 600000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['test content'], 'genome.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('genome.txt')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.getByText('Tap to upload your genome file')).toBeInTheDocument();
    });
  });

  it('shows upload progress when isUploading is true', async () => {
    const mockValidation = {
      isValid: true,
      format: '23andme' as const,
      compression: 'none' as const,
      estimatedSnpCount: 600000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    const { rerender } = render(
      <UploadZone onUpload={mockOnUpload} isUploading={false} uploadProgress={0} />
    );
    
    const file = new File(['test content'], 'genome.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Analyze Genome')).toBeInTheDocument();
    });
    
    // Rerender with uploading state
    rerender(<UploadZone onUpload={mockOnUpload} isUploading={true} uploadProgress={50} />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('disables remove button during upload', async () => {
    const mockValidation = {
      isValid: true,
      format: '23andme' as const,
      compression: 'none' as const,
      estimatedSnpCount: 600000,
      errors: [],
      warnings: [],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    const { rerender } = render(
      <UploadZone onUpload={mockOnUpload} isUploading={false} />
    );
    
    const file = new File(['test content'], 'genome.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Remove file')).toBeInTheDocument();
    });
    
    // Rerender with uploading state
    rerender(<UploadZone onUpload={mockOnUpload} isUploading={true} />);
    
    expect(screen.queryByLabelText('Remove file')).not.toBeInTheDocument();
  });

  it('shows warnings for suspicious files', async () => {
    const mockValidation = {
      isValid: true,
      format: 'generic' as const,
      compression: 'none' as const,
      estimatedSnpCount: 5000,
      errors: [],
      warnings: ['File may not contain standard SNP data'],
    };
    
    (validateDnaFile as any).mockResolvedValue(mockValidation);

    render(<UploadZone onUpload={mockOnUpload} />);
    
    const file = new File(['rs123,1,1000,A,T'], 'small.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload genome file');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Note:/)).toBeInTheDocument();
    });
  });
});
