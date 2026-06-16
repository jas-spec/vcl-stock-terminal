import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { parseFile } from '../utils/fileParser';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/pdf',
  'text/csv',
];

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.pdf', '.csv'];

function getFileExtension(name) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

function isValidFile(file) {
  const ext = getFileExtension(file.name);
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function UploadZone({ onFileProcessed, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
  const [parseInfo, setParseInfo] = useState(null); // { rowCount, headers }
  const inputRef = useRef(null);

  const processFile = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setUploadState('uploading');
    setUploadProgress(0);
    setParseInfo(null);

    // Animate progress while parsing
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress > 85) progress = 85; // Cap at 85% until actual parsing is done
      setUploadProgress(Math.round(progress));
    }, 200);

    try {
      // Actually parse the file
      const parsedData = await parseFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('success');
      setParseInfo({
        rowCount: parsedData.rows.length,
        headers: parsedData.headers,
        sheetName: parsedData.sheetName,
      });

      // Pass both the file AND parsed data to the parent
      setTimeout(() => {
        onFileProcessed(selectedFile, parsedData);
      }, 600);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to parse the file. Please check the format.');
      setUploadState('error');
    }
  }, [onFileProcessed]);

  const handleFiles = useCallback((files) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    if (!isValidFile(selectedFile)) {
      setError(`"${selectedFile.name}" is not supported. Please upload .xlsx, .xls, .csv, or .pdf files.`);
      setUploadState('error');
      setFile(null);
      return;
    }

    processFile(selectedFile);
  }, [processFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const resetUpload = () => {
    setFile(null);
    setError(null);
    setUploadState('idle');
    setUploadProgress(0);
    setParseInfo(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isPdf = file?.name?.endsWith('.pdf');
  const FileIcon = isPdf ? FileText : FileSpreadsheet;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3"
          style={{ color: 'var(--color-text-primary)' }}>
          Upload Your Inventory
        </h1>
        <p className="text-base sm:text-lg max-w-md mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}>
          Drop your Excel, CSV, or PDF file below — we&rsquo;ll read the actual data and generate analytics from it
        </p>
      </div>

      {/* Dropzone */}
      <div
        id="upload-dropzone"
        className={`
          relative rounded-2xl border-2 border-dashed p-8 sm:p-12 transition-all duration-300 cursor-pointer
          ${dragActive ? 'scale-[1.02]' : ''}
          ${uploadState === 'success' ? '' : 'hover:scale-[1.01]'}
        `}
        style={{
          borderColor: dragActive
            ? 'var(--color-accent)'
            : uploadState === 'error'
              ? 'var(--color-danger)'
              : uploadState === 'success'
                ? 'var(--color-success)'
                : 'var(--color-border)',
          backgroundColor: dragActive
            ? 'var(--color-accent-soft)'
            : 'var(--color-bg-secondary)',
          boxShadow: dragActive ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => uploadState !== 'uploading' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          id="file-input"
          accept=".xlsx,.xls,.pdf,.csv"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Idle State */}
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{ backgroundColor: 'var(--color-accent-soft)' }}>
              <Upload size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Drag & drop your inventory file here
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                or <span className="font-medium" style={{ color: 'var(--color-accent)' }}>browse</span> to choose a file
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: FileSpreadsheet, label: '.xlsx' },
                { icon: FileSpreadsheet, label: '.csv' },
                { icon: FileText, label: '.pdf' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                  <Icon size={14} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Uploading State */}
        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="var(--color-border)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="var(--color-accent)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - uploadProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{ color: 'var(--color-accent)' }}>
                {uploadProgress}%
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                Reading {file?.name}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Parsing file data and detecting columns...
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && (
          <div className="flex flex-col items-center gap-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                File parsed successfully!
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                <FileIcon size={14} />
                <span className="font-medium">{file?.name}</span>
                <span>({formatSize(file?.size || 0)})</span>
              </div>
              {parseInfo && (
                <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Found <span style={{ color: 'var(--color-accent)' }} className="font-bold">{parseInfo.rowCount} items</span> with {parseInfo.headers.length} columns
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertCircle size={32} style={{ color: 'var(--color-danger)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
                Parse Failed
              </p>
              <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                {error}
              </p>
            </div>
            <button
              id="retry-upload-btn"
              onClick={(e) => { e.stopPropagation(); resetUpload(); }}
              className="text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Reset button for success state */}
        {uploadState === 'success' && (
          <button
            id="reset-upload-btn"
            onClick={(e) => { e.stopPropagation(); resetUpload(); }}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
