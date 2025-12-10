import React, { useState, useRef, useEffect } from 'react';

const AudioNarration = ({ chapterId, studentId, textContent, language = 'en' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('player');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const audioRef = useRef(null);

  // Simulate getting available TTS voices
  useEffect(() => {
    // In a real implementation, this would use the Web Speech API or connect to a TTS service
    const voices = [
      { id: 'female1', name: 'Emma', language: 'en', gender: 'female', description: 'Clear and articulate' },
      { id: 'male1', name: 'James', language: 'en', gender: 'male', description: 'Professional and clear' },
      { id: 'female2', name: 'Sarah', language: 'en', gender: 'female', description: 'Warm and engaging' },
      { id: 'male2', name: 'Robert', language: 'en', gender: 'male', description: 'Deep and authoritative' },
      { id: 'urdu1', name: 'Fatima', language: 'ur', gender: 'female', description: 'Native Urdu speaker' },
      { id: 'urdu2', name: 'Ahmed', language: 'ur', gender: 'male', description: 'Clear Urdu pronunciation' }
    ];
    setAvailableVoices(voices);
    setSelectedVoice(voices[0]);
  }, []);

  const generateAudio = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call a TTS API
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate audio duration based on text length
      const estimatedDuration = textContent ? textContent.split(' ').length * 0.3 : 60;
      setDuration(estimatedDuration);
      setCurrentTime(0);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      // In a real implementation, pause the audio
    } else {
      setIsPlaying(true);
      // In a real implementation, play the audio
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
  };

  const handleVoiceChange = (voiceId) => {
    const voice = availableVoices.find(v => v.id === voiceId);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  // Generate audio when component mounts or text content changes
  useEffect(() => {
    if (textContent) {
      generateAudio();
    }
  }, [textContent]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-narration-container">
      <div className="narration-header">
        <h3>Audio Narration</h3>
        <div className="narration-controls">
          <select
            value={selectedVoice?.id || ''}
            onChange={(e) => handleVoiceChange(e.target.value)}
          >
            {availableVoices
              .filter(voice => voice.language === language)
              .map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.description})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="narration-tabs">
        <button
          className={activeTab === 'player' ? 'active' : ''}
          onClick={() => setActiveTab('player')}
        >
          Player
        </button>
        <button
          className={activeTab === 'voices' ? 'active' : ''}
          onClick={() => setActiveTab('voices')}
        >
          Voices
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="narration-content">
        {activeTab === 'player' && (
          <div className="player-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Generating audio narration...</p>
              </div>
            ) : (
              <>
                <div className="progress-container">
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="progress-bar" onClick={handleSeek}>
                    <div
                      className="progress-filled"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="player-controls">
                  <button
                    onClick={togglePlayPause}
                    className="control-btn play-pause"
                    disabled={isLoading}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>

                  <div className="playback-controls">
                    <button onClick={() => handlePlaybackRateChange(0.5)}>0.5x</button>
                    <button onClick={() => handlePlaybackRateChange(1)} className={playbackRate === 1 ? 'active' : ''}>1x</button>
                    <button onClick={() => handlePlaybackRateChange(1.25)}>1.25x</button>
                    <button onClick={() => handlePlaybackRateChange(1.5)}>1.5x</button>
                    <button onClick={() => handlePlaybackRateChange(2)}>2x</button>
                  </div>
                </div>

                <div className="volume-control">
                  <label>
                    <span>🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </label>
                </div>

                <div className="text-synchronization">
                  <h4>Text Synchronization</h4>
                  <div className="synchronized-text">
                    {textContent ? (
                      <p>
                        {textContent.substring(0, Math.min(200, textContent.length))}
                        {textContent.length > 200 ? '...' : ''}
                      </p>
                    ) : (
                      <p>No text content available for narration.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'voices' && (
          <div className="voices-section">
            <h4>Available Voices</h4>
            <div className="voices-grid">
              {availableVoices.map(voice => (
                <div
                  key={voice.id}
                  className={`voice-card ${selectedVoice?.id === voice.id ? 'selected' : ''}`}
                  onClick={() => handleVoiceChange(voice.id)}
                >
                  <div className="voice-info">
                    <h5>{voice.name}</h5>
                    <p>{voice.description}</p>
                    <div className="voice-attributes">
                      <span className="language">{voice.language.toUpperCase()}</span>
                      <span className="gender">{voice.gender}</span>
                    </div>
                  </div>
                  <div className="voice-preview">
                    <button>🔊 Preview</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h4>Audio Settings</h4>

            <div className="setting-group">
              <h5>Playback</h5>
              <div className="setting-item">
                <label>Default Speed:</label>
                <select value={playbackRate} onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x (Normal)</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <h5>Accessibility</h5>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                  />
                  Auto-play on chapter load
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                  />
                  Show text highlighting during narration
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                  />
                  Loop audio playback
                </label>
              </div>
            </div>

            <div className="setting-group">
              <h5>Quality</h5>
              <div className="setting-item">
                <label>Audio Quality:</label>
                <select>
                  <option value="low">Low (16kbps)</option>
                  <option value="medium">Medium (32kbps)</option>
                  <option value="high" selected>High (64kbps)</option>
                  <option value="lossless">Lossless</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="narration-footer">
        <div className="narration-stats">
          <span>Language: {language.toUpperCase()}</span>
          <span>Duration: {formatTime(duration)}</span>
          <span>Speed: {playbackRate}x</span>
        </div>
      </div>
    </div>
  );
};

export default AudioNarration;