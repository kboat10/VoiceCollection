// Mobile Voice Recording App
class VoiceRecorder {
    constructor() {
        this.isRecording = false;
        this.isPaused = false;
        this.isResearchMode = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioStream = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.animationFrame = null;
        
        // Research mode
        this.phrases = [];
        this.currentPhraseIndex = 0;
        this.sessionId = this.generateSessionId();
        this.recordings = [];
        
        // Audio context for waveform
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        // Track completed recordings for thank you modal
        this.completedRecordingsCount = parseInt(localStorage.getItem('completedRecordingsCount') || '0');
        this.hasSeenThankYouModal = localStorage.getItem('hasSeenThankYouModal') === 'true';
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupElements();
        this.attachEventListeners();
        this.loadRecentRecordings();
        this.checkFirstVisit();
        this.setupWaveform();
        
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    setupElements() {
        this.elements = {
            recordBtn: document.getElementById('record-btn-new'),
            pauseBtn: document.getElementById('pause-btn'),
            stopBtn: document.getElementById('stop-btn'),
            timerDisplay: document.getElementById('timer-display'),
            statusBadge: document.getElementById('status-badge'),
            waveformCanvas: document.getElementById('waveform-canvas'),
            phraseDisplay: document.getElementById('phrase-display'),
            phraseText: document.getElementById('phrase-text'),
            
            // Thank you modal elements
            thankYouModal: document.getElementById('thank-you-modal'),
            stopHereBtn: document.getElementById('stop-here-btn'),
            continueRecordingBtn: document.getElementById('continue-recording-btn'),
            phraseCounter: document.getElementById('phrase-counter'),
            recordsList: document.getElementById('records-list'),
            themeToggle: document.getElementById('theme-toggle'),
            welcomeModal: document.getElementById('welcome-modal'),
            playbackModal: document.getElementById('playback-modal'),
            playbackAudio: document.getElementById('playback-audio'),
            playbackPhrase: document.getElementById('playback-phrase'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toast-message')
        };
    }
    
    attachEventListeners() {
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Consent checkbox
        const consentCheckbox = document.getElementById('consent-checkbox-main');
        const startBtn = document.getElementById('start-research-btn');
        
        consentCheckbox?.addEventListener('change', (e) => {
            startBtn.disabled = !e.target.checked;
        });
        
        // Welcome modal
        startBtn?.addEventListener('click', () => {
            if (consentCheckbox && !consentCheckbox.checked) {
                this.showToast('Please check the consent box to continue', 'error');
                return;
            }
            
            this.isResearchMode = true;
            this.shufflePhrases();
            this.elements.phraseDisplay.classList.remove('hidden');
            this.displayCurrentPhrase();
            this.hideModal('welcome-modal');
            this.showToast('Thank you for participating!', 'success');
        });
        
        document.getElementById('decline-btn')?.addEventListener('click', () => {
            this.hideModal('welcome-modal');
            this.showToast('You declined to participate. You can still use free recording mode.', 'info');
        });
        
        // Thank you modal buttons
        this.elements.stopHereBtn?.addEventListener('click', () => this.handleStopHere());
        this.elements.continueRecordingBtn?.addEventListener('click', () => this.handleContinueRecording());
        
        // Playback modal
        document.getElementById('redo-recording-btn')?.addEventListener('click', () => {
            this.hideModal('playback-modal');
            this.resetRecording();
        });
        
        document.getElementById('submit-recording-btn')?.addEventListener('click', () => {
            this.submitRecording();
        });
    }
    
    setupWaveform() {
        const canvas = this.elements.waveformCanvas;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        this.canvasContext = canvas.getContext('2d');
    }
    
    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: CONFIG.recording.sampleRate,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            const options = {
                mimeType: CONFIG.recording.mimeType,
                audioBitsPerSecond: CONFIG.recording.audioBitsPerSecond
            };
            
            // Check format support
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                if (MediaRecorder.isTypeSupported('audio/webm')) {
                    options.mimeType = 'audio/webm';
                } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    options.mimeType = 'audio/mp4';
                }
            }
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, options);
            this.audioChunks = [];
            
            this.mediaRecorder.addEventListener('dataavailable', event => {
                this.audioChunks.push(event.data);
            });
            
            this.mediaRecorder.addEventListener('stop', () => {
                this.handleRecordingStop();
            });
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.isPaused = false;
            this.startTime = Date.now() - this.elapsedTime;
            
            // Update UI
            this.elements.recordBtn.classList.add('recording');
            this.elements.pauseBtn.disabled = false;
            this.elements.stopBtn.disabled = false;
            this.elements.statusBadge.classList.add('active');
            
            // Start timer and waveform
            this.startTimer();
            this.startWaveformAnimation();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showToast('Microphone access denied', 'error');
        }
    }
    
    pauseRecording() {
        if (this.isPaused) {
            // Resume
            this.mediaRecorder.resume();
            this.isPaused = false;
            this.startTime = Date.now() - this.elapsedTime;
            this.startTimer();
            this.elements.pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
            `;
        } else {
            // Pause
            this.mediaRecorder.pause();
            this.isPaused = true;
            clearInterval(this.timerInterval);
            this.elements.pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.audioStream.getTracks().forEach(track => track.stop());
            
            this.isRecording = false;
            this.isPaused = false;
            clearInterval(this.timerInterval);
            cancelAnimationFrame(this.animationFrame);
            
            // Update UI
            this.elements.recordBtn.classList.remove('recording');
            this.elements.pauseBtn.disabled = true;
            this.elements.stopBtn.disabled = true;
            this.elements.statusBadge.classList.remove('active');
            
            // Clear waveform
            this.clearWaveform();
        }
    }
    
    handleRecordingStop() {
        const actualMimeType = this.mediaRecorder.mimeType;
        const audioBlob = new Blob(this.audioChunks, { type: actualMimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = this.elapsedTime / 1000;
        
        // Store current recording
        this.currentRecording = {
            blob: audioBlob,
            url: audioUrl,
            duration: duration,
            phraseIndex: this.currentPhraseIndex,
            phrase: this.isResearchMode ? this.phrases[this.currentPhraseIndex] : null,
            timestamp: Date.now()
        };
        
        // Show playback modal
        this.elements.playbackAudio.src = audioUrl;
        if (this.isResearchMode) {
            this.elements.playbackPhrase.textContent = this.currentRecording.phrase;
        } else {
            this.elements.playbackPhrase.textContent = `Recording ${this.formatDuration(duration)}`;
        }
        this.showModal('playback-modal');
        
        // Reset timer
        this.elapsedTime = 0;
        this.elements.timerDisplay.textContent = '00:00:00';
    }
    
    async submitRecording() {
        if (!this.currentRecording) return;
        
        this.hideModal('playback-modal');
        this.showToast('Uploading...', 'info');
        
        try {
            const metadata = {
                sessionId: this.sessionId,
                phraseId: this.currentPhraseIndex,
                phraseText: this.currentRecording.phrase || 'Free recording',
                timestamp: this.currentRecording.timestamp,
                duration: this.currentRecording.duration,
                audioFormat: this.currentRecording.blob.type,
                sampleRate: CONFIG.recording.sampleRate,
                projectId: CONFIG.metadata.projectId,
                appVersion: CONFIG.metadata.appVersion
            };
            
            await this.uploadRecording(this.currentRecording.blob, metadata);
            
            // Add to recent recordings
            this.addToRecentRecordings({
                name: this.isResearchMode ? 
                    `Phrase ${this.currentPhraseIndex + 1}` : 
                    `Recording_${Date.now()}`,
                duration: this.currentRecording.duration,
                url: this.currentRecording.url,
                timestamp: Date.now()
            });
            
            this.showToast('Recording uploaded successfully!', 'success');
            
            // Increment completed recordings count
            this.completedRecordingsCount++;
            localStorage.setItem('completedRecordingsCount', this.completedRecordingsCount.toString());
            
            // Show thank you modal after 3 recordings (only once)
            if (this.completedRecordingsCount === 3 && !this.hasSeenThankYouModal) {
                this.showThankYouModal();
            }
            
            // Move to next phrase if in research mode
            if (this.isResearchMode) {
                this.currentPhraseIndex++;
                if (this.currentPhraseIndex >= this.phrases.length) {
                    this.showToast('All phrases completed!', 'success');
                    this.isResearchMode = false;
                    this.elements.phraseDisplay.classList.add('hidden');
                } else {
                    this.displayCurrentPhrase();
                }
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('Upload failed. Please try again.', 'error');
        }
    }
    
    async uploadRecording(audioBlob, metadata) {
        const formData = new FormData();
        
        let extension = 'webm';
        const actualMimeType = audioBlob.type;
        if (actualMimeType.includes('wav')) extension = 'wav';
        else if (actualMimeType.includes('mp3')) extension = 'mp3';
        else if (actualMimeType.includes('mp4')) extension = 'mp4';
        
        const filename = `recording_${metadata.sessionId}_${metadata.phraseId}.${extension}`;
        formData.append('file', audioBlob, filename);
        formData.append('label', JSON.stringify(metadata));
        
        const response = await fetch(CONFIG.api.endpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }
        
        return await response.json();
    }
    
    resetRecording() {
        this.currentRecording = null;
        this.audioChunks = [];
        this.elapsedTime = 0;
        this.elements.timerDisplay.textContent = '00:00:00';
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.elements.timerDisplay.textContent = this.formatTime(this.elapsedTime);
        }, 100);
    }
    
    startWaveformAnimation() {
        if (!this.audioStream) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        source.connect(this.analyser);
        
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        this.drawWaveform();
    }
    
    drawWaveform() {
        this.animationFrame = requestAnimationFrame(() => this.drawWaveform());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        const canvas = this.elements.waveformCanvas;
        const ctx = this.canvasContext;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const barCount = 60;
        const barWidth = width / barCount;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#A78BFA');
        gradient.addColorStop(1, '#7C3AED');
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * this.dataArray.length / barCount);
            const barHeight = (this.dataArray[dataIndex] / 255) * height * 0.8;
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
    }
    
    clearWaveform() {
        const canvas = this.elements.waveformCanvas;
        const ctx = this.canvasContext;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
    
    // Research mode functions
    shufflePhrases() {
        this.phrases = [...CONFIG.phrases];
        for (let i = this.phrases.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.phrases[i], this.phrases[j]] = [this.phrases[j], this.phrases[i]];
        }
    }
    
    displayCurrentPhrase() {
        if (this.currentPhraseIndex >= this.phrases.length) return;
        
        this.elements.phraseText.textContent = this.phrases[this.currentPhraseIndex];
        this.elements.phraseCounter.textContent = 
            `${this.currentPhraseIndex + 1} / ${this.phrases.length}`;
    }
    
    // Recent recordings
    addToRecentRecordings(recording) {
        let recentRecordings = JSON.parse(localStorage.getItem('recentRecordings') || '[]');
        recentRecordings.unshift(recording);
        recentRecordings = recentRecordings.slice(0, 10); // Keep only 10
        localStorage.setItem('recentRecordings', JSON.stringify(recentRecordings));
        this.loadRecentRecordings();
    }
    
    loadRecentRecordings() {
        const recentRecordings = JSON.parse(localStorage.getItem('recentRecordings') || '[]');
        this.elements.recordsList.innerHTML = '';
        
        if (recentRecordings.length === 0) {
            this.elements.recordsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No recordings yet</p>';
            return;
        }
        
        recentRecordings.forEach((recording, index) => {
            const item = document.createElement('div');
            item.className = 'record-item';
            item.innerHTML = `
                <div class="play-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
                <div class="record-info">
                    <div class="record-name">${recording.name}</div>
                    <div class="record-duration">${this.formatDuration(recording.duration)}</div>
                </div>
                <div class="record-actions">
                    <button class="icon-btn delete-btn" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Play recording
            item.querySelector('.play-icon').addEventListener('click', () => {
                if (recording.url) {
                    const audio = new Audio(recording.url);
                    audio.play();
                }
            });
            
            // Delete recording
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteRecording(index);
            });
            
            this.elements.recordsList.appendChild(item);
        });
    }
    
    deleteRecording(index) {
        let recentRecordings = JSON.parse(localStorage.getItem('recentRecordings') || '[]');
        recentRecordings.splice(index, 1);
        localStorage.setItem('recentRecordings', JSON.stringify(recentRecordings));
        this.loadRecentRecordings();
        this.showToast('Recording deleted', 'info');
    }
    
    // UI helpers
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
    
    showToast(message, type = 'info') {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.toast.classList.add('hidden');
        }, 3000);
    }
    
    checkFirstVisit() {
        // Always show consent modal on page load (it's not hidden by default)
        // Modal will be hidden when user consents or declines
    }
    
    showThankYouModal() {
        this.hasSeenThankYouModal = true;
        localStorage.setItem('hasSeenThankYouModal', 'true');
        this.showModal('thank-you-modal');
    }
    
    handleStopHere() {
        this.hideModal('thank-you-modal');
        this.showToast(`Thank you! You've contributed ${this.completedRecordingsCount} valuable recordings to our research. 🎉`, 'success');
        
        // Optionally exit research mode
        if (this.isResearchMode) {
            this.isResearchMode = false;
            this.elements.phraseDisplay.classList.add('hidden');
        }
        
        // Show summary message
        setTimeout(() => {
            this.showToast('You can close this window or continue browsing. Your recordings have been saved!', 'info');
        }, 3000);
    }
    
    handleContinueRecording() {
        this.hideModal('thank-you-modal');
        this.showToast('Great! Feel free to record more phrases at your own pace. 🎤', 'success');
    }
    
    // Utility functions
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}.${secs.toString().padStart(2, '0')} mins`;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser.');
        return;
    }
    
    window.voiceRecorder = new VoiceRecorder();
});
