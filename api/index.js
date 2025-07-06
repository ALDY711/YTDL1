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
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'URL YouTube tidak valid' });
    }
    
    const info = await ytdl.getInfo(url);
    
    const formats = info.formats
      .filter(format => format.hasVideo && format.hasAudio)
      .map(format => ({
        quality: format.qualityLabel || format.quality,
        itag: format.itag,
        container: format.container,
        url: format.url,
        audioOnly: !format.hasVideo
      }));
      
    const audioFormats = info.formats
      .filter(format => !format.hasVideo && format.hasAudio)
      .map(format => ({
        quality: 'audio only',
        itag: format.itag,
        container: format.container,
        url: format.url,
        audioOnly: true
      }));
      
    const allFormats = [...formats, ...audioFormats];
    
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      formats: allFormats
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal mendapatkan info video: ' + error.message });
  }
});

// Endpoint untuk mengunduh video
app.get('/api/download', async (req, res) => {
  try {
    const { url, itag } = req.query;
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).send('URL YouTube tidak valid');
    }
    
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });
    
    res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.${format.container}"`);
    
    ytdl(url, { quality: itag }).pipe(res);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Gagal mengunduh video: ' + error.message);
  }
});

// Handler error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi kesalahan pada server');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
