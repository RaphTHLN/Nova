const clockElement = document.querySelector('.clock');
const backgroundImageElement = document.querySelector('.background-image');
const playerElement = document.querySelector('.player');
const albumCoverElement = document.querySelector('.player .image');
const titleElement = document.querySelector('.title-name');
const artistElement = document.querySelector('.artist-name');
const currentTimeElement = document.querySelector('.current-time');
const endTimeElement = document.querySelector('.end-time');
const progressBarElement = document.querySelector('.progress-bar');

const defaultBackgrounds = [
    'https://wallpapers.com/images/hd/violet-evergarden-at-dark-swamp-lg3b6vbxz8gm6vro.webp'
];

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}`;
}

function formatTime(ms) {
    if (ms === null || ms === undefined) {
        return "0:00";
    }
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function updatePlayerInfo() {
    try {
        const response = await fetch('/data');
        if (response.status === 401) {
            playerElement.style.display = 'none';
            backgroundImageElement.style.backgroundImage = `url(${defaultBackgrounds[0]})`;
            console.error('API Unauthorized, please re-authenticate.');
            return;
        }

        const data = await response.json();

        if (data.playing) {
            playerElement.style.display = 'flex';
            
            titleElement.textContent = data.title || "Loading...";
            artistElement.textContent = data.artist || "Loading...";
            
            albumCoverElement.style.backgroundImage = `url(${data.album_image})`;
            backgroundImageElement.style.backgroundImage = `url(${data.album_image})`;

            currentTimeElement.textContent = formatTime(data.progress_ms);
            endTimeElement.textContent = formatTime(data.duration_ms);
            
            if (data.progress_ms !== null && data.duration_ms !== null) {
                const progressPercentage = (data.progress_ms / data.duration_ms) * 100;
                progressBarElement.style.width = `${progressPercentage}%`;
            }

        } else {
            playerElement.style.display = 'none';
            const randomIndex = Math.floor(Math.random() * defaultBackgrounds.length);
            backgroundImageElement.style.backgroundImage = `url(${defaultBackgrounds[randomIndex]})`;
        }

    } catch (error) {
        console.error('Failed to fetch data:', error);
        playerElement.style.display = 'none';
        const randomIndex = Math.floor(Math.random() * defaultBackgrounds.length);
        backgroundImageElement.style.backgroundImage = `url(${defaultBackgrounds[randomIndex]})`;
    }
}

updateClock();
updatePlayerInfo();

setInterval(updateClock, 1000); 
setInterval(updatePlayerInfo, 5000);