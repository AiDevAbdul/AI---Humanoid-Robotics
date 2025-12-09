import React, { useState, useEffect } from 'react';

const SpacedRepetition = ({ studentId, chapterId, onReviewComplete }) => {
  const [reviewSchedule, setReviewSchedule] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [reviewQuality, setReviewQuality] = useState(3); // Default to "good" rating
  const [showReviewInterface, setShowReviewInterface] = useState(false);

  // Simulate fetching review schedule
  useEffect(() => {
    const fetchReviewSchedule = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock review schedule data
        const mockSchedule = [
          {
            chapter_id: 'ch1',
            chapter_title: 'Introduction to ROS 2',
            chapter_slug: 'introduction-ros2',
            last_reviewed: '2025-11-28T10:00:00Z',
            next_review: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            current_interval: 1,
            ease_factor: 2.5,
            review_urgency: 'urgent'
          },
          {
            chapter_id: 'ch3',
            chapter_title: 'Services and Actions',
            chapter_slug: 'services-actions',
            last_reviewed: '2025-11-25T14:30:00Z',
            next_review: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            current_interval: 3,
            ease_factor: 2.3,
            review_urgency: 'urgent'
          },
          {
            chapter_id: 'ch5',
            chapter_title: 'Navigation Stack',
            chapter_slug: 'navigation-stack',
            last_reviewed: '2025-11-20T09:15:00Z',
            next_review: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            current_interval: 7,
            ease_factor: 2.1,
            review_urgency: 'high'
          },
          {
            chapter_id: 'ch7',
            chapter_title: 'Manipulation Concepts',
            chapter_slug: 'manipulation-concepts',
            last_reviewed: '2025-11-15T16:45:00Z',
            next_review: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
            current_interval: 14,
            ease_factor: 2.4,
            review_urgency: 'medium'
          }
        ];

        setReviewSchedule(mockSchedule);
      } catch (error) {
        console.error('Error fetching review schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchReviewSchedule();
    }
  }, [studentId]);

  const startReview = (reviewItem) => {
    setCurrentReview(reviewItem);
    setShowReviewInterface(true);
    setActiveTab('review');
  };

  const completeReview = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to update review status
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real implementation, this would call an API to update the review status
      if (onReviewComplete) {
        await onReviewComplete(currentReview.chapter_id, reviewQuality);
      }

      // Update the schedule to reflect the completed review
      setReviewSchedule(prev => prev.filter(item => item.chapter_id !== currentReview.chapter_id));

      // Reset review state
      setCurrentReview(null);
      setShowReviewInterface(false);
      setReviewQuality(3);
      setActiveTab('schedule');
    } catch (error) {
      console.error('Error completing review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return '#dc3545'; // Red
      case 'high':
        return '#fd7e14'; // Orange
      case 'medium':
        return '#ffc107'; // Yellow
      case 'low':
        return '#28a745'; // Green
      case 'planning':
        return '#6c757d'; // Gray
      default:
        return '#6c757d';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'Due Now';
      case 'high':
        return 'Due Soon';
      case 'medium':
        return 'Scheduled';
      case 'low':
        return 'Future';
      case 'planning':
        return 'Planned';
      default:
        return urgency;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeUntil = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} from now`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else {
      return 'Today';
    }
  };

  return (
    <div className="spaced-repetition-container">
      <div className="spaced-repetition-header">
        <h3>Spaced Repetition System</h3>
        <div className="spaced-repetition-controls">
          <span>Review your learning at optimal intervals</span>
        </div>
      </div>

      <div className="spaced-repetition-tabs">
        <button
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          Review Schedule
        </button>
        <button
          className={activeTab === 'review' ? 'active' : ''}
          onClick={() => setActiveTab('review')}
        >
          Active Review
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="spaced-repetition-content">
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading review schedule...</p>
          </div>
        )}

        {!isLoading && activeTab === 'schedule' && (
          <div className="schedule-section">
            <h4>Your Review Schedule</h4>
            <p>Review content at optimal intervals to maximize retention</p>

            {reviewSchedule.length > 0 ? (
              <div className="reviews-list">
                {reviewSchedule.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="review-info">
                        <h5>{review.chapter_title}</h5>
                        <p>{review.chapter_slug.replace(/-/g, ' ')}</p>
                      </div>
                      <div className="review-urgency">
                        <span
                          className="urgency-badge"
                          style={{ backgroundColor: getUrgencyColor(review.review_urgency) }}
                        >
                          {getUrgencyLabel(review.review_urgency)}
                        </span>
                      </div>
                    </div>

                    <div className="review-details">
                      <div className="detail-row">
                        <span>Last reviewed:</span>
                        <span>{formatDate(review.last_reviewed)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Next review:</span>
                        <span>{formatDate(review.next_review)} ({formatTimeUntil(review.next_review)})</span>
                      </div>
                      <div className="detail-row">
                        <span>Interval:</span>
                        <span>{review.current_interval} day{review.current_interval !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="detail-row">
                        <span>Difficulty:</span>
                        <span>{review.ease_factor.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="review-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => startReview(review)}
                      >
                        Review Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <h4>No reviews scheduled</h4>
                <p>Complete chapters to start building your spaced repetition schedule.</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'review' && (showReviewInterface && currentReview) && (
          <div className="review-section">
            <div className="review-header">
              <h4>Review: {currentReview.chapter_title}</h4>
              <div className="review-progress">
                <span>Interval: {currentReview.current_interval} days</span>
                <span>Difficulty: {currentReview.ease_factor.toFixed(1)}</span>
              </div>
            </div>

            <div className="review-content">
              <div className="review-material">
                <h5>Key Concepts to Review</h5>
                <div className="review-concepts">
                  <div className="concept-card">
                    <h6>Concept 1</h6>
                    <p>Main idea from the chapter that needs reinforcement</p>
                  </div>
                  <div className="concept-card">
                    <h6>Concept 2</h6>
                    <p>Another important concept to remember</p>
                  </div>
                  <div className="concept-card">
                    <h6>Concept 3</h6>
                    <p>Application of the concept in practice</p>
                  </div>
                </div>
              </div>

              <div className="review-questions">
                <h5>Self-Assessment Questions</h5>
                <div className="question-list">
                  <div className="question-item">
                    <p>Can you explain the main concept in your own words?</p>
                  </div>
                  <div className="question-item">
                    <p>How would you apply this concept to a real-world scenario?</p>
                  </div>
                  <div className="question-item">
                    <p>What are the key takeaways from this chapter?</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-quality-rating">
              <h5>How well did you remember the material?</h5>
              <div className="quality-scale">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`quality-btn ${reviewQuality === rating ? 'selected' : ''}`}
                    onClick={() => setReviewQuality(rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="quality-labels">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="review-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowReviewInterface(false);
                  setActiveTab('schedule');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={completeReview}
              >
                Complete Review
              </button>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'review' && !showReviewInterface && (
          <div className="review-instructions">
            <h4>Active Review</h4>
            <p>Select a chapter from your schedule to begin a review session.</p>
            <p>The spaced repetition algorithm will help you review material at optimal intervals for maximum retention.</p>
          </div>
        )}

        {!isLoading && activeTab === 'analytics' && (
          <div className="analytics-section">
            <h4>Spaced Repetition Analytics</h4>

            <div className="analytics-grid">
              <div className="metric-card">
                <h5>Total Reviews</h5>
                <p>{reviewSchedule.length}</p>
              </div>
              <div className="metric-card">
                <h5>Due for Review</h5>
                <p>{reviewSchedule.filter(r => r.review_urgency === 'urgent').length}</p>
              </div>
              <div className="metric-card">
                <h5>Completed This Week</h5>
                <p>12</p>
              </div>
              <div className="metric-card">
                <h5>Average Interval</h5>
                <p>{reviewSchedule.length ? (reviewSchedule.reduce((sum, r) => sum + r.current_interval, 0) / reviewSchedule.length).toFixed(1) : 0} days</p>
              </div>
            </div>

            <div className="retention-chart">
              <h5>Estimated Retention Over Time</h5>
              <div className="chart-placeholder">
                <p>Retention curve visualization would appear here</p>
                <p>The Ebbinghaus forgetting curve shows how spaced repetition significantly improves long-term retention.</p>
              </div>
            </div>

            <div className="review-tips">
              <h5>Spaced Repetition Tips</h5>
              <ul>
                <li>Review material just as you're about to forget it</li>
                <li>Rate your recall accuracy honestly to optimize scheduling</li>
                <li>Consistent daily reviews are more effective than cramming</li>
                <li>Focus on concepts you find most challenging</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="spaced-repetition-footer">
        <div className="spaced-repetition-summary">
          <span>Based on the SM-2 algorithm for optimal retention</span>
          <span>Science-backed spaced learning methodology</span>
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetition;