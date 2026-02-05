import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Upload, Download, Trash2, Search, FileSpreadsheet, 
  Loader2, Database, RefreshCw, Tag, Zap, Users, TrendingUp,
  Wrench, Flame, Lightbulb, Home, Trees, Droplets, PaintBucket, HardHat
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Industry icons and colors
const INDUSTRY_CONFIG = {
  plumbing: { icon: Droplets, color: 'bg-cyan-500', label: 'Plumbing' },
  hvac: { icon: Flame, color: 'bg-orange-500', label: 'HVAC' },
  electrical: { icon: Lightbulb, color: 'bg-yellow-500', label: 'Electrical' },
  remodeling: { icon: Home, color: 'bg-purple-500', label: 'Remodeling' },
  landscaping: { icon: Trees, color: 'bg-green-500', label: 'Landscaping' },
  power_washing: { icon: Droplets, color: 'bg-blue-500', label: 'Power Washing' },
  roofing: { icon: HardHat, color: 'bg-red-500', label: 'Roofing' },
  painting: { icon: PaintBucket, color: 'bg-pink-500', label: 'Painting' },
};

export default function ScrapeDashboard() {
  const [files, setFiles] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industries, setIndustries] = useState([]);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API}/scrapes`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setTotalRecords(data.total_records || 0);
      }
    } catch (e) {
      console.error('Failed to fetch files:', e);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIndustries = useCallback(async () => {
    try {
      const res = await fetch(`${API}/scraper/industries`);
      if (res.ok) {
        const data = await res.json();
        setIndustries(data.industries || []);
      }
    } catch (e) {
      console.error('Failed to fetch industries:', e);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchIndustries();
  }, [fetchFiles, fetchIndustries]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API}/scrapes/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchFiles();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Upload failed');
      }
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await fetch(`${API}/scrapes/download/${encodeURIComponent(filename)}`);
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`Downloaded ${filename}`);
      } else {
        toast.error('Download failed');
      }
    } catch (e) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;

    try {
      const res = await fetch(`${API}/scrapes/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success(`Deleted ${filename}`);
        fetchFiles();
      } else {
        toast.error('Delete failed');
      }
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Detect industry from filename
  const getFileIndustry = (filename) => {
    const lower = filename.toLowerCase();
    for (const ind of Object.keys(INDUSTRY_CONFIG)) {
      if (lower.includes(ind)) return ind;
    }
    return null;
  };

  // Count files per industry
  const industryCounts = industries.reduce((acc, ind) => {
    acc[ind] = files.filter(f => getFileIndustry(f.name) === ind).reduce((sum, f) => sum + f.records, 0);
    return acc;
  }, {});

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || 
      getFileIndustry(file.name) === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const filteredRecords = filteredFiles.reduce((sum, f) => sum + f.records, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Lead Database</h1>
                <p className="text-xs text-slate-400">Manage your scraped leads</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setLoading(true); fetchFiles(); }}
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
                data-testid="refresh-files-btn"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/scraper">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="go-to-scraper-btn"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Scraper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Total Files</p>
                  <p className="text-2xl font-bold text-white mt-1">{files.length}</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Total Leads</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{totalRecords.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-600/20 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Avg Per File</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {files.length > 0 ? Math.round(totalRecords / files.length) : 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Industries</p>
                  <p className="text-2xl font-bold text-white mt-1">{industries.length}</p>
                </div>
                <div className="p-3 bg-orange-600/20 rounded-lg">
                  <Wrench className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Industry Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <button
              onClick={() => setSelectedIndustry('all')}
              className={`p-3 rounded-lg border transition-all ${
                selectedIndustry === 'all'
                  ? 'border-blue-500 bg-blue-600/20 text-white'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Database className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs font-medium">All</p>
              <p className="text-xs text-slate-500">{totalRecords.toLocaleString()}</p>
            </button>
            
            {industries.map(ind => {
              const config = INDUSTRY_CONFIG[ind] || { icon: Wrench, color: 'bg-slate-500', label: ind };
              const Icon = config.icon;
              const count = industryCounts[ind] || 0;
              
              return (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedIndustry === ind
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 mx-auto mb-1 rounded ${config.color} p-1`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <p className="text-xs font-medium capitalize">{config.label}</p>
                  <p className="text-xs text-slate-500">{count.toLocaleString()}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search & Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 focus-visible:ring-blue-500 text-slate-200"
              data-testid="search-files-input"
            />
          </div>

          <label>
            <input
              type="file"
              accept=".csv"
              onChange={handleUpload}
              className="hidden"
              data-testid="file-upload-input"
            />
            <Button
              asChild
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              data-testid="upload-file-btn"
            >
              <span>
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload CSV
              </span>
            </Button>
          </label>
        </motion.div>

        {/* Filtered Results Info */}
        {(searchTerm || selectedIndustry !== 'all') && (
          <div className="mb-4 text-sm text-slate-400">
            Showing {filteredFiles.length} files with {filteredRecords.toLocaleString()} leads
            {selectedIndustry !== 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">
                {INDUSTRY_CONFIG[selectedIndustry]?.label || selectedIndustry}
              </span>
            )}
          </div>
        )}

        {/* Files Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="py-16 text-center">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-2">
                {searchTerm || selectedIndustry !== 'all' 
                  ? 'No files match your filters' 
                  : 'No leads yet'}
              </p>
              <Link to="/scraper">
                <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Scraping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-800 bg-slate-900/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">File</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Industry</th>
                      <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Leads</th>
                      <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Size</th>
                      <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Date</th>
                      <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredFiles.map((file, idx) => {
                      const industry = getFileIndustry(file.name);
                      const config = industry ? INDUSTRY_CONFIG[industry] : null;
                      const Icon = config?.icon || FileSpreadsheet;
                      
                      return (
                        <motion.tr
                          key={file.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${config?.color || 'bg-slate-700'}`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-slate-200 truncate max-w-xs" title={file.name}>
                                  {file.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {config ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color} bg-opacity-20 text-white`}>
                                {config.label}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-emerald-400">{file.records.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-slate-400">{formatSize(file.size)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-slate-400">{formatDate(file.uploaded_at)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownload(file.name)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                                data-testid={`download-${file.name}`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(file.name)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                data-testid={`delete-${file.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

      </main>
    </div>
  );
}
