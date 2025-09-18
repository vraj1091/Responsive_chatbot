import React, { useCallback, useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFilesSelected, maxFiles = 10, maxSize = 50 * 1024 * 1024 }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const validateFile = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} not supported` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit` };
    }

    return { valid: true };
  };

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);

    if (fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFilesSelected(validFiles);
    }
  }, [maxFiles, maxSize, onFilesSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    onFilesSelected([]);
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📁</div>
          <p>Drag & drop files here or click to browse</p>
          <small>Supports images, PDFs, and text files (max {Math.round(maxSize / 1024 / 1024)}MB)</small>
          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.gif,.pdf,.txt"
            onChange={handleInputChange}
            className="file-input"
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="files-header">
            <span>{selectedFiles.length} file(s) selected</span>
            <button onClick={clearFiles} className="clear-button">Clear All</button>
          </div>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">
                  {file.type.startsWith('image/') ? '🖼️' : 
                   file.type === 'application/pdf' ? '📄' : '📝'}
                </span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
                </div>
                <button onClick={() => removeFile(index)} className="remove-button">❌</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
