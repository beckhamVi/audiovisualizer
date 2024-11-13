 // Configuración de Spotify y variables globales
 const client_id = "cf8fa3337fe441acbe39edae87cb906c";
 const client_secret = "47936664fcd9469f9e5d75d97690194b";

 // Elementos del DOM
 const songInput = document.getElementById("song-input");
 const searchButton = document.getElementById("search-button");
 const albumCover = document.getElementById("album-cover");
 const trackTitle = document.getElementById("track-title");
 const trackArtist = document.getElementById("track-artist");
 const playPauseButton = document.getElementById("playPauseButton");
 const prevButton = document.getElementById("prevButton");
 const nextButton = document.getElementById("nextButton");
 const audio = document.getElementById("audio");
 const progressBar = document.getElementById("progress");
 const currentTimeElem = document.getElementById("currentTime");
 const durationElem = document.getElementById("duration");
 const volumeControl = document.getElementById("volumeControl");
 const songInfo = document.getElementById("song-info");
 const recommendationsContainer = document.getElementById("recommendations");

 // Variables para recomendaciones y control de reproducción
 let recommendations = [];
 let currentTrackIndex = 0;

 // Evento para manejar la búsqueda de canciones
 searchButton.addEventListener("click", async () => {
     const songName = songInput.value;
     const trackData = await searchSong(songName);
     if (trackData) {
         loadTrackInPlayer(trackData); // Cargar en la barra de reproducción
         playSong(trackData.uri); // Mostrar reproductor embebido
         await displayRecommendations(trackData.uri); // Mostrar recomendaciones
     } else {
         songInfo.innerHTML = "Canción no encontrada.";
     }
 });

 // Función para obtener un token de acceso
 async function getAccessToken() {
     const response = await fetch("https://accounts.spotify.com/api/token", {
         method: "POST",
         headers: {
             "Content-Type": "application/x-www-form-urlencoded",
             Authorization: "Basic " + btoa(client_id + ":" + client_secret),
         },
         body: "grant_type=client_credentials",
     });
     const data = await response.json();
     return data.access_token;
 }

 // Función para buscar la canción en Spotify
 async function searchSong(song) {
     const accessToken = await getAccessToken();
     const response = await fetch(
         `https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track`,
         {
             method: "GET",
             headers: {
                 Authorization: "Bearer " + accessToken,
             },
         }
     );
     const data = await response.json();
     if (data.tracks.items.length > 0) {
         return data.tracks.items[0];
     }
     return null;
 }

 // Función para cargar una canción en la barra de reproducción personalizada
 function loadTrackInPlayer(trackData) {
     albumCover.src = trackData.album.images[0].url;
     trackTitle.textContent = trackData.name;
     trackArtist.textContent = trackData.artists.map(artist => artist.name).join(", ");
     audio.src = trackData.preview_url;

     // Reproducir automáticamente la canción al cargar
     audio.play();
     playPauseButton.textContent = "⏸️";

     // Actualizar el tiempo total cuando los metadatos estén cargados
     audio.addEventListener("loadedmetadata", () => {
         const durationMinutes = Math.floor(audio.duration / 60);
         const durationSeconds = Math.floor(audio.duration % 60);
         durationElem.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
     });
 }

 // Función para reproducir la canción en el reproductor embebido
 function playSong(uri) {
     const iframe = document.createElement("iframe");
     iframe.src = `https://open.spotify.com/embed/track/${uri.split(":")[2]}`;
     iframe.width = "100%";
     iframe.height = "380";
     iframe.frameBorder = "0";
     iframe.allow = "encrypted-media";
     songInfo.innerHTML = "";
     songInfo.appendChild(iframe);
 }

 // Función para mostrar recomendaciones
 async function displayRecommendations(songURI) {
     const accessToken = await getAccessToken();
     const trackID = songURI.split(":")[2];
     const response = await fetch(
         `https://api.spotify.com/v1/recommendations?seed_tracks=${trackID}`,
         {
             method: "GET",
             headers: {
                 Authorization: "Bearer " + accessToken,
             },
         }
     );
     const data = await response.json();
     
     recommendationsContainer.innerHTML = "<h2>Recomendaciones:</h2>";
     recommendations = data.tracks; // Guardar recomendaciones
     currentTrackIndex = 0; // Resetear el índice al obtener nuevas recomendaciones
     
     data.tracks.forEach((track, index) => {
         const trackContainer = document.createElement("div");
         trackContainer.className = "recommendation-item";
         
         const trackInfo = document.createElement("p");
         trackInfo.textContent = `${track.name} - ${track.artists.map(artist => artist.name).join(", ")}`;
         
         trackContainer.appendChild(trackInfo);
         recommendationsContainer.appendChild(trackContainer);

         // Evento para reproducir canción en la barra personalizada al hacer clic en una recomendación
         trackContainer.addEventListener("click", () => {
             currentTrackIndex = index; // Actualizar el índice actual
             loadTrackInPlayer(track);
         });
     });
     
     recommendationsContainer.scrollIntoView({ behavior: "smooth" });
 }

 // Función para reproducir la canción siguiente en las recomendaciones
 function playNextTrack() {
     currentTrackIndex = (currentTrackIndex + 1) % recommendations.length;
     loadTrackInPlayer(recommendations[currentTrackIndex]);
 }

 // Función para reproducir la canción anterior en las recomendaciones
 function playPrevTrack() {
     currentTrackIndex = (currentTrackIndex - 1 + recommendations.length) % recommendations.length;
     loadTrackInPlayer(recommendations[currentTrackIndex]);
 }

 // Event Listeners para los botones Siguiente y Anterior
 nextButton.addEventListener("click", playNextTrack);
 prevButton.addEventListener("click", playPrevTrack);

 // Control de Play/Pause
 playPauseButton.addEventListener("click", () => {
     if (audio.paused) {
         audio.play();
         playPauseButton.textContent = "⏸️";
     } else {
         audio.pause();
         playPauseButton.textContent = "▶️";
     }
 });

 // Actualizar la barra de progreso y el tiempo actual
 audio.addEventListener("timeupdate", () => {
     const currentMinutes = Math.floor(audio.currentTime / 60);
     const currentSeconds = Math.floor(audio.currentTime % 60);
     currentTimeElem.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
     const progressPercent = (audio.currentTime / audio.duration) * 100;
     progressBar.style.width = `${progressPercent}%`;
 });

 // Control de volumen
 volumeControl.addEventListener("input", () => {
     audio.volume = volumeControl.value;
 });

 

// Evento de búsqueda
document.getElementById("search-button").addEventListener("click", async () => {
    const songName = document.getElementById("song-input").value;
    const trackData = await searchSong(songName);
    if (trackData) {
        // Actualiza la interfaz con los datos de la canción
        document.getElementById("track-title").textContent = trackData.name;
        document.getElementById("track-artist").textContent = trackData.artists[0].name;
        document.getElementById("album-cover").src = trackData.album.images[0].url;
        document.getElementById("audio").src = trackData.preview_url;

        // Guarda los datos de la canción en `localStorage`
        const currentTrack = {
            name: trackData.name,
            artist: trackData.artists[0].name,
            previewUrl: trackData.preview_url,
            albumCover: trackData.album.images[0].url
        };
        localStorage.setItem("currentTrack", JSON.stringify(currentTrack));
    } else {
        alert("Canción no encontrada");
    }
});

// Función para navegar a player.html
function navigateToPlayer() {
    location.href = './player.html';
}
