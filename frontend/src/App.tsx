import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader, FileText, Play, Download, Settings, X, Sparkles, FileDown, Check, Sun, Moon, Copy, RefreshCw, CheckCircle, AlertCircle, Globe, Zap, Shield, Clock, Trash2, Info, ArrowRight, FileJson, FileCode, File as FileIcon } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Types
interface ScriptConfig {
  durationMinutes: number;
  tone: string;
  focusNotes: string;
  includeNotes: boolean;
  outputFormat: string;
}

interface ScriptResult {
  success: boolean;
  title: string;
  analysis: {
    title: string;
    sections: string[];
    key_points: string[];
    supporting_details: string;
  };
  script: string;
  wordCount: number;
  durationMinutes: number;
}

// Tone options
const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', icon: '💼' },
  { value: 'engaging', label: 'Engaging', icon: '✨' },
  { value: 'casual', label: 'Casual', icon: '😎' },
  { value: 'persuasive', label: 'Persuasive', icon: '🎯' },
  { value: 'educational', label: 'Educational', icon: '🎓' },
  { value: 'storytelling', label: 'Storytelling', icon: ' storytelling' },
];

// Duration presets
const DURATION_PRESETS = [
  { label: '3 min', value: 3, words: '450' },
  { label: '5 min', value: 5, words: '750' },
  { label: '10 min', value: 10, words: '1500' },
  { label: '15 min', value: 15, words: '2250' },
  { label: '30 min', value: 30, words: '4500' },
];

