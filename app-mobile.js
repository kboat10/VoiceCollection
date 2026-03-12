// Mobile Voice Recording App
class VoiceRecorder {
    constructor() {
        this.isRecording = false;
        this.isPaused = false;
        this.isResearchMode = false;
        this.audioStream = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.animationFrame = null;
        this.maxDurationTimeout = null;
        this.recordedChunks = [];
        this.recordingSampleRate = CONFIG.recording.sampleRate;
        this.mediaSource = null;
        this.processorNode = null;
        this.silenceGain = null;
        
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
        
        // Track pending uploads (for background submission)
        this.pendingUploads = 0;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupElements();
        this.attachEventListeners();
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
            themeToggle: document.getElementById('theme-toggle'),
            welcomeModal: document.getElementById('welcome-modal'),
            playbackModal: document.getElementById('playback-modal'),
            playbackAudio: document.getElementById('playback-audio'),
            playbackPhrase: document.getElementById('playback-phrase'),
            playbackMeta: document.getElementById('playback-meta'),
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
            this.showToast('Record as many or as few as you\'d like. Speak clearly! 🎤', 'success');
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

            await this.setupAudioProcessing();

            this.isRecording = true;
            this.isPaused = false;
            this.elapsedTime = 0;
            this.startTime = Date.now() - this.elapsedTime;
            
            // Update UI
            this.elements.recordBtn.classList.add('recording');
            this.elements.pauseBtn.disabled = false;
            this.elements.stopBtn.disabled = false;
            this.elements.statusBadge.classList.add('active');
            this.resetPauseButton();
            
            // Start timer and waveform
            this.startTimer();
            this.startWaveformAnimation();

            this.maxDurationTimeout = setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            }, CONFIG.recording.maxDuration * 1000);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showToast(error.message || 'Unable to start recording.', 'error');
            this.cleanupAudioResources();
        }
    }

    async setupAudioProcessing() {
        this.recordedChunks = [];
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: CONFIG.recording.sampleRate
        });
        await this.audioContext.resume();

        this.recordingSampleRate = this.audioContext.sampleRate;
        this.mediaSource = this.audioContext.createMediaStreamSource(this.audioStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.processorNode.onaudioprocess = (event) => {
            if (!this.isRecording || this.isPaused) {
                return;
            }

            const inputData = event.inputBuffer.getChannelData(0);
            this.recordedChunks.push(new Float32Array(inputData));
        };

        this.silenceGain = this.audioContext.createGain();
        this.silenceGain.gain.value = 0;

        this.mediaSource.connect(this.analyser);
        this.mediaSource.connect(this.processorNode);
        this.processorNode.connect(this.silenceGain);
        this.silenceGain.connect(this.audioContext.destination);
    }
    
    pauseRecording() {
        if (!this.isRecording) {
            return;
        }

        if (this.isPaused) {
            this.isPaused = false;
            this.startTime = Date.now() - this.elapsedTime;
            this.startTimer();
            this.resetPauseButton();
        } else {
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
        if (!this.isRecording) {
            return;
        }

        const durationMs = this.isPaused ? this.elapsedTime : Date.now() - this.startTime;
        const audioBlob = this.buildWavBlob();

        this.isRecording = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        if (this.maxDurationTimeout) {
            clearTimeout(this.maxDurationTimeout);
            this.maxDurationTimeout = null;
        }
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;

        this.elements.recordBtn.classList.remove('recording');
        this.elements.pauseBtn.disabled = true;
        this.elements.stopBtn.disabled = true;
        this.elements.statusBadge.classList.remove('active');
        this.resetPauseButton();

        this.cleanupAudioResources();
        this.clearWaveform();
        this.handleRecordingStop(audioBlob, durationMs / 1000);
    }
    
    handleRecordingStop(audioBlob, duration) {
        const audioUrl = URL.createObjectURL(audioBlob);

        if (duration < CONFIG.recording.minDuration) {
            this.showToast(`Recording too short. Please record at least ${CONFIG.recording.minDuration} seconds.`, 'error');
            this.resetRecording();
            return;
        }
        
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
        this.elements.playbackMeta.textContent = `Upload format: WAV, sample rate: ${this.formatSampleRate(this.recordingSampleRate)} Hz, channels: mono`;
        this.showModal('playback-modal');
        
        // Reset timer
        this.elapsedTime = 0;
        this.elements.timerDisplay.textContent = '00:00:00';
    }
    
    submitRecording() {
        if (!this.currentRecording) return;
        
        this.hideModal('playback-modal');
        
        // Increment completed recordings count immediately
        this.completedRecordingsCount++;
        localStorage.setItem('completedRecordingsCount', this.completedRecordingsCount.toString());
        
        // Show thank you modal after 3 recordings (only once)
        if (this.completedRecordingsCount === 3 && !this.hasSeenThankYouModal) {
            this.showThankYouModal();
        }
        
        // Move to next phrase if in research mode (do this immediately for UX)
        if (this.isResearchMode) {
            this.currentPhraseIndex++;
            if (this.currentPhraseIndex >= this.phrases.length) {
                this.showToast('All phrases completed! Uploads continue in background.', 'info');
                this.isResearchMode = false;
                this.elements.phraseDisplay.classList.add('hidden');
            } else {
                this.displayCurrentPhrase();
            }
        }
        
        // Show feedback that this recording is queued
        const pending = this.pendingUploads + 1;
        this.showToast(`Recording queued for upload (${pending} pending)...`, 'info');
        
        // Fire off the upload in the background (no await)
        const recordingToUpload = this.currentRecording;
        this.currentRecording = null;
        this.recordedChunks = [];
        this.elapsedTime = 0;
        this.elements.timerDisplay.textContent = '00:00:00';
        
        // Start background upload
        this.uploadRecordingAsync(recordingToUpload);
    }
    
    uploadRecordingAsync(recording) {
        this.pendingUploads++;
        
        this.uploadRecording(recording.blob)
            .then(uploadResult => {
                this.pendingUploads--;
                const featureCount = uploadResult.features_extracted ?? 'unknown';
                const totalRows = uploadResult.total_rows_in_csv ?? 'unknown';
                this.showToast(`✓ Uploaded. Features: ${featureCount}, Rows: ${totalRows}`, 'success');
            })
            .catch(error => {
                this.pendingUploads--;
                console.error('Background upload error:', error);
                this.showToast(`⚠ Upload failed: ${error.message}`, 'error');
            });
    }
    
    async uploadRecording(audioBlob) {
        const formData = new FormData();
        
        if (audioBlob.type !== 'audio/wav') {
            throw new Error(`Unexpected recorded format: ${audioBlob.type || 'unknown'}.`);
        }

        const filename = `recording_${this.sessionId}_${this.currentPhraseIndex}.wav`;
        formData.append('file', audioBlob, filename);

        let response;
        try {
            response = await fetch(CONFIG.api.endpoint, {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Upload could not reach the API. This is usually a network or CORS issue on the remote server.');
            }

            throw error;
        }
        
        const responseText = await response.text();
        let responseData = {};
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            responseData = { error: responseText || 'Upload failed' };
        }

        if (!response.ok) {
            if (response.status === 415) {
                throw new Error('The API rejected the WAV file format. Confirm the endpoint accepts PCM WAV uploads from the browser.');
            }

            throw new Error(responseData.error || responseData.message || `Upload failed (${response.status})`);
        }

        if (responseData.status !== 'ok') {
            throw new Error(responseData.error || responseData.message || 'Unexpected API response. The upload may have reached the server but did not return the expected success payload.');
        }

        return responseData;
    }
    
    resetRecording() {
        this.currentRecording = null;
        this.recordedChunks = [];
        this.elapsedTime = 0;
        this.elements.timerDisplay.textContent = '00:00:00';
        this.resetPauseButton();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.elements.timerDisplay.textContent = this.formatTime(this.elapsedTime);
        }, 100);
    }
    
    startWaveformAnimation() {
        if (!this.audioStream || !this.analyser || !this.dataArray) return;
        
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
    }

    cleanupAudioResources() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        if (this.mediaSource) {
            this.mediaSource.disconnect();
            this.mediaSource = null;
        }

        if (this.processorNode) {
            this.processorNode.disconnect();
            this.processorNode.onaudioprocess = null;
            this.processorNode = null;
        }

        if (this.silenceGain) {
            this.silenceGain.disconnect();
            this.silenceGain = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.dataArray = null;
    }

    buildWavBlob() {
        if (this.recordedChunks.length === 0) {
            return new Blob([], { type: 'audio/wav' });
        }

        const mergedSamples = this.mergeBuffers(this.recordedChunks);
        const targetSampleRate = Math.min(CONFIG.recording.sampleRate, this.recordingSampleRate);
        const processedSamples = this.recordingSampleRate === targetSampleRate
            ? mergedSamples
            : this.downsampleBuffer(mergedSamples, this.recordingSampleRate, targetSampleRate);

        return this.encodeWav(processedSamples, targetSampleRate);
    }

    mergeBuffers(chunks) {
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;

        chunks.forEach((chunk) => {
            merged.set(chunk, offset);
            offset += chunk.length;
        });

        return merged;
    }

    downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
        if (outputSampleRate >= inputSampleRate) {
            return buffer;
        }

        const sampleRateRatio = inputSampleRate / outputSampleRate;
        const newLength = Math.round(buffer.length / sampleRateRatio);
        const result = new Float32Array(newLength);
        let offsetBuffer = 0;

        for (let index = 0; index < result.length; index++) {
            const nextOffsetBuffer = Math.round((index + 1) * sampleRateRatio);
            let accum = 0;
            let count = 0;

            for (let sourceIndex = offsetBuffer; sourceIndex < nextOffsetBuffer && sourceIndex < buffer.length; sourceIndex++) {
                accum += buffer[sourceIndex];
                count++;
            }

            result[index] = count > 0 ? accum / count : 0;
            offsetBuffer = nextOffsetBuffer;
        }

        return result;
    }

    encodeWav(samples, sampleRate) {
        const bytesPerSample = 2;
        const blockAlign = bytesPerSample;
        const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
        const view = new DataView(buffer);

        this.writeAsciiString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * bytesPerSample, true);
        this.writeAsciiString(view, 8, 'WAVE');
        this.writeAsciiString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        this.writeAsciiString(view, 36, 'data');
        view.setUint32(40, samples.length * bytesPerSample, true);

        let offset = 44;
        for (let index = 0; index < samples.length; index++) {
            const clampedSample = Math.max(-1, Math.min(1, samples[index]));
            view.setInt16(offset, clampedSample < 0 ? clampedSample * 0x8000 : clampedSample * 0x7FFF, true);
            offset += bytesPerSample;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    writeAsciiString(view, offset, value) {
        for (let index = 0; index < value.length; index++) {
            view.setUint8(offset + index, value.charCodeAt(index));
        }
    }

    resetPauseButton() {
        this.elements.pauseBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
        `;
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

    formatSampleRate(sampleRate) {
        return Math.round(sampleRate).toLocaleString('en-US');
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
