from flask import Flask, request, jsonify
from pytube import YouTube

# Vercel akan menginisialisasi 'app' ini
app = Flask(__name__)

@app.route('/api/get_video_info', methods=['POST'])
def get_video_info():
    """Endpoint untuk mendapatkan info video dan URL unduhan langsung."""
    url = request.json.get('url')
    if not url:
        return jsonify({'error': 'URL tidak boleh kosong'}), 400

    try:
        yt = YouTube(url)
        
        # Filter stream video dan audio
        video_streams = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc()
        audio_streams = yt.streams.filter(only_audio=True, file_extension='mp4').order_by('abr').desc()

        # Buat daftar kualitas beserta URL unduhan langsung
        video_qualities = [
            {'resolution': s.resolution, 'url': s.url, 'filename': s.default_filename} 
            for s in video_streams
        ]
        audio_qualities = [
            {'abr': s.abr, 'url': s.url, 'filename': s.default_filename} 
            for s in audio_streams
        ]

        return jsonify({
            'title': yt.title,
            'thumbnail_url': yt.thumbnail_url,
            'video_qualities': video_qualities,
            'audio_qualities': audio_qualities
        })
    except Exception as e:
        return jsonify({'error': f'URL tidak valid atau video tidak dapat diakses: {str(e)}'}), 400

# Endpoint /download tidak lagi diperlukan karena kita menggunakan URL langsung
