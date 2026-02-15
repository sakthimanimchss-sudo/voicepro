/* ==========================================================================
   VoiceMaster Pro - Audio Player
   Version: 1.0.0
   Author: VoiceMaster Pro
   Description: Professional audio player with waveform visualization
   ========================================================================== */

(function() {
    "use strict";

    /* ----------------------------------------------------------------------
       1. AUDIO PLAYER CLASS
    ---------------------------------------------------------------------- */

    class AudioPlayer {
        constructor(element, options = {}) {
            // DOM Elements
            this.container = element;
            this.audio = new Audio();
            this.waveform = this.container.querySelector('.voice-waveform, .demo-waveform, .audio-visualizer-container');
            this.waveformCanvas = this.container.querySelector('canvas');
            this.waveformProgress = this.container.querySelector('.waveform-progress');
            this.playBtn = this.container.querySelector('.play-pause, .play-pause-large, .demo-play-btn, .demo-play-btn-sm, .track-play, .playlist-play-btn, .style-preview-btn, .audio-preview-btn');
            this.prevBtn = this.container.querySelector('#prevTrack, .prev-track');
            this.nextBtn = this.container.querySelector('#nextTrack, .next-track');
            this.volumeBtn = this.container.querySelector('.volume-btn, .volume-control');
            this.volumeSlider = this.container.querySelector('.volume-slider');
            this.currentTimeEl = this.container.querySelector('#currentTime, #currentTimeMain, #featuredCurrentTime, .current-time');
            this.durationEl = this.container.querySelector('#duration, #durationMain, #featuredDuration, .duration');
            this.trackTitle = this.container.querySelector('#currentTrackTitle, #featuredTrackTitle, .track-title');
            this.playlist = this.container.querySelector('.playlist, .playlist-grid, .demo-playlist ul');
            
            // Options
            this.options = {
                autoPlay: options.autoPlay || false,
                loop: options.loop || false,
                volume: options.volume || 0.8,
                waveformBars: options.waveformBars || 100,
                waveformColors: options.waveformColors || {
                    background: '#e5e7eb',
                    progress: '#6366f1',
                    played: '#4f46e5'
                },
                ...options
            };
            
            // State
            this.isPlaying = false;
            this.isMuted = false;
            this.currentTrack = null;
            this.currentTrackIndex = 0;
            this.tracks = [];
            this.audioContext = null;
            this.analyser = null;
            this.source = null;
            this.animationId = null;
            this.rafId = null;
            
            // Bind methods
            this.init = this.init.bind(this);
            this.loadTrack = this.loadTrack.bind(this);
            this.play = this.play.bind(this);
            this.pause = this.pause.bind(this);
            this.togglePlay = this.togglePlay.bind(this);
            this.prev = this.prev.bind(this);
            this.next = this.next.bind(this);
            this.setVolume = this.setVolume.bind(this);
            this.toggleMute = this.toggleMute.bind(this);
            this.updateProgress = this.updateProgress.bind(this);
            this.updateTime = this.updateTime.bind(this);
            this.drawWaveform = this.drawWaveform.bind(this);
            this.initAudioContext = this.initAudioContext.bind(this);
            this.loadTracks = this.loadTracks.bind(this);
            
            // Initialize
            this.init();
        }
        
        /* ------------------------------------------------------------------
           2. INITIALIZATION
        ------------------------------------------------------------------ */
        
        init() {
            this.loadTracks();
            this.initAudioContext();
            this.setupEventListeners();
            this.setVolume(this.options.volume);
            
            if (this.tracks.length > 0) {
                this.loadTrack(this.tracks[0], 0);
            }
            
            // Draw waveform if canvas exists
            if (this.waveformCanvas) {
                this.drawWaveform();
                window.addEventListener('resize', this.debounce(this.drawWaveform.bind(this), 250));
            }
            
            console.log('AudioPlayer initialized');
        }
        
        loadTracks() {
            // Load tracks from playlist items
            if (this.playlist) {
                const items = this.playlist.querySelectorAll('.playlist-item, .playlist-item-large, .demo-card');
                
                items.forEach((item, index) => {
                    const audioSrc = item.dataset.audio || item.querySelector('[data-audio]')?.dataset.audio;
                    
                    if (audioSrc) {
                        const title = item.querySelector('.track-name')?.textContent || 
                                    item.querySelector('h3')?.textContent || 
                                    `Track ${index + 1}`;
                        
                        const duration = item.querySelector('.track-duration, .demo-duration')?.textContent || '0:00';
                        
                        this.tracks.push({
                            src: audioSrc,
                            title: title,
                            duration: duration,
                            element: item
                        });
                        
                        // Add click event to playlist items
                        const playBtn = item.querySelector('.track-play, .demo-play-btn-sm, .playlist-play-btn, .audio-preview-btn');
                        if (playBtn) {
                            playBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.loadTrack(this.tracks[index], index);
                                this.play();
                            });
                        }
                        
                        // Add click event to the whole item
                        item.addEventListener('click', (e) => {
                            if (!e.target.closest('button')) {
                                this.loadTrack(this.tracks[index], index);
                                this.play();
                            }
                        });
                    }
                });
            }
            
            // Load featured track
            const featuredTrack = this.container.querySelector('[data-audio]');
            if (featuredTrack && !featuredTrack.closest('.playlist-item')) {
                const audioSrc = featuredTrack.dataset.audio;
                const title = featuredTrack.querySelector('h3')?.textContent || 'Featured Track';
                
                this.tracks.unshift({
                    src: audioSrc,
                    title: title,
                    duration: '0:00',
                    element: featuredTrack
                });
            }
        }
        
        initAudioContext() {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                
                // Create source from audio element
                this.source = this.audioContext.createMediaElementSource(this.audio);
                this.source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                
                // Resume AudioContext on user interaction
                const resumeAudioContext = () => {
                    if (this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                    document.removeEventListener('click', resumeAudioContext);
                    document.removeEventListener('touchstart', resumeAudioContext);
                };
                
                document.addEventListener('click', resumeAudioContext);
                document.addEventListener('touchstart', resumeAudioContext);
            } catch (error) {
                console.warn('Web Audio API not supported:', error);
            }
        }
        
        setupEventListeners() {
            // Audio element events
            this.audio.addEventListener('timeupdate', this.updateProgress);
            this.audio.addEventListener('timeupdate', this.updateTime);
            this.audio.addEventListener('loadedmetadata', this.updateTime);
            this.audio.addEventListener('ended', this.next);
            
            // Play button
            if (this.playBtn) {
                this.playBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.togglePlay();
                });
            }
            
            // Previous button
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.prev();
                });
            }
            
            // Next button
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.next();
                });
            }
            
            // Volume slider
            if (this.volumeSlider) {
                this.volumeSlider.addEventListener('input', (e) => {
                    this.setVolume(parseFloat(e.target.value) / 100);
                });
            }
            
            // Volume button (mute/unmute)
            if (this.volumeBtn) {
                this.volumeBtn.addEventListener('click', this.toggleMute);
            }
            
            // Waveform click to seek
            if (this.waveform) {
                this.waveform.addEventListener('click', (e) => {
                    const rect = this.waveform.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    this.audio.currentTime = percent * this.audio.duration;
                });
            }
        }
        
        /* ------------------------------------------------------------------
           3. PLAYER CONTROLS
        ------------------------------------------------------------------ */
        
        loadTrack(track, index) {
            if (!track) return;
            
            this.currentTrack = track;
            this.currentTrackIndex = index;
            
            // Update audio source
            this.audio.src = track.src;
            this.audio.load();
            
            // Update UI
            if (this.trackTitle) {
                this.trackTitle.textContent = track.title;
            }
            
            // Update active state in playlist
            if (this.playlist) {
                this.playlist.querySelectorAll('.playlist-item, .playlist-item-large, .demo-card').forEach(item => {
                    item.classList.remove('active');
                });
                
                if (track.element) {
                    track.element.classList.add('active');
                }
            }
            
            // Update duration display
            if (track.duration && this.durationEl) {
                this.durationEl.textContent = track.duration;
            }
        }
        
        play() {
            // Resume AudioContext if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    
                    // Update play button icons
                    document.querySelectorAll('.fa-play').forEach(icon => {
                        icon.classList.remove('fa-play');
                        icon.classList.add('fa-pause');
                    });
                    
                    // Start waveform animation
                    if (this.analyser) {
                        this.animateWaveform();
                    }
                })
                .catch(error => {
                    console.warn('Playback failed:', error);
                    this.isPlaying = false;
                });
        }
        
        pause() {
            this.audio.pause();
            this.isPlaying = false;
            
            // Update play button icons
            document.querySelectorAll('.fa-pause').forEach(icon => {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            });
            
            // Stop waveform animation
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }
        
        togglePlay() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }
        
        prev() {
            if (this.tracks.length > 0) {
                let prevIndex = this.currentTrackIndex - 1;
                if (prevIndex < 0) prevIndex = this.tracks.length - 1;
                this.loadTrack(this.tracks[prevIndex], prevIndex);
                this.play();
            }
        }
        
        next() {
            if (this.tracks.length > 0) {
                let nextIndex = this.currentTrackIndex + 1;
                if (nextIndex >= this.tracks.length) nextIndex = 0;
                this.loadTrack(this.tracks[nextIndex], nextIndex);
                this.play();
            }
        }
        
        setVolume(value) {
            const volume = Math.max(0, Math.min(1, value));
            this.audio.volume = volume;
            
            if (this.volumeSlider) {
                this.volumeSlider.value = volume * 100;
            }
            
            // Update volume icon
            if (this.volumeBtn) {
                const icon = this.volumeBtn.querySelector('i');
                if (icon) {
                    if (volume === 0) {
                        icon.className = 'fas fa-volume-mute';
                    } else if (volume < 0.5) {
                        icon.className = 'fas fa-volume-down';
                    } else {
                        icon.className = 'fas fa-volume-up';
                    }
                }
            }
            
            this.isMuted = volume === 0;
        }
        
        toggleMute() {
            if (this.isMuted) {
                this.setVolume(0.8); // Default volume
            } else {
                this.setVolume(0);
            }
        }
        
        /* ------------------------------------------------------------------
           4. PROGRESS & TIME
        ------------------------------------------------------------------ */
        
        updateProgress() {
            if (!this.audio.duration) return;
            
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            
            // Update waveform progress
            if (this.waveformProgress) {
                this.waveformProgress.style.width = `${percent}%`;
            }
            
            // Update progress bar in demo cards
            const demoProgress = this.container.querySelector('.demo-waveform-progress');
            if (demoProgress) {
                demoProgress.style.width = `${percent}%`;
            }
        }
        
        updateTime() {
            if (!this.currentTimeEl || !this.durationEl) return;
            
            const currentTime = this.audio.currentTime || 0;
            const duration = this.audio.duration || 0;
            
            this.currentTimeEl.textContent = this.formatTime(currentTime);
            
            if (duration) {
                this.durationEl.textContent = this.formatTime(duration);
            }
        }
        
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        
        /* ------------------------------------------------------------------
           5. WAVEFORM VISUALIZATION
        ------------------------------------------------------------------ */
        
        drawWaveform() {
            if (!this.waveformCanvas) return;
            
            const canvas = this.waveformCanvas;
            const ctx = canvas.getContext('2d');
            const width = canvas.width = canvas.clientWidth;
            const height = canvas.height = canvas.clientHeight;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw background waveform
            const barWidth = (width / this.options.waveformBars) * 0.8;
            const barSpacing = (width / this.options.waveformBars) * 0.2;
            const bars = this.options.waveformBars;
            
            ctx.fillStyle = this.options.waveformColors.background;
            
            for (let i = 0; i < bars; i++) {
                const barHeight = Math.random() * height * 0.8 + height * 0.1;
                const x = i * (barWidth + barSpacing) + barSpacing;
                const y = (height - barHeight) / 2;
                
                ctx.fillRect(x, y, barWidth, barHeight);
            }
        }
        
        animateWaveform() {
            if (!this.analyser || !this.waveformCanvas) return;
            
            const canvas = this.waveformCanvas;
            const ctx = canvas.getContext('2d');
            const width = canvas.width = canvas.clientWidth;
            const height = canvas.height = canvas.clientHeight;
            
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const draw = () => {
                this.rafId = requestAnimationFrame(draw);
                
                this.analyser.getByteFrequencyData(dataArray);
                
                ctx.clearRect(0, 0, width, height);
                
                const barWidth = (width / bufferLength) * 2.5;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * height;
                    
                    // Gradient color based on frequency
                    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                    gradient.addColorStop(0, this.options.waveformColors.progress);
                    gradient.addColorStop(1, this.options.waveformColors.played);
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                    
                    x += barWidth + 1;
                }
            };
            
            draw();
        }
        
        /* ------------------------------------------------------------------
           6. UTILITIES
        ------------------------------------------------------------------ */
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }

    /* ----------------------------------------------------------------------
       7. INITIALIZE ALL AUDIO PLAYERS
    ---------------------------------------------------------------------- */

    const initAudioPlayers = () => {
        // Find all audio player containers
        const playerContainers = document.querySelectorAll('.voice-player-container, .main-audio-player, .featured-player-wrapper, .demo-player-container');
        
        playerContainers.forEach(container => {
            new AudioPlayer(container);
        });
        
        // Initialize standalone audio preview buttons
        const previewBtns = document.querySelectorAll('.audio-preview-btn, .style-preview-btn');
        previewBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const audioSrc = this.dataset.audio;
                if (!audioSrc) return;
                
                const icon = this.querySelector('i');
                const isPlaying = icon.classList.contains('fa-pause');
                
                // Stop all other audio
                document.querySelectorAll('audio').forEach(audio => {
                    audio.pause();
                    audio.currentTime = 0;
                });
                
                // Reset all icons
                document.querySelectorAll('.fa-pause').forEach(pauseIcon => {
                    pauseIcon.classList.remove('fa-pause');
                    pauseIcon.classList.add('fa-play');
                });
                
                if (!isPlaying) {
                    const audio = new Audio(audioSrc);
                    audio.play();
                    
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                    
                    audio.addEventListener('ended', () => {
                        icon.classList.remove('fa-pause');
                        icon.classList.add('fa-play');
                    });
                    
                    // Store audio in dataset
                    this.dataset.audioInstance = audio;
                } else {
                    const audio = this.dataset.audioInstance;
                    if (audio) {
                        audio.pause();
                        icon.classList.remove('fa-pause');
                        icon.classList.add('fa-play');
                    }
                }
            });
        });
        
        console.log('Audio Players initialized');
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioPlayers);
    } else {
        initAudioPlayers();
    }

    // Export for global use
    window.AudioPlayer = AudioPlayer;

})();