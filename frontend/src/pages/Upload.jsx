// frontend/src/pages/Upload.jsx
import React, { useState, useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { format } from 'date-fns';

const Upload = () => {
  const { isAnalyst } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT'];

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(2),
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize: 10485760 // 10MB
  });

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      Papa.parse(csvData, {
        header: true,
        complete: (results) => {
          setPreviewData({
            headers: results.meta.fields,
            rows: results.data.slice(0, 5),
            total: results.data.length
          });
        }
      });
    };
    reader.readAsText(file);
  };

  const uploadFile = async (fileItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);
    if (selectedSymbol) {
      formData.append('symbol', selectedSymbol);
    }

    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      // Simulate progress
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ));
      }, 500);

      const response = await fetch('http://localhost:8000/api/v1/stocks/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(interval);

      if (response.ok) {
        const result = await response.json();
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'success', 
            progress: 100,
            result: result
          } : f
        ));
        
        setUploadHistory(prev => [{
          id: fileItem.id,
          name: fileItem.name,
          symbol: selectedSymbol || 'Auto-detected',
          records: result.records,
          timestamp: new Date(),
          status: 'success'
        }, ...prev]);

        toast.success(`Uploaded ${result.records} records successfully!`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'error', progress: 0 } : f
      ));
      toast.error(`Failed to upload ${fileItem.name}`);
    }
  };

  const uploadAll = async () => {
    setUploading(true);
    for (const file of files.filter(f => f.status === 'pending')) {
      await uploadFile(file);
    }
    setUploading(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isAnalyst) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only analysts can upload data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload CSV files for market surveillance analysis
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Stock Symbol
          </label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Auto-detect from file</option>
            {symbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag & drop CSV files here, or click to select</p>
              <p className="text-sm text-gray-400 mt-2">Maximum file size: 10MB</p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Files to Upload</h3>
              <div className="space-x-2">
                <button
                  onClick={uploadAll}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Upload All
                </button>
                <button
                  onClick={() => setFiles([])}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => previewFile(file.file)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <TableCellsIcon className="w-5 h-5" />
                      </button>
                      {file.status === 'pending' && (
                        <button
                          onClick={() => uploadFile(file)}
                          className="px-3 py-1 bg-primary-800 text-white text-sm rounded hover:bg-primary-700"
                        >
                          Upload
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {file.result && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ Uploaded {file.result.records} records
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      {previewData && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Data Preview</h3>
            <button
              onClick={() => setPreviewData(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Showing first 5 of {previewData.total} rows</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {previewData.headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {previewData.headers.map((header, colIdx) => (
                      <td key={colIdx} className="px-4 py-2 text-sm text-gray-900">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4">Recent Uploads</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.symbol}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.records}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {format(item.timestamp, 'HH:mm:ss')}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;