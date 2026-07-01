import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader, FileText, Play, Download, Settings, X, Sparkles, FileDown, Check, Sun, Moon, Copy, RefreshCw, CheckCircle, AlertCircle, Globe, Zap, Shield, Clock } from 'lucide-react';
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
  { value: 'professional', label: 'Professional' },
  { value: 'engaging', label: 'Engaging' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'educational', label: 'Educational' },
  { value: 'storytelling', label: 'Storytelling' },
];

// Duration presets
const DURATION_PRESETS = [
  { label: '3 min', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
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
      return {
        bg: 'bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50',
        text: 'text-slate-900',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-500',
        border: 'border-slate-200',
        card: 'bg-white/80 backdrop-blur-xl',
        cardHover: 'hover:bg-slate-50',
        glass: 'bg-white/70 backdrop-blur-2xl',
        accent: 'from-indigo-600 via-purple-600 to-pink-600',
        accentHover: 'from-indigo-500 via-purple-500 to-pink-500',
        accentGlow: 'shadow-indigo-500/50',
        secondaryGlow: 'shadow-purple-500/50',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
      text: 'text-slate-100',
      textSecondary: 'text-slate-400',
      textMuted: 'text-slate-500',
      border: 'border-white/10',
      card: 'bg-slate-800/60 backdrop-blur-2xl',
      cardHover: 'hover:bg-slate-700/50',
      glass: 'bg-slate-800/70 backdrop-blur-3xl',
      accent: 'from-indigo-600 via-purple-600 to-pink-600',
      accentHover: 'from-indigo-500 via-purple-500 to-pink-500',
      accentGlow: 'shadow-indigo-500/60',
      secondaryGlow: 'shadow-purple-500/60',
    };
  };

  const colors = getThemeColors();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${colors.bg}`}>
      {/* Animated Background Orbs - Enhanced with more colors and movement */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-blob mix-blend-multiply filter animate-pulse duration-2000"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply filter animate-pulse duration-3000"></div>
        <div className="absolute -bottom-20 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-multiply filter animate-pulse duration-4000"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-down border ${
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

      {/* Main Container Box - Enhanced glassmorphism */}
      <div className={`w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 border ${colors.border} relative z-10 backdrop-blur-2xl`} style={{ margin: '0 auto' }}>
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl pointer-events-none transition-opacity duration-500"></div>
        <div className={`absolute inset-0 rounded-[2.5rem] border border-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 pointer-events-none`}></div>

        {/* Header - Enhanced */}
        <header className={`border-b ${colors.border} ${colors.card} backdrop-blur-md transition-colors duration-300 relative`}>
          {/* Header Glow Effect */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500`}></div>

          <div className="px-6 py-6 flex flex-col items-center justify-center gap-6 max-w-6xl mx-auto w-full">
            {/* Logo Section - Centered */}
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}></div>
                <div className="relative p-4 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-500/50 group-hover:-translate-y-1">
                  <FileText size={32} className="text-white" />
                </div>
                {/* Pulsing ring around logo */}
                <div className="absolute -inset-2 rounded-3xl border border-white/10 animate-ping opacity-20"></div>
              </div>
              <div className="leading-tight">
                <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-300 tracking-tight">
                  ScriptGen<span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-400 tracking-wide uppercase">Powered by Local AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Header Actions */}
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.card} border ${colors.border} bg-white/5 backdrop-blur-sm`}>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <Zap size={10} className="text-indigo-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Shield size={10} className="text-purple-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 border border-white/10 flex items-center justify-center">
                    <Globe size={10} className="text-pink-400" />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Privacy First</span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative z-10 px-8 py-10 flex flex-col items-center w-full">
          {/* Enhanced Intro Section */}
          {!result && (
            <div className="text-center mb-12 fade-in px-4 w-full max-w-3xl mx-auto animate-fade-in-up">
              <div className={`inline-flex items-center gap-3 px-6 py-3 ${colors.card} border ${colors.border} rounded-2xl mb-8 backdrop-blur-md shadow-lg`}>
                <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                <span className={`text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400`}>
                  New: Enhanced Script Analysis
                </span>
                <div className="w-px h-4 bg-white/10 mx-2"></div>
                <span className={`text-xs ${colors.textMuted}`}>v2.0 Now Live</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                Turn Your Slides Into <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                  Powerful Scripts
                </span>
              </h2>
              <p className={`text-lg md:text-xl ${colors.textSecondary} max-w-3xl mx-auto mb-10 leading-relaxed font-light`}>
                Upload your PDF or PowerPoint presentation, and our AI will analyze the content and generate a compelling speaker script tailored to your needs.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-8">
                {[
                  { icon: FileText, label: 'PDF Support', color: 'text-red-400', bg: 'red-500/20' },
                  { icon: FileDown, label: 'PPTX Support', color: 'text-blue-400', bg: 'blue-500/20' },
                  { icon: Shield, label: 'Local Processing', color: 'text-green-400', bg: 'green-500/20' },
                  { icon: Zap, label: 'Fast AI', color: 'text-yellow-400', bg: 'yellow-500/20' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 group cursor-default">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-all duration-300`}>
                      <feature.icon size={24} className={feature.color} />
                    </div>
                    <span className={`${colors.textSecondary} font-medium text-sm`}>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Configuration Panel */}
          <div
            className={`glass rounded-3xl border ${colors.border} p-8 mb-10 transition-all duration-500 ${showConfig ? 'opacity-100' : 'opacity-60'} w-full shadow-2xl ${colors.accentGlow}`}
            style={{ maxWidth: '800px' }}
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-3 ${colors.textSecondary} hover:${colors.text} transition-colors group px-6 py-3 rounded-xl hover:bg-white/5`}
              >
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="font-semibold tracking-wide text-lg">Configuration</span>
                <span className={`text-xs px-3 py-1.5 bg-slate-700/50 rounded-full ${colors.textMuted}`}>
                  {showConfig ? 'Hide' : 'Show'}
                </span>
                <RefreshCw size={16} className={`ml-3 transition-transform duration-300 ${showConfig ? 'rotate-0' : '-rotate-90'}`} />
              </button>

              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setConfig({ ...config, durationMinutes: 5, tone: 'professional', focusNotes: '', outputFormat: 'markdown' })}
                  className="text-xs px-4 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  Reset Default
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${showConfig ? 'block' : 'hidden'}`}>
              {/* Duration Section */}
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-indigo-400" />
                  <label className={`block text-sm font-semibold text-indigo-300 uppercase tracking-wider`}>Script Duration</label>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setConfig({ ...config, durationMinutes: preset.value })}
                      className={`relative px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                        config.durationMinutes === preset.value
                          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-500/30 scale-105 ring-2 ring-indigo-500/50'
                          : `bg-slate-700/30 ${colors.textSecondary} hover:bg-slate-700/50 hover:${colors.text} border border-white/10 hover:border-indigo-500/30 hover:scale-105`
                      }`}
                    >
                      {config.durationMinutes === preset.value && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                      )}
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <span className={`text-xs ${colors.textMuted}`}>Select how long your script should be</span>
                </div>
              </div>

              {/* Tone Section */}
              <div className="space-y-6 animate-fade-in animation-delay-200">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={18} className="text-purple-400" />
                  <label className={`block text-sm font-semibold text-purple-300 uppercase tracking-wider`}>Script Tone</label>
                </div>
                <select
                  value={config.tone}
                  onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                  className={`w-full bg-slate-700/30 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 appearance-none cursor-pointer relative`}
                >
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="7" viewBox="0 0 24 16" fill="none">
                      <path d="M1 1L12 12L23 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {TONE_OPTIONS.map((tone) => (
                    <option key={tone.value} value={tone.value} className={`bg-slate-800 ${colors.text}`}>
                      {tone.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className={`text-xs ${colors.textSecondary}`}>Choose the personality for your script</span>
                </div>
              </div>

              {/* Focus Notes Section */}
              <div className="lg:col-span-2 space-y-6 animate-fade-in animation-delay-300">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-pink-400" />
                  <label className={`block text-sm font-semibold text-pink-300 uppercase tracking-wider`}>Focus Areas</label>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <textarea
                    value={config.focusNotes}
                    onChange={(e) => setConfig({ ...config, focusNotes: e.target.value })}
                    placeholder="Enter specific topics, slides, or sections to emphasize in your script..."
                    className={`w-full bg-slate-800/40 border border-white/10 rounded-2xl px-6 py-5 text-slate-100 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent focus:outline-none transition-all hover:border-purple-500/30 resize-none h-32 placeholder:text-slate-600 focus:placeholder:text-slate-500`}
                  />
                  <div className="absolute bottom-4 right-6 text-xs text-slate-500 pointer-events-none flex items-center gap-2">
                    <span className="bg-slate-900 px-3 py-1 rounded-lg border border-white/10">Comma-separated topics</span>
                    <span className="text-slate-600">Or separate lines</span>
                  </div>
                </div>
              </div>

              {/* Output Format Section */}
              <div className="lg:col-span-2 space-y-6 animate-fade-in animation-delay-400">
                <div className="flex items-center gap-2 mb-4">
                  <Download size={18} className="text-indigo-400" />
                  <label className={`block text-sm font-semibold text-indigo-300 uppercase tracking-wider`}>Output Format</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'markdown', label: 'Markdown', icon: <FileText size={18} />, desc: 'Rich formatting' },
                    { value: 'plain', label: 'Plain Text', icon: <FileText size={18} />, desc: 'Simple text only' },
                    { value: 'html', label: 'HTML', icon: <Shield size={18} />, desc: 'Web-ready format' },
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setConfig({ ...config, outputFormat: format.value })}
                      className={`relative p-6 rounded-2xl border transition-all duration-300 text-left group overflow-hidden ${
                        config.outputFormat === format.value
                          ? 'bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                          : `bg-slate-800/30 border-white/10 ${colors.textSecondary} hover:border-indigo-500/30 hover:bg-slate-800/50`
                      }`}
                    >
                      {config.outputFormat === format.value && (
                        <div className="absolute top-0 right-0 p-2">
                          <CheckCircle size={20} className="text-indigo-400" />
                        </div>
                      )}
                      <div className={`flex items-center gap-3 mb-2 ${config.outputFormat === format.value ? 'text-indigo-300' : ''}`}>
                        {format.icon}
                        <span className="font-semibold">{format.label}</span>
                      </div>
                      <span className="text-xs text-slate-500">{format.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Upload Section */}
          <div className="w-full max-w-2xl mx-auto px-4">
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 ${
                  isDragging
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/20'
                    : `border-white/10 bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800/40 hover:shadow-2xl hover:shadow-indigo-500/10`
                }`}
              >
                {/* Upload Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none`}></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 animate-shimmer"></div>

                <div className="py-20 px-6 text-center relative z-10 max-w-3xl mx-auto">
                  <div
                    className={`mx-auto w-32 h-32 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-500 ${
                      isDragging ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-125 shadow-2xl shadow-indigo-500/50' : 'bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30'
                    }`}
                  >
                    <Upload size={80} className={isDragging ? 'text-white' : 'text-indigo-300'} />
                  </div>
                  <h3 className={`text-4xl md:text-6xl font-extrabold ${colors.text} mb-6 tracking-tight`}>
                    Drop your presentation <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">file here</span>
                  </h3>
                  <p className={`${colors.textSecondary} text-lg mb-10 font-light`}>or click to browse</p>

                  <label className="inline-block px-12 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all duration-300 cursor-pointer shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 hover:scale-105 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileSelect}
                    />
                  </label>

                  <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
                    {[
                      { name: 'PDF', color: 'text-red-400', bg: 'bg-red-400/20' },
                      { name: 'PPTX', color: 'text-blue-400', bg: 'bg-blue-400/20' },
                      { name: 'PPT', color: 'text-orange-400', bg: 'bg-orange-400/20' },
                    ].map((format) => (
                      <div key={format.name} className={`flex items-center gap-3 ${colors.card} border ${colors.border} px-5 py-2.5 rounded-xl backdrop-blur-sm`}>
                        <div className={`w-8 h-8 rounded-lg ${format.bg} flex items-center justify-center`}>
                          <FileText size={16} className={format.color} />
                        </div>
                        <span className="font-medium">{format.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">
                    <Shield size={12} />
                    <span>Files processed locally - never stored</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 glass-hover shadow-2xl shadow-indigo-500/20 relative overflow-hidden`}>
                {/* File status indicator */}
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-green-300">Ready to Process</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`p-5 bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 rounded-3xl backdrop-blur-md border border-white/10 transition-all duration-500 group-hover:scale-110`}>
                      <FileText size={48} className="text-indigo-300" />
                    </div>
                    <div className="max-w-[300px]">
                      <h4 className={`font-semibold text-2xl ${colors.text} truncate max-w-[300px]`}>{filePreview}</h4>
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`text-sm ${colors.textSecondary}`}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                        <span className={`text-sm ${colors.textMuted}`}>PDF Document</span>
                      </div>
                      <p className={`text-xs ${colors.textMuted} mt-2 flex items-center gap-2`}>
                        <Shield size={12} />
                        <span>Secure - Local Processing Only</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <button
                      onClick={handleRemoveFile}
                      className={`p-4 ${colors.textSecondary} hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 border border-transparent hover:border-red-500/30 group`}
                      title="Remove file"
                    >
                      <X size={24} className="group-hover:-rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-center relative z-10">
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className={`flex-1 w-full py-5 px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-4 text-xl relative overflow-hidden`}
                  >
                    {isProcessing && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-shimmer"></div>
                    )}
                    {isProcessing ? (
                      <>
                        <Loader className="animate-spin" size={28} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">Analyzing & Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play size={28} className="fill-current" />
                        <span>Generate Script</span>
                      </>
                    )}
                  </button>

                  {/* Keyboard Shortcut Hint */}
                  <div className={`${colors.card} border ${colors.border} px-6 py-3 rounded-2xl backdrop-blur-sm flex items-center gap-4`}>
                    <div className="flex gap-1">
                      <kbd className="bg-slate-700/50 px-3 py-1.5 rounded-lg font-mono text-xs text-slate-300 border border-slate-600/50">Ctrl</kbd>
                      <span className="text-xs text-slate-500">+</span>
                      <kbd className="bg-slate-700/50 px-3 py-1.5 rounded-lg font-mono text-xs text-slate-300 border border-slate-600/50">Enter</kbd>
                    </div>
                    <span className={`text-sm ${colors.textSecondary}`}>to generate</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message - Enhanced */}
            {error && (
              <div className={`mt-8 p-6 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/30 rounded-2xl ${colors.text} animate-fade-in w-full max-w-2xl mx-auto backdrop-blur-md relative overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="flex items-center justify-center gap-4 relative z-10">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertCircle size={24} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">Oops!</h4>
                    <p className={`${colors.textSecondary} font-medium`}>{error}</p>
                  </div>
                  <button onClick={() => setError('')} className="text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Results Section - Enhanced */}
            {result && result.script && (
              <div className="mt-16 fade-in w-full max-w-5xl mx-auto animate-fade-in-up">
                {/* Header */}
                <div className={`flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 mb-8 relative`}>
                  <div className="flex-1 text-center md:text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl mb-6 backdrop-blur-md shadow-lg shadow-green-500/20">
                      <CheckCircle size={24} className="text-green-400" />
                      <span className="font-semibold text-green-300">Script Generated Successfully!</span>
                    </div>
                    <h3 className={`text-4xl font-extrabold ${colors.text} mb-3`}>Your Generated Script</h3>
                    <div className="flex items-center justify-center md:justify-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <FileText size={16} className="text-indigo-400" />
                        <span className="font-semibold">{result.wordCount}</span> words
                      </span>
                      <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <Clock size={16} className="text-purple-400" />
                        <span className="font-semibold">~{result.durationMinutes}</span> min read
                      </span>
                      <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <CheckCircle size={16} className="text-emerald-400" />
                        Ready to export
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 relative z-10 justify-center">
                    <button
                      onClick={copyToClipboard}
                      className={`px-6 py-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl text-sm font-semibold transition-all duration-300 border border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-3 min-w-[140px] relative overflow-hidden group`}
                    >
                      {copySuccess ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30"></div>
                          <CheckCircle size={20} className="text-green-400 relative z-10" />
                          <span className="text-green-400 relative z-10">Copied!</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          <Copy size={20} className="text-slate-300 relative z-10 group-hover:text-white" />
                          <span className="text-slate-300 relative z-10 group-hover:text-white">Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadScript}
                      className={`px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-2xl text-sm font-semibold transition-all duration-300 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 min-w-[140px] relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <Download size={20} className="relative z-10" />
                      <span className="relative z-10">Download</span>
                    </button>
                  </div>
                </div>

                {/* Script Viewer */}
                <div className={`bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/20 w-full mx-auto relative max-w-5xl`}>
                  {/* Window Controls */}
                  <div className="flex items-center justify-center md:justify-between px-8 py-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <div className="w-4 h-4 rounded-full bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                        <div className="w-4 h-4 rounded-full bg-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-slate-400 flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" />
                        script.md
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Zap size={12} className="text-yellow-500/50" />
                        <span>Markdown format</span>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="flex gap-4 text-sm">
                        <button onClick={() => window.print()} className="text-slate-400 hover:text-white transition-colors">
                          Print
                        </button>
                        <span className="text-slate-600">|</span>
                        <button onClick={copyToClipboard} className="text-slate-400 hover:text-white transition-colors">
                          Copy All
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Script Content */}
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar relative">
                    <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-semibold prose-a:text-indigo-400 hover:prose-a:text-indigo-300 transition-colors">
                      {result.script.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) {
                          return (
                            <h2 key={i} className="text-3xl md:text-4xl font-bold text-white mt-10 mb-6 pb-4 border-b border-white/10 relative">
                              {line.replace(/^# /, '')}
                            </h2>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h3 key={i} className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mt-10 mb-5">
                              {line.replace(/^## /, '')}
                            </h3>
                          );
                        }
                        if (line.startsWith('### ')) {
                          return (
                            <h4 key={i} className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mt-8 mb-4">
                              {line.replace(/^### /, '')}
                            </h4>
                          );
                        }
                        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                          return (
                            <p key={i} className="text-slate-300 mb-4 pl-5 border-l-2 border-indigo-500/30 hover:border-indigo-400 transition-colors">
                              {line}
                            </p>
                          );
                        }
                        if (line.trim()) {
                          return (
                            <p key={i} className="text-slate-300 mb-5 leading-relaxed hover:text-slate-200 transition-colors">
                              {line}
                            </p>
                          );
                        }
                        return <br key={i} />;
                      })}
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none opacity-0 animate-fade-in"></div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="px-8 py-4 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      <Shield size={12} />
                      <span>Scroll to read more</span>
                    </span>
                    <div className="flex gap-3">
                      <button onClick={copyToClipboard} className="px-5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-sm transition-colors border border-white/5">
                        Copy All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Success Actions */}
                <div className="mt-10 text-center max-w-2xl mx-auto">
                  <p className={`mb-6 ${colors.textSecondary} text-sm`}>
                    Your script is ready! <span className="text-indigo-400">Share it</span> or <span className="text-indigo-400">generate another</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setResult(null);
                      setConfig({ ...config, focusNotes: '' });
                    }}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all border border-white/10 hover:border-indigo-500/50"
                  >
                    Start New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer - Enhanced */}
        <footer className={`border-t ${colors.border} ${colors.card} py-10 transition-colors duration-300 relative z-10`}>
          <div className="px-6 py-8 text-center w-full max-w-5xl mx-auto relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full opacity-50"></div>
            <div className="flex items-center justify-center gap-4 mb-6 relative z-10">
              <div className={`p-3 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm`}>
                <FileText size={24} className="text-indigo-400" />
              </div>
              <div>
                <h2 className={`text-2xl font-extrabold ${colors.text}`}>ScriptGen</h2>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 text-lg font-semibold">AI</span>
              </div>
            </div>
            <p className={`mb-6 ${colors.textSecondary} font-light`}>
              AI Presentation Script Generator
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500 mb-8 px-4 flex-wrap relative z-10">
              <span className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-500/50" />
                Uses Llama AI for local generation
              </span>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-green-500/50" />
                Your data never leaves your machine
              </span>
            </div>
            <div className={`text-xs ${colors.textMuted} relative z-10`}>
              <p>© 2026 ScriptGen AI. All rights reserved.</p>
              <p className="mt-2 opacity-60">Privacy First • 100% Local Processing</p>
            </div>
          </div>
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
