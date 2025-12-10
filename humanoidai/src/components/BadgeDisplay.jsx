import React, { useState, useEffect } from 'react';

const BadgeDisplay = ({ studentId, showAll = false }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real implementation, this would fetch badge data from the backend
    // For now, we'll simulate with mock data
    const fetchBadges = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock badge data
        const mockBadges = [
          {
            id: 1,
            name: 'First Steps',
            description: 'Complete your first chapter',
            earned: true,
            earnedDate: '2025-01-15',
            icon: '👣',
            rarity: 'common'
          },
          {
            id: 2,
            name: 'Quick Learner',
            description: 'Complete 3 chapters in a week',
            earned: true,
            earnedDate: '2025-01-20',
            icon: '⚡',
            rarity: 'common'
          },
          {
            id: 3,
            name: 'Deep Dive',
            description: 'Complete a challenging chapter',
            earned: true,
            earnedDate: '2025-01-25',
            icon: '🔍',
            rarity: 'rare'
          },
          {
            id: 4,
            name: 'Perfect Score',
            description: 'Get 100% on a quiz',
            earned: false,
            earnedDate: null,
            icon: '💯',
            rarity: 'epic'
          },
          {
            id: 5,
            name: 'Consistency King',
            description: 'Study for 7 consecutive days',
            earned: false,
            earnedDate: null,
            icon: '👑',
            rarity: 'rare'
          },
          {
            id: 6,
            name: 'Problem Solver',
            description: 'Complete 10 coding challenges',
            earned: false,
            earnedDate: null,
            icon: '🧩',
            rarity: 'epic'
          }
        ];

        // Filter badges based on showAll prop
        const filteredBadges = showAll ? mockBadges : mockBadges.filter(badge => badge.earned);
        setBadges(filteredBadges);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (studentId) {
      fetchBadges();
    }
  }, [studentId, showAll]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#94a3b8'; // gray
      case 'rare': return '#60a5fa'; // blue
      case 'epic': return '#c084fc'; // purple
      case 'legendary': return '#f97316'; // orange
      default: return '#94a3b8';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return rarity;
    }
  };

  if (loading) {
    return (
      <div className="badge-display loading">
        <div className="loading-spinner">Loading badges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badge-display error">
        <div className="error-message">Error loading badges: {error}</div>
      </div>
    );
  }

  return (
    <div className="badge-display">
      <div className="badges-header">
        <h3>Your Achievements {showAll && `(${badges.filter(b => b.earned).length} earned)`}</h3>
        {!showAll && (
          <button
            className="show-all-btn"
            onClick={() => {
              // In a real implementation, this would navigate to show all badges
              console.log('Show all badges clicked');
            }}
          >
            Show All ({badges.length})
          </button>
        )}
      </div>

      {badges.length === 0 ? (
        <div className="no-badges">
          <div className="empty-state">No badges earned yet</div>
          <p>Complete chapters and challenges to earn your first badge!</p>
        </div>
      ) : (
        <div className="badges-grid">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
              title={`${badge.name} - ${badge.description}`}
            >
              <div
                className="badge-icon-container"
                style={{ borderColor: badge.earned ? getRarityColor(badge.rarity) : '#64748b' }}
              >
                <div className="badge-icon">
                  {badge.icon}
                </div>
                {badge.earned && (
                  <div
                    className="badge-rarity"
                    style={{ backgroundColor: getRarityColor(badge.rarity) }}
                  >
                    {getRarityLabel(badge.rarity)}
                  </div>
                )}
              </div>

              <div className="badge-content">
                <h4 className={`badge-name ${badge.earned ? '' : 'locked-text'}`}>
                  {badge.name}
                </h4>
                <p className={`badge-description ${badge.earned ? '' : 'locked-text'}`}>
                  {badge.description}
                </p>

                {badge.earned && badge.earnedDate && (
                  <div className="badge-date">
                    Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                  </div>
                )}

                {!badge.earned && (
                  <div className="progress-towards-badge">
                    Progress: 0/1
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAll && (
        <div className="badges-stats">
          <div className="stat-item">
            <span className="stat-label">Total Badges:</span>
            <span className="stat-value">{badges.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Earned:</span>
            <span className="stat-value">{badges.filter(b => b.earned).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completion:</span>
            <span className="stat-value">
              {badges.length > 0 ? Math.round((badges.filter(b => b.earned).length / badges.length) * 100) : 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;