// Main App Component (Inner - uses theme context)
function AppContent() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showConfig, setShowConfig] = useState(true);
  const { theme } = useTheme();

  // Configuration state
  const [config, setConfig] = useState<ScriptConfig>({
    durationMinutes: 5,
    tone: 'professional',
    focusNotes: '',
    includeNotes: true,
    outputFormat: 'markdown',
  });

  // Copy state for feedback
  const [copySuccess, setCopySuccess] = useState(false);
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // File drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.pptx') || droppedFile.name.endsWith('.ppt'))) {
      setSelectedFile(droppedFile);
      setFilePreview(droppedFile.name);
      setError('');
    } else {
      setError('Please upload a PDF or PowerPoint file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        setSelectedFile(file);
        setFilePreview(file.name);
        setError('');
      } else {
        setError('Please upload a PDF or PowerPoint file');
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview('');
    setResult(null);
    setError('');
  };

  // Generate script handler
  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Please upload a presentation file');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('duration_minutes', config.durationMinutes.toString());
    formData.append('tone', config.tone);
    formData.append('focus_notes', config.focusNotes || '');
    formData.append('include_notes', config.includeNotes.toString());
    formData.append('output_format', config.outputFormat);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate script');
      }

      const data: ScriptResult = await response.json();
      setResult(data);
      showToast('Script generated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the script');
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.script) {
      navigator.clipboard.writeText(result.script);
      setCopySuccess(true);
      showToast('Script copied to clipboard!', 'success');
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const downloadScript = () => {
    if (result?.script) {
      const blob = new Blob([result.script], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.title.replace(/\s+/g, '-').toLowerCase()}-script.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Script downloaded successfully!', 'success');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard shortcut for generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, config]);

  // Determine text and background colors based on theme
  const getThemeColors = () => {
    if (theme === 'light') {
      // Move Supply Chain inspired light theme
      return {
        bg: 'bg-gradient-to-br from-white via-slate-50 to-slate-100',
        text: 'text-slate-900',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-500',
        border: 'border-slate-200',
        card: 'bg-white/90 backdrop-blur-xl',
        cardHover: 'hover:bg-white',
        glass: 'bg-white/80 backdrop-blur-2xl',
        accent: 'from-[#0F80CB] via-[#0C69A3] to-[#0F80CB]',
        accentHover: 'from-[#0C69A3] via-[#0A538A] to-[#0C69A3]',
        accentGlow: 'shadow-[#0F80CB]/30',
        secondaryGlow: 'shadow-[#E8A320]/30',
      };
    }
    // Dark theme with navy/orange accents
    return {
      bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
      text: 'text-slate-100',
      textSecondary: 'text-slate-400',
      textMuted: 'text-slate-500',
      border: 'border-white/10',
      card: 'bg-slate-900/60 backdrop-blur-2xl',
      cardHover: 'hover:bg-slate-800/50',
      glass: 'bg-slate-900/70 backdrop-blur-3xl',
      accent: 'from-[#0F80CB] via-[#0C69A3] to-[#0F80CB]',
      accentHover: 'from-[#0C69A3] via-[#0A538A] to-[#0C69A3]',
      accentGlow: 'shadow-[#0F80CB]/50',
      secondaryGlow: 'shadow-[#E8A320]/40',
    };
  };

  const colors = getThemeColors();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${colors.bg}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down border ${
          toast.type === 'success'
            ? 'bg-gradient-to-r from-green-500/90 to-emerald-600/90 text-white border-green-400/30'
            : toast.type === 'error'
            ? 'bg-gradient-to-r from-red-500/90 to-orange-600/90 text-white border-red-400/30'
            : 'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 text-white border-blue-400/30'
        }`}>
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border ${colors.border} relative z-10 backdrop-blur-2xl transition-all duration-500`}>

        {/* Header */}
        <header className={`border-b ${colors.border} ${colors.card} backdrop-blur-md transition-colors duration-300`}>
          <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br from-[#0F80CB] to-[#0C69A3] rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110`}></div>
                <div className="relative p-3 bg-gradient-to-br from-[#0F80CB] to-[#0C69A3] rounded-xl shadow-xl shadow-[#0F80CB]/25">
                  <FileText size={28} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0F80CB] to-[#0C69A3]">
                  ScriptGen<span className="font-light text-slate-700 dark:text-slate-200">AI</span>
                </h1>
                <p className={`text-xs ${colors.textMuted} flex items-center gap-2`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F80CB] animate-pulse"></div>
                  Powered by Local AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="px-8 py-8">
          {/* Hero Section - Only show when no result */}
          {!result && (
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0F80CB]/20 to-[#0C69A3]/20 dark:from-[#0F80CB]/30 dark:to-[#0C69A3]/30 border border-[#0F80CB]/30 dark:border-[#0F80CB]/40 rounded-full mb-6">
                <Sparkles size={14} className="text-[#E8A320] animate-pulse" />
                <span className="text-xs font-semibold text-[#0F80CB] dark:text-[#0C69A3]">New: Enhanced Script Analysis</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Turn Your Slides Into <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F80CB] via-[#0C69A3] to-[#0F80CB]">
                  Powerful Scripts
                </span>
              </h2>
              <p className={`${colors.textSecondary} max-w-2xl mx-auto`}>
                Upload your PDF or PowerPoint presentation, and our AI will analyze the content and generate a compelling speaker script tailored to your needs.
              </p>
            </div>
          )}

          {/* Configuration Panel */}
          <div className={`rounded-2xl border ${colors.border} p-6 mb-8 transition-all duration-500 ${showConfig ? 'opacity-100' : 'opacity-60'} shadow-lg ${colors.accentGlow}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-[#0F80CB]" />
                <h3 className="font-semibold text-lg">Configuration</h3>
              </div>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-2 ${colors.textSecondary} hover:${colors.text} transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5`}
              >
                <RefreshCw size={14} className={`transition-transform duration-300 ${showConfig ? 'rotate-0' : '-rotate-90'}`} />
                <span className="text-xs font-medium">{showConfig ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            <div className={`${showConfig ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-4">
                  <label className={`block text-sm font-semibold ${colors.text} flex items-center gap-2`}>
                    <Clock size={16} className="text-[#0F80CB]" />
                    Script Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setConfig({ ...config, durationMinutes: preset.value })}
                        className={`relative py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          config.durationMinutes === preset.value
                            ? 'bg-gradient-to-br from-[#0F80CB] to-[#0C69A3] text-white shadow-lg shadow-[#0F80CB]/25'
                            : `${colors.card} ${colors.textSecondary} hover:${colors.text} hover:border-[#0F80CB]/30 border ${colors.border}`
                        }`}
                      >
                        <div className="font-bold text-lg">{preset.label}</div>
                        <div className="text-[10px] opacity-70">{preset.words} words</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-4">
                  <label className={`block text-sm font-semibold ${colors.text} flex items-center gap-2`}>
                    <Globe size={16} className="text-[#0F80CB]" />
                    Script Tone
                  </label>
                  <div className={`relative rounded-xl border ${colors.border} overflow-hidden`}>
                    <select
                      value={config.tone}
                      onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                      className={`w-full appearance-none bg-transparent px-4 py-3 pr-10 ${colors.text} focus:outline-none focus:ring-2 focus:ring-[#0F80CB]/50 cursor-pointer`}
                    >
                      {TONE_OPTIONS.map((tone) => (
                        <option key={tone.value} value={tone.value} className={theme === 'dark' ? 'bg-slate-800' : 'bg-white'}>
                          {tone.icon} {tone.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#0F80CB]">
                      <svg width="12" height="7" viewBox="0 0 24 16" fill="none">
                        <path d="M1 1L12 12L23 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="lg:col-span-2 space-y-4">
                  <label className={`block text-sm font-semibold ${colors.text} flex items-center gap-2`}>
                    <Zap size={16} className="text-[#E8A320]" />
                    Focus Areas (Optional)
                  </label>
                  <div className="relative group">
                    <textarea
                      value={config.focusNotes}
                      onChange={(e) => setConfig({ ...config, focusNotes: e.target.value })}
                      placeholder="Enter specific topics, slides, or sections to emphasize..."
                      className={`w-full bg-transparent border ${colors.border} rounded-xl px-4 py-3 ${colors.text} focus:ring-2 focus:ring-pink-500/50 focus:border-transparent focus:outline-none transition-all resize-none h-24 placeholder:text-slate-500`}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                      <Info size={12} /> Separate with commas or new lines
                    </div>
                  </div>
                </div>

                {/* Output Format */}
                <div className="lg:col-span-2 space-y-4">
                  <label className={`block text-sm font-semibold ${colors.text} flex items-center gap-2`}>
                    <FileIcon size={16} className="text-[#0F80CB]" />
                    Output Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'markdown', label: 'Markdown', icon: FileCode, desc: 'Rich formatting' },
                      { value: 'plain', label: 'Plain Text', icon: FileText, desc: 'Simple text only' },
                      { value: 'html', label: 'HTML', icon: FileJson, desc: 'Web-ready' },
                    ].map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setConfig({ ...config, outputFormat: format.value })}
                        className={`relative p-4 rounded-xl border transition-all duration-200 ${
                          config.outputFormat === format.value
                            ? 'bg-gradient-to-br from-[#0F80CB]/10 to-[#0C69A3]/10 border-[#0F80CB]/50'
                            : `${colors.card} border-transparent hover:border-[#0F80CB]/30`
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <format.icon size={18} className={config.outputFormat === format.value ? 'text-[#0F80CB]' : 'text-slate-400'} />
                          <span className={`font-medium ${config.outputFormat === format.value ? 'text-[#0F80CB] dark:text-[#0C69A3]' : colors.text}`}>{format.label}</span>
                        </div>
                        <div className="text-xs text-slate-500 pl-6">{format.desc}</div>
                        {config.outputFormat === format.value && (
                          <div className="absolute top-3 right-3 text-[#0F80CB]">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full">
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  isDragging
                    ? 'border-[#0F80CB] bg-[#0F80CB]/5 scale-[1.02]'
                    : `border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-[#0F80CB] dark:hover:border-[#0F80CB]`
                }`}
              >
                <div className="py-16 px-6 text-center">
                  <div className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-6 ${isDragging ? 'bg-[#0F80CB] text-white' : 'bg-gradient-to-br from-[#0F80CB] to-[#0C69A3] text-white'}`}>
                    <Upload size={48} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>Drop your file here</h3>
                  <p className={`${colors.textSecondary} mb-6 text-sm`}>or click to browse</p>

                  <label className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0F80CB] to-[#0C69A3] hover:from-[#0C69A3] hover:to-[#0A538A] text-white rounded-xl font-medium transition-all shadow-lg shadow-[#0F80CB]/25 cursor-pointer mx-auto">
                    <FileText size={18} />
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileSelect}
                    />
                  </label>

                  <div className="mt-8 flex items-center justify-center gap-4">
                    {['PDF', 'PPTX', 'PPT'].map((format) => (
                      <div key={format} className={`px-4 py-2 rounded-lg ${colors.card} border ${colors.border} flex items-center gap-2 text-xs ${colors.text}`}>
                        <FileText size={14} className={format === 'PDF' ? 'text-red-500' : 'text-[#0F80CB]'} />
                        {format}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Shield size={12} />
                    <span>Files processed locally - never stored</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`relative overflow-hidden rounded-2xl border ${colors.border} p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#0F80CB] to-[#0C69A3] rounded-xl text-white shadow-lg shadow-[#0F80CB]/25">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-lg ${colors.text} truncate max-w-[200px]`}>{filePreview}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedFile.name.endsWith('.pdf') ? 'bg-red-500/10 text-red-500' : 'bg-[#0F80CB]/10 text-[#0F80CB]'}`}>
                          {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'PPTX'}
                        </span>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          Ready to process
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isProcessing || !selectedFile}
              className={`w-full mt-6 py-4 px-8 bg-gradient-to-r from-[#0F80CB] via-[#0C69A3] to-[#0F80CB] hover:from-[#0C69A3] hover:via-[#0A538A] hover:to-[#0C69A3] text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#0F80CB]/25 hover:shadow-[#0F80CB]/40 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg`}
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play size={24} fill="currentColor" />
                  <span>Generate Script</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              Press <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Ctrl</kbd> + <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Enter</kbd> to generate
            </p>

            {/* Error Message */}
            {error && (
              <div className={`mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-fade-in`}>
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && result.script && (
            <div className="mt-10 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${colors.text}`}>Your Generated Script</h3>
                    <p className={`text-sm ${colors.textSecondary}`}>{result.wordCount} words • ~{result.durationMinutes} min read</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border ${colors.border} ${
                      copySuccess
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:border-slate-400/30'
                    }`}
                  >
                    {copySuccess ? <CheckCircle size={18} /> : <Copy size={18} />}
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadScript}
                    className="px-4 py-2 bg-gradient-to-r from-[#0F80CB] to-[#0C69A3] hover:from-[#0C69A3] hover:to-[#0A538A] text-white rounded-lg font-medium transition-all shadow-lg shadow-[#0F80CB]/20 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>

              {/* Script Viewer */}
              <div className={`rounded-2xl border ${colors.border} overflow-hidden shadow-lg`}>
                <div className={`px-6 py-4 bg-slate-900 text-slate-300 flex items-center justify-between border-b ${colors.border}`}>
                  <div className="flex items-center gap-2">
                    <FileCode size={18} className="text-[#0F80CB]" />
                    <span className="font-medium text-sm">script.md</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Markdown format</span>
                    <div className="flex gap-1">
                      <button onClick={() => window.print()} className="hover:text-white">Print</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={copyToClipboard} className="hover:text-white">Copy</button>
                    </div>
                  </div>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 custom-scrollbar">
                  <div className="prose prose-sm md:prose max-w-none prose-slate dark:prose-invert">
                    {result.script.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h2 key={i} className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">{line.replace(/^# /, '')}</h2>;
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-[#0F80CB] dark:text-[#0C69A3]">{line.replace(/^## /, '')}</h3>;
                      }
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="text-lg font-medium mt-4 mb-2">{line.replace(/^### /, '')}</h4>;
                      }
                      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        return <li key={i} className="ml-4 mb-2 text-slate-700 dark:text-slate-300">{line}</li>;
                      }
                      if (line.trim()) {
                        return <p key={i} className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">{line}</p>;
                      }
                      return <br key={i} />;
                    })}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setResult(null);
                    setConfig({ ...config, focusNotes: '' });
                  }}
                  className="px-6 py-3 bg-[#0F80CB]/5 hover:bg-[#0F80CB]/10 text-[#0F80CB] dark:text-[#0C69A3] rounded-xl font-medium transition-all border border-[#0F80CB]/20 flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Generate Another
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className={`border-t ${colors.border} ${colors.card} py-6 text-center`}>
          <p className={`text-sm ${colors.textMuted}`}>
            ScriptGen AI • Local Processing • Privacy First
          </p>
        </footer>
      </div>
    </div>
  );
}

// Main App Component (Wrapper with ThemeProvider)
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
