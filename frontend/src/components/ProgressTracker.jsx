import React, { useState, useEffect } from 'react';

const ProgressTracker = ({ studentId, courseId }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real implementation, this would fetch progress data from the backend
    // For now, we'll simulate with mock data
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock progress data
        const mockProgress = {
          studentId,
          courseId,
          overallProgress: 45,
          completedChapters: 3,
          totalChapters: 7,
          points: 1250,
          currentStreak: 2,
          badges: [
            { id: 1, name: 'First Steps', description: 'Complete your first chapter', earned: true },
            { id: 2, name: 'Quick Learner', description: 'Complete 3 chapters in a week', earned: true },
            { id: 3, name: 'Deep Dive', description: 'Complete a challenging chapter', earned: false },
            { id: 4, name: 'Perfect Score', description: 'Get 100% on a quiz', earned: false }
          ],
          chapterProgress: [
            { id: 1, title: 'Introduction to Physical AI', progress: 100, completed: true },
            { id: 2, title: 'Robotics Fundamentals', progress: 100, completed: true },
            { id: 3, title: 'Kinematics and Dynamics', progress: 100, completed: true },
            { id: 4, title: 'Control Systems', progress: 60, completed: false },
            { id: 5, title: 'Machine Learning for Robotics', progress: 20, completed: false },
            { id: 6, title: 'Computer Vision', progress: 0, completed: false },
            { id: 7, title: 'Humanoid Robotics', progress: 0, completed: false }
          ]
        };

        setProgressData(mockProgress);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (studentId && courseId) {
      fetchProgressData();
    }
  }, [studentId, courseId]);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#4ade80'; // green
    if (percentage >= 50) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  if (loading) {
    return (
      <div className="progress-tracker loading">
        <div className="loading-spinner">Loading progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-tracker error">
        <div className="error-message">Error loading progress: {error}</div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="progress-tracker empty">
        <div className="empty-message">No progress data available</div>
      </div>
    );
  }

  return (
    <div className="progress-tracker">
      <div className="progress-summary">
        <h3>Learning Progress</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-value">{progressData.overallProgress}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progressData.completedChapters}/{progressData.totalChapters}</div>
            <div className="stat-label">Chapters Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progressData.points}</div>
            <div className="stat-label">Points Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progressData.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      <div className="chapter-progress">
        <h4>Chapter Progress</h4>
        <div className="chapters-list">
          {progressData.chapterProgress.map((chapter) => (
            <div key={chapter.id} className={`chapter-item ${chapter.completed ? 'completed' : 'in-progress'}`}>
              <div className="chapter-info">
                <div className="chapter-title">{chapter.title}</div>
                <div className="chapter-status">
                  {chapter.completed ? 'Completed' : chapter.progress > 0 ? 'In Progress' : 'Not Started'}
                </div>
              </div>
              <div className="chapter-progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${chapter.progress}%`,
                    backgroundColor: getProgressColor(chapter.progress)
                  }}
                ></div>
                <div className="progress-text">{chapter.progress}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="badges-section">
        <h4>Achievements</h4>
        <div className="badges-grid">
          {progressData.badges.map((badge) => (
            <div key={badge.id} className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}>
              <div className="badge-icon">
                {badge.earned ? '🏆' : '🔒'}
              </div>
              <div className="badge-info">
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;