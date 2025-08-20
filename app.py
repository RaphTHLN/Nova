import os
from flask import Flask, jsonify, redirect, request, session, send_from_directory
from flask_cors import CORS
from flask_cors import cross_origin
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth

client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')

if not client_id or not client_secret:
    raise ValueError("Les variables d'environnement SPOTIPY_CLIENT_ID et SPOTIPY_CLIENT_SECRET doivent être définies.")

cache_path = os.path.join(os.path.dirname(__file__), '.cache')

sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri='http://127.0.0.1:5000/callback',
    scope="user-read-currently-playing",
    show_dialog=True,
    cache_path=cache_path
)

app = Flask(__name__, static_folder='static')
app.secret_key = 'super_secret_key'

@app.route('/')
def index():
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/callback')
def callback():
    sp_oauth.get_access_token(request.args['code'])
    return redirect('/')

@app.route('/data')
def get_data():
    try:
        token_info = sp_oauth.get_cached_token()
        if not token_info:
            return jsonify({"error": "No token found"}), 401
        
        sp = Spotify(auth=token_info['access_token'])
        current_track = sp.current_user_playing_track()
        
        if not current_track:
            return jsonify({"playing": False})

        track_info = {
            "playing": True,
            "title": current_track['item']['name'],
            "artist": current_track['item']['artists'][0]['name'],
            "album_image": current_track['item']['album']['images'][0]['url'],
            "progress_ms": current_track['progress_ms'],
            "duration_ms": current_track['item']['duration_ms']
        }
        return jsonify(track_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)