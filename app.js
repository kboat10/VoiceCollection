// Voice Recording Application
// Main application logic

class VoiceRecordingApp {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.phrases = [];
        this.currentPhraseIndex = 0;
        this.recordings = [];
        this.skippedPhrases = [];
        this.startTime = Date.now();
        
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioStream = null;
        this.recordingStartTime = null;
        this.timerInterval = null;
        this.audioContext = null;
        this.analyser = null;
        this.waveformInterval = null;
        
        this.isPracticeMode = false;
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        this.shufflePhrases();
        this.loadSession();
        this.attachEventListeners();
        this.updateProgressDisplay();
        
        console.log(`Session started: ${this.sessionId}`);
    }

    // Generate unique session ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Shuffle phrases for randomization
    shufflePhrases() {
        this.phrases = [...CONFIG.phrases];
        for (let i = this.phrases.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.phrases[i], this.phrases[j]] = [this.phrases[j], this.phrases[i]];
        }
    }

    // Load session from localStorage if available
    loadSession() {
        if (!CONFIG.session.enableLocalStorage) return;
        
        const savedSession = localStorage.getItem(CONFIG.session.storagePrefix + 'session');
        if (savedSession) {
            try {
                const data = JSON.parse(savedSession);
                if (data.sessionId && Date.now() - data.timestamp < 86400000) { // 24 hours
                    this.sessionId = data.sessionId;
                    this.currentPhraseIndex = data.currentPhraseIndex || 0;
                    this.recordings = data.recordings || [];
                    this.skippedPhrases = data.skippedPhrases || [];
                }
            } catch (e) {
                console.error('Error loading session:', e);
            }
        }
    }

    // Save session to localStorage
    saveSession() {
        if (!CONFIG.session.enableLocalStorage) return;
        
        const sessionData = {
            sessionId: this.sessionId,
            currentPhraseIndex: this.currentPhraseIndex,
            recordings: this.recordings,
            skippedPhrases: this.skippedPhrases,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(CONFIG.session.storagePrefix + 'session', JSON.stringify(sessionData));
        } catch (e) {
            console.error('Error saving session:', e);
        }
    }

    // Clear session from localStorage
    clearSession() {
        if (CONFIG.session.enableLocalStorage) {
            localStorage.removeItem(CONFIG.session.storagePrefix + 'session');
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Welcome screen
        document.getElementById('consent-checkbox').addEventListener('change', (e) => {
            document.getElementById('start-btn').disabled = !e.target.checked;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('recording-screen');
            this.displayCurrentPhrase();
        });
        
        if (CONFIG.ui.enablePracticeMode) {
            document.getElementById('practice-btn').addEventListener('click', () => {
                this.isPracticeMode = true;
                this.showScreen('practice-screen');
            });
            
            document.getElementById('practice-record-btn').addEventListener('click', () => {
                this.toggleRecording(true);
            });
            
            document.getElementById('practice-redo-btn').addEventListener('click', () => {
                this.resetRecording(true);
            });
            
            document.getElementById('practice-continue-btn').addEventListener('click', () => {
                this.isPracticeMode = false;
                this.showScreen('recording-screen');
                this.displayCurrentPhrase();
            });
        }
        
        // Recording screen
        document.getElementById('record-btn').addEventListener('click', () => {
            this.toggleRecording(false);
        });
        
        document.getElementById('redo-btn').addEventListener('click', () => {
            this.resetRecording(false);
        });
        
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitRecording();
        });
        
        if (CONFIG.ui.allowSkip) {
            document.getElementById('skip-btn').addEventListener('click', () => {
                this.skipPhrase();
            });
        }
        
        document.getElementById('break-btn').addEventListener('click', () => {
            this.takeBreak();
        });
        
        // Break screen
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.showScreen('recording-screen');
        });
        
        // Completion screen
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartSession();
        });
        
        // Error modal
        document.getElementById('error-close-btn').addEventListener('click', () => {
            this.hideError();
        });
    }

    // Show specific screen
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // Display current phrase
    displayCurrentPhrase() {
        if (this.currentPhraseIndex >= this.phrases.length) {
            this.completeSession();
            return;
        }
        
        const phrase = this.phrases[this.currentPhraseIndex];
        document.getElementById('current-phrase').textContent = phrase;
        this.updateProgressDisplay();
        this.resetRecording(false);
    }

    // Update progress display
    updateProgressDisplay() {
        const completed = this.recordings.length;
        const total = this.phrases.length;
        const percentage = (completed / total) * 100;
        
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${completed} / ${total}`;
    }

    // Toggle recording
    async toggleRecording(isPractice) {
        const recordBtn = isPractice ? 
            document.getElementById('practice-record-btn') : 
            document.getElementById('record-btn');
        
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            await this.startRecording(isPractice);
        } else {
            this.stopRecording(isPractice);
        }
    }

    // Start recording
    async startRecording(isPractice) {
        try {
            // Request microphone permission
            this.audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: CONFIG.recording.sampleRate,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            // Setup MediaRecorder
            const options = {
                mimeType: CONFIG.recording.mimeType,
                audioBitsPerSecond: CONFIG.recording.audioBitsPerSecond
            };
            
            // Check if the specified mimeType is supported
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                // Try fallback formats
                if (MediaRecorder.isTypeSupported('audio/webm')) {
                    options.mimeType = 'audio/webm';
                } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    options.mimeType = 'audio/mp4';
                } else {
                    options.mimeType = '';
                }
            }
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, options);
            this.audioChunks = [];
            
            this.mediaRecorder.addEventListener('dataavailable', event => {
                this.audioChunks.push(event.data);
            });
            
            this.mediaRecorder.addEventListener('stop', () => {
                this.handleRecordingStop(isPractice);
            });
            
            this.mediaRecorder.start();
            this.recordingStartTime = Date.now();
            
            // Update UI
            const recordBtn = isPractice ? 
                document.getElementById('practice-record-btn') : 
                document.getElementById('record-btn');
            recordBtn.classList.add('recording');
            recordBtn.querySelector('.btn-text').textContent = 'Stop Recording';
            
            // Start timer
            this.startTimer(isPractice);
            
            // Start waveform visualization
            if (CONFIG.ui.showWaveform) {
                this.startWaveformVisualization(isPractice);
            }
            
            // Auto-stop after max duration
            setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.stopRecording(isPractice);
                }
            }, CONFIG.recording.maxDuration * 1000);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Microphone access denied. Please allow microphone access to record audio.');
        }
    }

    // Stop recording
    stopRecording(isPractice) {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            
            // Stop all audio tracks
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
            }
            
            // Update UI
            const recordBtn = isPractice ? 
                document.getElementById('practice-record-btn') : 
                document.getElementById('record-btn');
            recordBtn.classList.remove('recording');
            recordBtn.querySelector('.btn-text').textContent = 'Start Recording';
            
            // Stop timer
            this.stopTimer(isPractice);
            
            // Stop waveform
            this.stopWaveformVisualization();
        }
    }

    // Handle recording stop
    handleRecordingStop(isPractice) {
        const audioBlob = new Blob(this.audioChunks, { type: CONFIG.recording.mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const duration = (Date.now() - this.recordingStartTime) / 1000;
        
        // Check minimum duration
        if (duration < CONFIG.recording.minDuration) {
            this.showError(`Recording too short. Please record for at least ${CONFIG.recording.minDuration} seconds.`);
            this.resetRecording(isPractice);
            return;
        }
        
        // Show playback section
        const audioElement = isPractice ? 
            document.getElementById('practice-audio') : 
            document.getElementById('audio-playback');
        const playbackSection = isPractice ?
            document.getElementById('practice-playback') :
            document.getElementById('playback-section');
        
        audioElement.src = audioUrl;
        playbackSection.classList.remove('hidden');
        
        // Store recording data (only for non-practice)
        if (!isPractice) {
            this.currentRecording = {
                blob: audioBlob,
                url: audioUrl,
                duration: duration,
                phraseIndex: this.currentPhraseIndex,
                phrase: this.phrases[this.currentPhraseIndex],
                timestamp: Date.now()
            };
        }
    }

    // Reset recording
    resetRecording(isPractice) {
        const playbackSection = isPractice ?
            document.getElementById('practice-playback') :
            document.getElementById('playback-section');
        playbackSection.classList.add('hidden');
        
        const recordBtn = isPractice ? 
            document.getElementById('practice-record-btn') : 
            document.getElementById('record-btn');
        recordBtn.disabled = false;
        
        this.currentRecording = null;
        this.audioChunks = [];
        
        // Reset timer display
        const timer = isPractice ? 
            document.getElementById('practice-timer') : 
            document.getElementById('timer');
        timer.textContent = '0:00';
        timer.classList.remove('recording');
    }

    // Submit recording
    async submitRecording() {
        if (!this.currentRecording) return;
        
        this.showLoading(true);
        
        try {
            // Prepare metadata
            const metadata = {
                sessionId: this.sessionId,
                phraseId: this.currentPhraseIndex,
                phraseText: this.currentRecording.phrase,
                timestamp: this.currentRecording.timestamp,
                duration: this.currentRecording.duration,
                audioFormat: CONFIG.recording.mimeType,
                sampleRate: CONFIG.recording.sampleRate,
                projectId: CONFIG.metadata.projectId,
                appVersion: CONFIG.metadata.appVersion,
                ...CONFIG.metadata.customFields
            };
            
            // Send to API
            await this.uploadRecording(this.currentRecording.blob, metadata);
            
            // Save to recordings array
            this.recordings.push({
                phraseIndex: this.currentPhraseIndex,
                phrase: this.currentRecording.phrase,
                timestamp: this.currentRecording.timestamp,
                duration: this.currentRecording.duration,
                uploaded: true
            });
            
            this.saveSession();
            
            // Show success message
            this.showStatus('Recording submitted successfully!', 'success');
            
            // Move to next phrase
            this.currentPhraseIndex++;
            
            // Check if break is needed
            if (CONFIG.ui.breakAfterRecordings > 0 && 
                this.recordings.length % CONFIG.ui.breakAfterRecordings === 0 &&
                this.currentPhraseIndex < this.phrases.length) {
                setTimeout(() => this.takeBreak(), 1000);
            } else {
                setTimeout(() => this.displayCurrentPhrase(), 1000);
            }
            
        } catch (error) {
            console.error('Error submitting recording:', error);
            this.showError('Failed to upload recording. Please check your connection and try again.');
        } finally {
            this.showLoading(false);
        }
    }

    // Upload recording to API
    async uploadRecording(audioBlob, metadata, attemptNumber = 1) {
        const formData = new FormData();
        
        // Add audio file (API expects 'file' field)
        // Determine file extension based on MIME type
        let extension = 'webm';
        if (CONFIG.recording.mimeType.includes('wav')) {
            extension = 'wav';
        } else if (CONFIG.recording.mimeType.includes('mp3')) {
            extension = 'mp3';
        } else if (CONFIG.recording.mimeType.includes('mp4')) {
            extension = 'mp4';
        } else if (CONFIG.recording.mimeType.includes('flac')) {
            extension = 'flac';
        }
        const filename = `recording_${metadata.sessionId}_${metadata.phraseId}.${extension}`;
        formData.append('file', audioBlob, filename);
        
        // Add label/metadata (API expects 'label' field)
        formData.append('label', JSON.stringify(metadata));
        
        // Prepare request options
        const options = {
            method: 'POST',
            body: formData,
            headers: {}
        };
        
        // Add authentication if configured
        if (CONFIG.api.authToken) {
            options.headers['Authorization'] = `Bearer ${CONFIG.api.authToken}`;
        }
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);
        options.signal = controller.signal;
        
        try {
            const response = await fetch(CONFIG.api.endpoint, options);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Upload successful:', result);
            return result;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Retry logic
            if (attemptNumber < CONFIG.api.retryAttempts) {
                console.log(`Upload failed, retrying (${attemptNumber}/${CONFIG.api.retryAttempts})...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.api.retryDelay));
                return this.uploadRecording(audioBlob, metadata, attemptNumber + 1);
            }
            
            throw error;
        }
    }

    // Skip current phrase
    skipPhrase() {
        this.skippedPhrases.push({
            phraseIndex: this.currentPhraseIndex,
            phrase: this.phrases[this.currentPhraseIndex],
            timestamp: Date.now()
        });
        
        this.saveSession();
        this.showStatus('Phrase skipped', 'info');
        
        this.currentPhraseIndex++;
        setTimeout(() => this.displayCurrentPhrase(), 500);
    }

    // Take a break
    takeBreak() {
        document.getElementById('break-completed').textContent = this.recordings.length;
        document.getElementById('break-remaining').textContent = this.phrases.length - this.currentPhraseIndex;
        this.showScreen('break-screen');
    }

    // Complete session
    completeSession() {
        const totalTime = Math.floor((Date.now() - this.startTime) / 60000);
        
        document.getElementById('total-recorded').textContent = this.recordings.length;
        document.getElementById('total-time').textContent = totalTime;
        document.getElementById('session-id-display').textContent = this.sessionId;
        
        this.showScreen('completion-screen');
        this.clearSession();
    }

    // Restart session
    restartSession() {
        this.currentPhraseIndex = 0;
        this.recordings = [];
        this.skippedPhrases = [];
        this.shufflePhrases();
        this.showScreen('recording-screen');
        this.displayCurrentPhrase();
    }

    // Timer functions
    startTimer(isPractice) {
        const timer = isPractice ? 
            document.getElementById('practice-timer') : 
            document.getElementById('timer');
        timer.classList.add('recording');
        
        let seconds = 0;
        this.timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer(isPractice) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const timer = isPractice ? 
            document.getElementById('practice-timer') : 
            document.getElementById('timer');
        timer.classList.remove('recording');
    }

    // Waveform visualization
    startWaveformVisualization(isPractice) {
        if (!this.audioStream) return;
        
        const container = isPractice ? 
            document.getElementById('practice-waveform') : 
            document.getElementById('waveform');
        
        // Create audio context and analyser
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        source.connect(this.analyser);
        
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Create waveform bars
        container.innerHTML = '';
        const barCount = 50;
        const bars = [];
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            bar.style.height = '2px';
            container.appendChild(bar);
            bars.push(bar);
        }
        
        // Animate waveform
        const animate = () => {
            this.analyser.getByteFrequencyData(dataArray);
            
            bars.forEach((bar, index) => {
                const dataIndex = Math.floor(index * bufferLength / barCount);
                const value = dataArray[dataIndex];
                const height = Math.max(2, (value / 255) * 80);
                bar.style.height = `${height}px`;
            });
            
            this.waveformInterval = requestAnimationFrame(animate);
        };
        
        animate();
    }

    stopWaveformVisualization() {
        if (this.waveformInterval) {
            cancelAnimationFrame(this.waveformInterval);
            this.waveformInterval = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    // UI helper functions
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        statusElement.className = `status-message show ${type}`;
        
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 3000);
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-modal').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-modal').classList.add('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
    }
    
    // Initialize the app
    window.app = new VoiceRecordingApp();
});
