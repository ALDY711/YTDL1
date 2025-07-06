from flask import Flask, request, jsonify, Response, stream_with_context
from pytube import YouTube
import json

app = Flask(__name__)

def progress_callback(stream, chunk, bytes_remaining):
    """Callback untuk melacak progres unduhan."""
    total_size = stream.filesize
    bytes_downloaded = total_size - bytes_remaining
    percentage_of_completion = bytes_downloaded / total_size * 100
    progress_data = {
        'status': 'downloading',
        'progress': round(percentage_of_completion, 2)
    }
    # Mengirim progres dalam format Server-Sent Events (SSE)
    yield f"data: {json.dumps(progress_data)}\n\n"

@app.route('/get_video_info', methods=['POST'])
def get_video_info():
    """Endpoint untuk mendapatkan informasi video."""
    url = request.json.get('url')
    if not url:
        return jsonify({'error': 'URL tidak boleh kosong'}), 400

    try:
        yt = YouTube(url)
        video_streams = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc()
        audio_streams = yt.streams.filter(only_audio=True).order_by('abr').desc()

        video_qualities = [{'itag': s.itag, 'resolution': s.resolution} for s in video_streams]
        audio_qualities = [{'itag': s.itag, 'abr': s.abr} for s in audio_streams]

        return jsonify({
            'title': yt.title,
            'thumbnail_url': yt.thumbnail_url,
            'video_qualities': video_qualities,
            'audio_qualities': audio_qualities
        })
    except Exception as e:
        return jsonify({'error': f'URL tidak valid atau video tidak dapat diakses: {str(e)}'}), 400

@app.route('/download', methods=['GET'])
def download():
    """Endpoint untuk mengunduh video atau audio."""
    url = request.args.get('url')
    itag = request.args.get('itag')

    if not url or not itag:
        return Response("URL dan itag diperlukan.", status=400)

    try:
        yt = YouTube(url)
        stream = yt.streams.get_by_itag(int(itag))

        def generate():
            # Menggunakan stream_with_context untuk mengirim progres dan file
            yield from stream_with_context(stream.iter_content(chunk_size=1024))

        return Response(generate(), headers={
            'Content-Disposition': f'attachment; filename="{stream.default_filename}"',
            'Content-Type': stream.mime_type
        })
    except Exception as e:
        return Response(f"Gagal mengunduh: {str(e)}", status=500)

if __name__ == '__main__':
    app.run(debug=True)
