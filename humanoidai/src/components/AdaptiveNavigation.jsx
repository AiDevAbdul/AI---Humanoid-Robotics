import React, { useState, useEffect } from 'react';

const AdaptiveNavigation = ({ currentChapterId, studentId, onNavigate }) => {
  const [learningPath, setLearningPath] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [prerequisiteTree, setPrerequisiteTree] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('path');
  const [currentChapter, setCurrentChapter] = useState(null);

  // Simulate fetching learning path
  useEffect(() => {
    const fetchLearningPath = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock learning path data
        const mockPath = [
          {
            id: 'ch1',
            title: 'Introduction to ROS 2',
            slug: 'introduction-ros2',
            module: 'ros2',
            order: 1,
            status: 'completed',
            prerequisites: []
          },
          {
            id: 'ch2',
            title: 'Nodes and Topics',
            slug: 'nodes-topics',
            module: 'ros2',
            order: 2,
            status: 'completed',
            prerequisites: ['ch1']
          },
          {
            id: 'ch3',
            title: 'Services and Actions',
            slug: 'services-actions',
            module: 'ros2',
            order: 3,
            status: 'in_progress',
            prerequisites: ['ch1', 'ch2']
          },
          {
            id: 'ch4',
            title: 'Launch Files',
            slug: 'launch-files',
            module: 'ros2',
            order: 4,
            status: 'not_started',
            prerequisites: ['ch1', 'ch2', 'ch3']
          },
          {
            id: 'ch5',
            title: 'Navigation Stack',
            slug: 'navigation-stack',
            module: 'navigation',
            order: 1,
            status: 'not_started',
            prerequisites: ['ch1', 'ch2', 'ch3', 'ch4']
          }
        ];

        // Mock available chapters
        const mockAvailable = [
          {
            id: 'ch4',
            title: 'Launch Files',
            slug: 'launch-files',
            module: 'ros2',
            order: 4,
            status: 'not_started',
            prerequisites: ['ch1', 'ch2', 'ch3']
          }
        ];

        setLearningPath(mockPath);
        setAvailableChapters(mockAvailable);

        // Find current chapter
        const current = mockPath.find(ch => ch.id === currentChapterId);
        setCurrentChapter(current);
      } catch (error) {
        console.error('Error fetching learning path:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId && currentChapterId) {
      fetchLearningPath();
    }
  }, [studentId, currentChapterId]);

  const fetchPrerequisiteTree = async (chapterId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock prerequisite tree
      const mockTree = {
        target_chapter: {
          id: chapterId,
          title: 'Launch Files',
          slug: 'launch-files'
        },
        prerequisite_tree: {
          id: 'ch4',
          title: 'Launch Files',
          slug: 'launch-files',
          status: 'not_started',
          completed: false,
          prerequisites: [
            {
              id: 'ch1',
              title: 'Introduction to ROS 2',
              status: 'completed',
              completed: true,
              prerequisites: [],
              all_prereqs_completed: true,
              missing_prerequisites: []
            },
            {
              id: 'ch2',
              title: 'Nodes and Topics',
              status: 'completed',
              completed: true,
              prerequisites: [
                {
                  id: 'ch1',
                  title: 'Introduction to ROS 2',
                  status: 'completed',
                  completed: true,
                  prerequisites: [],
                  all_prereqs_completed: true
                }
              ],
              all_prereqs_completed: true,
              missing_prerequisites: []
            },
            {
              id: 'ch3',
              title: 'Services and Actions',
              status: 'in_progress',
              completed: false,
              prerequisites: [
                {
                  id: 'ch1',
                  title: 'Introduction to ROS 2',
                  status: 'completed',
                  completed: true
                },
                {
                  id: 'ch2',
                  title: 'Nodes and Topics',
                  status: 'completed',
                  completed: true
                }
              ],
              all_prereqs_completed: true,
              missing_prerequisites: []
            }
          ],
          all_prereqs_completed: false,
          missing_prerequisites: [
            { id: 'ch3', title: 'Services and Actions' }
          ]
        },
        can_access: false
      };

      setPrerequisiteTree(mockTree);
      setActiveTab('prerequisites');
    } catch (error) {
      console.error('Error fetching prerequisite tree:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToChapter = (chapterId) => {
    if (onNavigate) {
      onNavigate(chapterId);
    }
  };

  const getChapterStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'orange';
      case 'not_started':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getModuleColor = (module) => {
    const colors = {
      'ros2': '#3D9970',
      'gazebo': '#FF4136',
      'navigation': '#0074D9',
      'manipulation': '#B10DC9',
      'nvidia_isaac': '#FF851B'
    };
    return colors[module] || '#AAAAAA';
  };

  return (
    <div className="adaptive-navigation-container">
      <div className="navigation-header">
        <h3>Adaptive Navigation</h3>
        <div className="navigation-controls">
          <span>Personalized Learning Path</span>
        </div>
      </div>

      <div className="navigation-tabs">
        <button
          className={activeTab === 'path' ? 'active' : ''}
          onClick={() => setActiveTab('path')}
        >
          Learning Path
        </button>
        <button
          className={activeTab === 'available' ? 'active' : ''}
          onClick={() => setActiveTab('available')}
        >
          Available Chapters
        </button>
        <button
          className={activeTab === 'prerequisites' ? 'active' : ''}
          onClick={() => {
            if (currentChapterId) {
              fetchPrerequisiteTree(currentChapterId);
            }
          }}
        >
          Prerequisites
        </button>
      </div>

      <div className="navigation-content">
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading navigation data...</p>
          </div>
        )}

        {!isLoading && activeTab === 'path' && (
          <div className="learning-path-section">
            <h4>Your Learning Path</h4>
            <div className="path-visualization">
              {learningPath.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`path-item ${chapter.status} ${chapter.id === currentChapterId ? 'current' : ''}`}
                  onClick={() => navigateToChapter(chapter.id)}
                >
                  <div className="chapter-info">
                    <div
                      className="module-badge"
                      style={{ backgroundColor: getModuleColor(chapter.module) }}
                    >
                      {chapter.module.toUpperCase()}
                    </div>
                    <div className="chapter-details">
                      <h5>{chapter.title}</h5>
                      <p>Order: {chapter.order}</p>
                    </div>
                  </div>
                  <div className="chapter-status">
                    <span
                      className="status-indicator"
                      style={{ backgroundColor: getChapterStatusColor(chapter.status) }}
                    ></span>
                    <span className="status-text">{chapter.status.replace('_', ' ')}</span>
                  </div>
                  {chapter.id === currentChapterId && <span className="current-indicator">Current</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'available' && (
          <div className="available-section">
            <h4>Available Chapters</h4>
            {availableChapters.length > 0 ? (
              <div className="available-chapters">
                {availableChapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className="available-chapter"
                    onClick={() => navigateToChapter(chapter.id)}
                  >
                    <div className="chapter-header">
                      <span
                        className="module-tag"
                        style={{ backgroundColor: getModuleColor(chapter.module) }}
                      >
                        {chapter.module.toUpperCase()}
                      </span>
                      <span className={`status-badge ${chapter.status}`}>
                        {chapter.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4>{chapter.title}</h4>
                    <p>Prerequisites: {chapter.prerequisites.length} required</p>
                    <button className="btn btn-primary">Start Chapter</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-available">
                <p>No additional chapters are currently available.</p>
                <p>Complete your current chapter to unlock more content.</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'prerequisites' && prerequisiteTree && (
          <div className="prerequisites-section">
            <h4>Prerequisites for: {prerequisiteTree.target_chapter.title}</h4>

            <div className="prerequisite-tree">
              <div className="tree-node root">
                <div className="node-content">
                  <h5>{prerequisiteTree.target_chapter.title}</h5>
                  <span className={`status-badge ${prerequisiteTree.can_access ? 'completed' : 'not-started'}`}>
                    {prerequisiteTree.can_access ? 'Available' : 'Blocked'}
                  </span>
                </div>

                {prerequisiteTree.prerequisite_tree.prerequisites.length > 0 && (
                  <div className="prerequisites-list">
                    <h6>Required Prerequisites:</h6>
                    {prerequisiteTree.prerequisite_tree.prerequisites.map((prereq, index) => (
                      <div key={index} className="prereq-item">
                        <div className="prereq-node">
                          <div className="node-content">
                            <span className="prereq-title">{prereq.title}</span>
                            <span className={`status-badge ${prereq.completed ? 'completed' : 'not-started'}`}>
                              {prereq.completed ? '✓ Completed' : '✗ Not completed'}
                            </span>
                          </div>

                          {prereq.prerequisites && prereq.prerequisites.length > 0 && (
                            <div className="nested-prereqs">
                              {prereq.prerequisites.map((nested, nestedIndex) => (
                                <div key={nestedIndex} className="nested-prereq">
                                  <span className="nested-title">{nested.title}</span>
                                  <span className={`status-badge ${nested.completed ? 'completed' : 'not-started'}`}>
                                    {nested.completed ? '✓' : '✗'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!prerequisiteTree.can_access && (
              <div className="missing-prerequisites">
                <h5>Missing Prerequisites</h5>
                <ul>
                  {prerequisiteTree.prerequisite_tree.missing_prerequisites.map((missing, index) => (
                    <li key={index} className="missing-item">
                      <span>• {missing.title}</span>
                      <button
                        className="btn btn-small"
                        onClick={() => navigateToChapter(missing.id)}
                      >
                        Complete Now
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prerequisiteTree.can_access && (
              <div className="access-granted">
                <h5>You can access this chapter!</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => navigateToChapter(prerequisiteTree.target_chapter.id)}
                >
                  Start Chapter
                </button>
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'prerequisites' && !prerequisiteTree && (
          <div className="prerequisites-info">
            <p>Select a chapter to view its prerequisites and learning requirements.</p>
            <p>The adaptive navigation system ensures you build knowledge progressively.</p>
          </div>
        )}
      </div>

      <div className="navigation-footer">
        <div className="path-summary">
          <span>Completed: {learningPath.filter(ch => ch.status === 'completed').length}</span>
          <span>In Progress: {learningPath.filter(ch => ch.status === 'in_progress').length}</span>
          <span>Available: {availableChapters.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveNavigation;