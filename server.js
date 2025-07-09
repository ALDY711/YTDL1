import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint untuk mendapatkan info video dan stream
app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: "URL tidak valid" });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails.pop().url;

    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    res.json({
      title,
      thumbnail,
      formats: formats.map(f => ({
        qualityLabel: f.qualityLabel,
        url: f.url,
        mimeType: f.mimeType,
      })),
      audioUrl: ytdl(url, { filter: 'audioonly' }).streamURL,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tidak dapat mengunduh video ini" });
  }
});

// Untuk Vercel Serverless Functions
export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    app(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
}
