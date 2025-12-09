import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';

const ChapterBrowser = () => {
  const { siteConfig } = useDocusaurusContext();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // In a real implementation, this would fetch from the backend API
    // For now, we'll use mock data
    const mockChapters = [
      {
        id: '1',
        title: 'Introduction to ROS 2',
        slug: 'intro-ros2',
        module: 'ros2',
        order: 1,
        difficulty: 'beginner',
        estimated_reading_time: 15,
        learning_objectives: ['Understand ROS 2 basics', 'Learn about nodes and topics'],
        prerequisites: [],
        is_locked: false,
        progress: { status: 'not_started', completion_percentage: 0 }
      },
      {
        id: '2',
        title: 'ROS 2 Nodes, Topics, and Services',
        slug: 'ros2-nodes-topics-services',
        module: 'ros2',
        order: 2,
        difficulty: 'intermediate',
        estimated_reading_time: 25,
        learning_objectives: ['Create ROS 2 nodes', 'Implement topics and services'],
        prerequisites: ['1'],
        is_locked: true,
        progress: { status: 'not_started', completion_percentage: 0 }
      },
      {
        id: '3',
        title: 'Bridging Python Agents to ROS Controllers',
        slug: 'rclpy-bridge',
        module: 'ros2',
        order: 3,
        difficulty: 'advanced',
        estimated_reading_time: 30,
        learning_objectives: ['Connect Python agents to ROS', 'Implement rclpy'],
        prerequisites: ['1', '2'],
        is_locked: true,
        progress: { status: 'not_started', completion_percentage: 0 }
      }
    ];

    setChapters(mockChapters);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading chapters...</div>;
  }

  if (error) {
    return <div>Error loading chapters: {error.message}</div>;
  }

  return (
    <div className="chapter-browser">
      <h2>Textbook Chapters</h2>
      <div className="chapters-list">
        {chapters.map((chapter) => (
          <div key={chapter.id} className={`chapter-card ${chapter.is_locked ? 'locked' : ''}`}>
            <div className="chapter-info">
              <h3>
                <Link to={`/docs/${chapter.slug}`} className={chapter.is_locked ? 'locked-link' : ''}>
                  {chapter.title}
                </Link>
              </h3>
              <div className="chapter-meta">
                <span className="module">{chapter.module}</span>
                <span className="difficulty">{chapter.difficulty}</span>
                <span className="time">{chapter.estimated_reading_time} min</span>
              </div>
              <p className="objectives">Learning objectives: {chapter.learning_objectives.join(', ')}</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${chapter.progress.completion_percentage}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {chapter.progress.completion_percentage}% complete
              </div>
            </div>
            {chapter.is_locked && (
              <div className="lock-indicator">
                🔒 Locked - Complete prerequisites first
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterBrowser;