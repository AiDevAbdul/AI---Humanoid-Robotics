import React, { useState, useEffect } from 'react';

const MicrolearningTracker = ({ studentId, chapterId, onMicrolearningComplete }) => {
  const [microlearningUnits, setMicrolearningUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [engagementScore, setEngagementScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Simulate fetching microlearning units
  useEffect(() => {
    const fetchMicrolearningUnits = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock microlearning units data
        const mockUnits = [
          {
            id: 'ch3_ml_1',
            chapter_id: 'ch3',
            title: 'Services and Actions - Part 1',
            content: 'In ROS 2, services provide a request/reply communication pattern...',
            order: 1,
            completed: true,
            completed_at: '2025-11-30T10:30:00Z',
            estimated_duration: 4.5,
            word_count: 420,
            character_count: 2100,
            engagement_score: 4,
            segment_type: 'semantic',
            context: {
              chapter_title: 'Services and Actions',
              module: 'ros2',
              order: 1
            }
          },
          {
            id: 'ch3_ml_2',
            chapter_id: 'ch3',
            title: 'Services and Actions - Part 2',
            content: 'Services are defined using .srv files that specify request and response...',
            order: 2,
            completed: true,
            completed_at: '2025-11-30T10:45:00Z',
            estimated_duration: 5.2,
            word_count: 480,
            character_count: 2400,
            engagement_score: 5,
            segment_type: 'semantic',
            context: {
              chapter_title: 'Services and Actions',
              module: 'ros2',
              order: 2
            }
          },
          {
            id: 'ch3_ml_3',
            chapter_id: 'ch3',
            title: 'Services and Actions - Part 3',
            content: 'To create a service server, you define a callback function...',
            order: 3,
            completed: false,
            completed_at: null,
            estimated_duration: 4.8,
            word_count: 450,
            character_count: 2250,
            engagement_score: 0,
            segment_type: 'semantic',
            context: {
              chapter_title: 'Services and Actions',
              module: 'ros2',
              order: 3
            }
          },
          {
            id: 'ch3_ml_4',
            chapter_id: 'ch3',
            title: 'Services and Actions - Part 4',
            content: 'Service clients are created similarly to publishers and subscribers...',
            order: 4,
            completed: false,
            completed_at: null,
            estimated_duration: 5.0,
            word_count: 470,
            character_count: 2350,
            engagement_score: 0,
            segment_type: 'semantic',
            context: {
              chapter_title: 'Services and Actions',
              module: 'ros2',
              order: 4
            }
          }
        ];

        setMicrolearningUnits(mockUnits);

        // Find the first incomplete unit as the current unit
        const firstIncomplete = mockUnits.find(unit => !unit.completed);
        if (firstIncomplete) {
          setCurrentUnit(firstIncomplete);
        } else {
          // If all are completed, set the last one as current
          setCurrentUnit(mockUnits[mockUnits.length - 1]);
        }
      } catch (error) {
        console.error('Error fetching microlearning units:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId && chapterId) {
      fetchMicrolearningUnits();
    }
  }, [studentId, chapterId]);

  const startUnit = async (unitId) => {
    setIsLoading(true);
    try {
      // Simulate API call to mark unit as started
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatedUnits = microlearningUnits.map(unit =>
        unit.id === unitId ? { ...unit, started: true } : unit
      );
      setMicrolearningUnits(updatedUnits);

      const unit = microlearningUnits.find(u => u.id === unitId);
      setCurrentUnit(unit);
      setActiveTab('learning');
    } catch (error) {
      console.error('Error starting unit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeUnit = async (unitId) => {
    setIsLoading(true);
    try {
      // Simulate API call to mark unit as completed
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUnits = microlearningUnits.map(unit =>
        unit.id === unitId
          ? {
              ...unit,
              completed: true,
              completed_at: new Date().toISOString(),
              engagement_score: engagementScore || 4
            }
          : unit
      );
      setMicrolearningUnits(updatedUnits);

      if (onMicrolearningComplete) {
        await onMicrolearningComplete(unitId, engagementScore);
      }

      // Find the next incomplete unit
      const nextUnit = updatedUnits.find(unit => !unit.completed && unit.order > updatedUnits.find(u => u.id === unitId).order);
      if (nextUnit) {
        setCurrentUnit(nextUnit);
      } else {
        // If no more units, go back to overview
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error completing unit:', error);
    } finally {
      setIsLoading(false);
      setEngagementScore(0);
    }
  };

  const getCompletionPercentage = () => {
    const completed = microlearningUnits.filter(unit => unit.completed).length;
    return microlearningUnits.length > 0 ? Math.round((completed / microlearningUnits.length) * 100) : 0;
  };

  const getNextUnit = () => {
    return microlearningUnits.find(unit => !unit.completed && unit.order > (currentUnit?.order || 0));
  };

  const getPrevUnit = () => {
    return microlearningUnits.find(unit => unit.order < (currentUnit?.order || Infinity)).sort((a, b) => b.order - a.order)[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="microlearning-tracker-container">
      <div className="microlearning-header">
        <h3>Microlearning Tracker</h3>
        <div className="microlearning-controls">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <span className="progress-text">{getCompletionPercentage()}% Complete</span>
        </div>
      </div>

      <div className="microlearning-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'learning' ? 'active' : ''}
          onClick={() => currentUnit && setActiveTab('learning')}
          disabled={!currentUnit}
        >
          Learning
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="microlearning-content">
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading microlearning content...</p>
          </div>
        )}

        {!isLoading && activeTab === 'overview' && (
          <div className="overview-section">
            <h4>Microlearning Units</h4>
            <p>Breakdown of chapter content into digestible learning segments</p>

            <div className="units-grid">
              {microlearningUnits.map((unit, index) => (
                <div
                  key={unit.id}
                  className={`unit-card ${unit.completed ? 'completed' : unit.started ? 'in-progress' : 'not-started'}`}
                  onClick={() => startUnit(unit.id)}
                >
                  <div className="unit-header">
                    <div className="unit-order">Part {unit.order}</div>
                    <div className={`unit-status ${unit.completed ? 'completed' : unit.started ? 'in-progress' : 'not-started'}`}>
                      {unit.completed ? '✓' : unit.started ? '→' : '○'}
                    </div>
                  </div>

                  <h5>{unit.title}</h5>

                  <div className="unit-meta">
                    <div className="meta-item">
                      <span>⏱️ {unit.estimated_duration} min</span>
                    </div>
                    <div className="meta-item">
                      <span>📊 {unit.word_count} words</span>
                    </div>
                  </div>

                  <div className="unit-preview">
                    <p>{unit.content.substring(0, 80)}...</p>
                  </div>

                  {unit.completed && (
                    <div className="unit-completion">
                      <span>Completed: {formatDate(unit.completed_at)}</span>
                      <span>Score: {unit.engagement_score}/5</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'learning' && currentUnit && (
          <div className="learning-section">
            <div className="learning-header">
              <h4>{currentUnit.title}</h4>
              <div className="learning-meta">
                <span>Part {currentUnit.order} of {microlearningUnits.length}</span>
                <span>⏱️ ~{currentUnit.estimated_duration} min</span>
              </div>
            </div>

            <div className="learning-content">
              <div className="content-text">
                {currentUnit.content}
              </div>

              <div className="learning-interactions">
                <div className="interactive-elements">
                  <div className="highlight-tool">
                    <button>📝 Add Note</button>
                    <button>💡 Key Concept</button>
                    <button>❓ Ask Question</button>
                  </div>

                  <div className="comprehension-check">
                    <h5>Quick Check</h5>
                    <p>Can you explain the main concept in your own words?</p>
                    <textarea placeholder="Your understanding..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="learning-navigation">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const prevUnit = getPrevUnit();
                  if (prevUnit) setCurrentUnit(prevUnit);
                }}
                disabled={!getPrevUnit()}
              >
                ← Previous
              </button>

              <div className="engagement-rating">
                <h5>How engaging was this content?</h5>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className={`rating-btn ${engagementScore === rating ? 'selected' : ''}`}
                      onClick={() => setEngagementScore(rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => completeUnit(currentUnit.id)}
              >
                Mark Complete →
              </button>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'analytics' && (
          <div className="analytics-section">
            <h4>Microlearning Analytics</h4>

            <div className="analytics-grid">
              <div className="metric-card">
                <h5>Total Units</h5>
                <p>{microlearningUnits.length}</p>
              </div>
              <div className="metric-card">
                <h5>Completed</h5>
                <p>{microlearningUnits.filter(u => u.completed).length}</p>
              </div>
              <div className="metric-card">
                <h5>Completion Rate</h5>
                <p>{getCompletionPercentage()}%</p>
              </div>
              <div className="metric-card">
                <h5>Avg. Engagement</h5>
                <p>{microlearningUnits.length > 0
                  ? (microlearningUnits.reduce((sum, u) => sum + u.engagement_score, 0) /
                     microlearningUnits.filter(u => u.engagement_score > 0).length || 1).toFixed(1)
                  : 0}/5</p>
              </div>
            </div>

            <div className="progress-chart">
              <h5>Learning Progress Over Time</h5>
              <div className="chart-placeholder">
                <p>Progress visualization would appear here</p>
                <p>Tracking your microlearning engagement and completion patterns</p>
              </div>
            </div>

            <div className="engagement-analysis">
              <h5>Engagement Analysis</h5>
              <div className="engagement-breakdown">
                {microlearningUnits.filter(u => u.completed).map((unit, index) => (
                  <div key={unit.id} className="engagement-item">
                    <span>Part {unit.order}:</span>
                    <span>Score: {unit.engagement_score}/5</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recommendations">
              <h5>Learning Recommendations</h5>
              <ul>
                <li>Continue with consistent daily microlearning sessions</li>
                <li>Review units with lower engagement scores</li>
                <li>Apply concepts learned to practical exercises</li>
                <li>Connect microlearning units to broader concepts</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="microlearning-footer">
        <div className="microlearning-summary">
          <span>{microlearningUnits.filter(u => u.completed).length} of {microlearningUnits.length} units completed</span>
          <span>Total estimated time: {microlearningUnits.reduce((sum, u) => sum + u.estimated_duration, 0).toFixed(1)} minutes</span>
        </div>
      </div>
    </div>
  );
};

export default MicrolearningTracker;