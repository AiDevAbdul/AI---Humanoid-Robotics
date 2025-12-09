import React, { useState, useEffect } from 'react';
import ProgressTracker from './ProgressTracker';
import BadgeDisplay from './BadgeDisplay';

const Gamification = ({ studentId, courseId }) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [nextLevelExp, setNextLevelExp] = useState(100);
  const [streak, setStreak] = useState(0);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch gamification data from the backend
    // For now, we'll simulate with mock data
    const fetchGamificationData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock gamification data
        const mockData = {
          points: 1250,
          level: 5,
          experience: 250,
          nextLevelExp: 500,
          streak: 3,
          recentAchievements: [
            { id: 1, name: 'First Steps', icon: '👣', earnedAt: '2025-01-15T10:30:00Z' },
            { id: 2, name: 'Quick Learner', icon: '⚡', earnedAt: '2025-01-20T14:15:00Z' },
            { id: 3, name: 'Deep Dive', icon: '🔍', earnedAt: '2025-01-25T09:45:00Z' }
          ]
        };

        setPoints(mockData.points);
        setLevel(mockData.level);
        setExperience(mockData.experience);
        setNextLevelExp(mockData.nextLevelExp);
        setStreak(mockData.streak);
        setRecentAchievements(mockData.recentAchievements);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gamification data:', err);
        setLoading(false);
      }
    };

    if (studentId) {
      fetchGamificationData();
    }
  }, [studentId]);

  // Calculate level progress percentage
  const levelProgress = (experience / nextLevelExp) * 100;

  // Function to handle earning points (would be called from other components)
  const earnPoints = (amount, reason = '') => {
    setPoints(prev => prev + amount);

    // Calculate if level up occurred
    const newTotalExp = experience + amount;
    const levelsGained = Math.floor(newTotalExp / 100) - Math.floor(experience / 100);

    if (levelsGained > 0) {
      setLevel(prev => prev + levelsGained);
      setExperience(newTotalExp % 100);
    } else {
      setExperience(newTotalExp);
    }
  };

  // Function to update streak
  const updateStreak = (newStreak) => {
    setStreak(newStreak);
  };

  if (loading) {
    return (
      <div className="gamification loading">
        <div className="loading-spinner">Loading gamification data...</div>
      </div>
    );
  }

  return (
    <div className="gamification">
      <div className="player-stats">
        <h2>Player Stats</h2>
        <div className="stats-grid">
          <div className="stat-card points">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{points.toLocaleString()}</div>
              <div className="stat-label">Points</div>
            </div>
          </div>

          <div className="stat-card level">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-value">Level {level}</div>
              <div className="stat-label">Current Level</div>
            </div>
          </div>

          <div className="stat-card streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <div className="stat-value">{streak} days</div>
              <div className="stat-label">Study Streak</div>
            </div>
          </div>
        </div>

        <div className="level-progress">
          <div className="level-info">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {experience} / {nextLevelExp} XP ({Math.round(levelProgress)}%)
          </div>
        </div>
      </div>

      <div className="recent-achievements">
        <h3>Recent Achievements</h3>
        {recentAchievements.length > 0 ? (
          <div className="achievements-list">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-date">
                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-achievements">
            No recent achievements. Keep learning to earn your first badge!
          </div>
        )}
      </div>

      <div className="gamification-features">
        <div className="progress-section">
          <h3>Progress Overview</h3>
          <ProgressTracker studentId={studentId} courseId={courseId} />
        </div>

        <div className="badges-section">
          <h3>Badges</h3>
          <BadgeDisplay studentId={studentId} showAll={false} />
        </div>
      </div>

      <div className="motivational-content">
        <h3>Keep Going!</h3>
        <p>
          You're doing great! Continue your learning journey to earn more points,
          level up, and unlock new achievements. Consistency is key to mastering
          Physical AI and Humanoid Robotics.
        </p>

        <div className="daily-challenge">
          <h4>Today's Challenge</h4>
          <p>Complete one chapter to earn 100 points and maintain your streak!</p>
        </div>
      </div>
    </div>
  );
};

export default Gamification;