import React, { useState, useRef } from 'react';
import './styles.css';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadLinkRef = useRef(null);

  const fetchVideoInfo = async () => {
    if (!url) {
      setError('Masukkan URL YouTube');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mendapatkan info video');
      }

      const data = await response.json();
      setVideoInfo(data);
      if (data.formats.length > 0) {
        setSelectedFormat(data.formats[0].itag);
      }
    } catch (err) {
      setError(err.message);
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoInfo || !selectedFormat) {
      setError('Pilih format terlebih dahulu');
      return;
    }

    const format = videoInfo.formats.find(f => f.itag === selectedFormat);
    if (!format) {
      setError('Format tidak valid');
      return;
    }

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${selectedFormat}`;
    downloadLinkRef.current.href = downloadUrl;
    
    // Simulasi progress bar (di dunia nyata, Anda perlu menggunakan WebSocket atau teknik lain)
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setDownloadProgress(progress);
    }, 300);
    
    downloadLinkRef.current.click();
  };

  return (
    <div className="container">
      <h1>YouTube Downloader</h1>
      
      <div className="input-group">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Masukkan URL YouTube"
        />
        <button onClick={fetchVideoInfo} disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Cari'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {videoInfo && (
        <div className="video-info">
          <div className="thumbnail-container">
            <img src={videoInfo.thumbnail} alt="Thumbnail" className="thumbnail" />
            <h3>{videoInfo.title}</h3>
          </div>
          
          <div className="format-selector">
            <label>Pilih Kualitas:</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {videoInfo.formats.map((format) => (
                <option key={format.itag} value={format.itag}>
                  {format.quality} ({format.container}) {format.audioOnly ? '(Audio Only)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${downloadProgress}%` }}></div>
          </div>
          
          <button 
            onClick={handleDownload} 
            className="download-btn"
            disabled={isLoading}
          >
            Unduh
          </button>
          
          <a 
            ref={downloadLinkRef} 
            style={{ display: 'none' }} 
            download
          >
            Download Link
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
