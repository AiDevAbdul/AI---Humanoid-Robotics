import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ videoUrl, chapterId, studentId, title = 'Tutorial Video', subtitles = null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('player');
  const [quality, setQuality] = useState('720p');
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Simulate video loading
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would load the actual video
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate video duration
        setDuration(300); // 5 minutes
        setCurrentTime(0);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load video');
        setIsLoading(false);
      }
    };

    if (videoUrl) {
      loadVideo();
    } else {
      setError('No video URL provided');
      setIsLoading(false);
    }
  }, [videoUrl]);

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      // In a real implementation, pause the video
    } else {
      setIsPlaying(true);
      // In a real implementation, play the video
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

  const handleQualityChange = (quality) => {
    setQuality(quality);
    // In a real implementation, switch video source
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const availableQualities = [
    { id: '240p', name: '240p' },
    { id: '360p', name: '360p' },
    { id: '480p', name: '480p' },
    { id: '720p', name: '720p (HD)', default: true },
    { id: '1080p', name: '1080p (Full HD)' },
    { id: '1440p', name: '1440p (2K)' },
    { id: '2160p', name: '2160p (4K)' }
  ];

  const videoTutorials = [
    { id: 'ros2_basics', title: 'ROS 2 Basics', duration: '12:34', description: 'Introduction to ROS 2 concepts and architecture' },
    { id: 'gazebo_simulation', title: 'Gazebo Simulation', duration: '18:22', description: 'Setting up and running robot simulations' },
    { id: 'navigation_stack', title: 'Navigation Stack', duration: '22:15', description: 'Understanding ROS navigation components' },
    { id: 'manipulation', title: 'Robotic Manipulation', duration: '15:47', description: 'Arm control and grasping techniques' }
  ];

  return (
    <div className="video-player-container" ref={containerRef}>
      <div className="video-player-header">
        <h3>{title}</h3>
        <div className="video-controls">
          <select
            value={quality}
            onChange={(e) => handleQualityChange(e.target.value)}
          >
            {availableQualities.map(qual => (
              <option key={qual.id} value={qual.id}>
                {qual.name}
              </option>
            ))}
          </select>
          <button onClick={() => setShowSubtitles(!showSubtitles)}>
            {showSubtitles ? '💬 Subtitles ON' : '💬 Subtitles OFF'}
          </button>
        </div>
      </div>

      <div className="video-tabs">
        <button
          className={activeTab === 'player' ? 'active' : ''}
          onClick={() => setActiveTab('player')}
        >
          Player
        </button>
        <button
          className={activeTab === 'playlist' ? 'active' : ''}
          onClick={() => setActiveTab('playlist')}
        >
          Playlist
        </button>
        <button
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      <div className="video-content">
        {activeTab === 'player' && (
          <div className="player-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading video...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="video-container">
                  <div className="video-placeholder">
                    {/* In a real implementation, this would be an actual video element */}
                    <div className="video-screen">
                      <div className="video-content">
                        <div className="play-icon" onClick={togglePlayPause}>
                          {isPlaying ? '⏸️' : '▶️'}
                        </div>
                        <div className="video-info-overlay">
                          <h4>{title}</h4>
                          <p>Video content would display here</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showSubtitles && subtitles && (
                    <div className="subtitles-overlay">
                      <div className="subtitle-text">
                        {/* Subtitle text would appear here based on current time */}
                        Sample subtitle text appears here when video is playing
                      </div>
                    </div>
                  )}
                </div>

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
                  <div className="primary-controls">
                    <button
                      onClick={togglePlayPause}
                      className="control-btn play-pause"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="control-btn fullscreen"
                    >
                      {isFullscreen ? '⛶' : '⛶'}
                    </button>
                  </div>

                  <div className="volume-control">
                    <span>🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </div>

                  <div className="playback-controls">
                    <button onClick={() => handlePlaybackRateChange(0.5)}>0.5x</button>
                    <button onClick={() => handlePlaybackRateChange(1)} className={playbackRate === 1 ? 'active' : ''}>1x</button>
                    <button onClick={() => handlePlaybackRateChange(1.25)}>1.25x</button>
                    <button onClick={() => handlePlaybackRateChange(1.5)}>1.5x</button>
                    <button onClick={() => handlePlaybackRateChange(2)}>2x</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'playlist' && (
          <div className="playlist-section">
            <h4>Video Tutorials</h4>
            <div className="playlist-grid">
              {videoTutorials.map((tutorial, index) => (
                <div
                  key={tutorial.id}
                  className={`tutorial-item ${index === 0 ? 'current' : ''}`}
                  onClick={() => console.log(`Loading tutorial: ${tutorial.id}`)}
                >
                  <div className="tutorial-thumbnail">
                    <div className="thumbnail-placeholder">📹</div>
                    <div className="duration-badge">{tutorial.duration}</div>
                  </div>
                  <div className="tutorial-info">
                    <h5>{tutorial.title}</h5>
                    <p>{tutorial.description}</p>
                    <div className="tutorial-stats">
                      <span>Beginner</span>
                      <span>•</span>
                      <span>{tutorial.duration}</span>
                    </div>
                  </div>
                  {index === 0 && <div className="current-indicator">Now Playing</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-section">
            <h4>Video Notes</h4>
            <div className="notes-editor">
              <textarea
                placeholder="Take notes while watching the video..."
                rows="8"
                className="notes-textarea"
              ></textarea>
              <div className="notes-actions">
                <button className="btn btn-primary">Save Notes</button>
                <button className="btn btn-secondary">Clear</button>
              </div>
            </div>

            <div className="key-concepts">
              <h5>Key Concepts Covered</h5>
              <div className="concepts-list">
                <div className="concept-tag">ROS 2 Architecture</div>
                <div className="concept-tag">Nodes and Topics</div>
                <div className="concept-tag">Services and Actions</div>
                <div className="concept-tag">Parameter Server</div>
                <div className="concept-tag">Launch Files</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="video-footer">
        <div className="video-stats">
          <span>Quality: {quality}</span>
          <span>Speed: {playbackRate}x</span>
          <span>Subtitles: {showSubtitles ? 'ON' : 'OFF'}</span>
          <span>Format: MP4</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;