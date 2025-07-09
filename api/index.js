const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint untuk mendapatkan info video
app.post('/api/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL diperlukan' });
    }
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'URL YouTube tidak valid' });
    }
    
    const info = await ytdl.getInfo(url);
    
    // Filter format yang memiliki video dan audio
    const videoFormats = info.formats
      .filter(format => format.hasVideo && format.hasAudio)
      .map(format => ({
        quality: format.qualityLabel || format.quality,
        itag: format.itag,
        container: format.container,
        url: format.url,
        audioOnly: false
      }))
      .sort((a, b) => {
        // Sorting berdasarkan kualitas
        const qualityOrder = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
        return qualityOrder.indexOf(b.quality) - qualityOrder.indexOf(a.quality);
      });
      
    // Filter format audio saja
    const audioFormats = info.formats
      .filter(format => !format.hasVideo && format.hasAudio)
      .map(format => ({
        quality: 'Audio only',
        itag: format.itag,
        container: format.container,
        url: format.url,
        audioOnly: true
      }))
      .slice(0, 3); // Ambil 3 format audio terbaik
      
    const allFormats = [...videoFormats, ...audioFormats];
    
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      formats: allFormats,
      duration: info.videoDetails.lengthSeconds,
      viewCount: info.videoDetails.viewCount
    });
    
  } catch (error) {
    console.error('Error getting video info:', error);
    res.status(500).json({ 
      error: 'Gagal mendapatkan info video. Pastikan URL valid dan video dapat diakses.' 
    });
  }
});

// Endpoint untuk mengunduh video
app.get('/api/download', async (req, res) => {
  try {
    const { url, itag } = req.query;
    
    if (!url || !itag) {
      return res.status(400).json({ error: 'URL dan itag diperlukan' });
    }
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'URL YouTube tidak valid' });
    }
    
    const info = await ytdl.getInfo(url);
    const format = info.formats.find(f => f.itag == itag);
    
    if (!format) {
      return res.status(400).json({ error: 'Format tidak ditemukan' });
    }
    
    // Bersihkan nama file dari karakter yang tidak diizinkan
    const cleanTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim();
    const fileName = `${cleanTitle}.${format.container}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', format.mimeType || 'video/mp4');
    
    const stream = ytdl(url, { quality: itag });
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Gagal mengunduh video' });
      }
    });
    
    stream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Gagal mengunduh video' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handler error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
