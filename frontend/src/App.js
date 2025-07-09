import React, { useState } from 'react';
import './styles.css';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError('Masukkan URL YouTube');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);
    
    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan info video');
      }

      setVideoInfo(data);
      if (data.formats.length > 0) {
        setSelectedFormat(data.formats[0].itag.toString());
      }
    } catch (err) {
      setError(err.message);
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) {
      setError('Pilih format terlebih dahulu');
      return;
    }

    setIsDownloading(true);
    setError('');

    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${selectedFormat}`;
      
      // Buat link download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      setError('Gagal mengunduh video: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchVideoInfo();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count?.toString() || '0';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 YouTube Downloader</h1>
        <p>Unduh video dan audio dari YouTube dengan mudah</p>
      </div>
      
      <div className="input-section">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Masukkan URL YouTube (contoh: https://www.youtube.com/watch?v=...)"
            disabled={isLoading}
          />
          <button onClick={fetchVideoInfo} disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              'Cari Video'
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error">
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {videoInfo && (
        <div className="video-info">
          <div className="video-preview">
            <img src={videoInfo.thumbnail} alt="Thumbnail" className="thumbnail" />
            <div className="video-details">
              <h3>{videoInfo.title}</h3>
              <div className="video-stats">
                {videoInfo.duration && (
                  <span className="stat">
                    ⏱️ {formatDuration(videoInfo.duration)}
                  </span>
                )}
                {videoInfo.viewCount && (
                  <span className="stat">
                    👁️ {formatViewCount(videoInfo.viewCount)} views
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="download-section">
            <div className="format-selector">
              <label htmlFor="format-select">
                <strong>📹 Pilih Format & Kualitas:</strong>
              </label>
              <select
                id="format-select"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                disabled={isDownloading}
              >
                <option value="">-- Pilih Format --</option>
                {videoInfo.formats.map((format) => (
                  <option key={format.itag} value={format.itag}>
                    {format.quality} ({format.container.toUpperCase()})
                    {format.audioOnly ? ' - Audio Only' : ' - Video + Audio'}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleDownload} 
              className="download-btn"
              disabled={isDownloading || !selectedFormat}
            >
              {isDownloading ? (
                <>
                  <span className="spinner"></span>
                  Mengunduh...
                </>
              ) : (
                <>
                  ⬇️ Unduh Video
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="footer">
        <p>
          <strong>Catatan:</strong> Pastikan Anda memiliki hak untuk mengunduh video tersebut.
          Tool ini hanya untuk penggunaan pribadi dan edukatif.
        </p>
      </div>
    </div>
  );
}

export default App;
