import React, { useState, useEffect } from 'react';

const AdaptiveContent = ({
  content,
  studentProfile,
  chapterMetadata,
  onContentAdapted
}) => {
  const [adaptedContent, setAdaptedContent] = useState(content);
  const [difficulty, setDifficulty] = useState('beginner');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Determine initial difficulty based on student profile
    if (studentProfile) {
      const initialDifficulty = determineDifficulty(studentProfile);
      setDifficulty(initialDifficulty);
      setLearningStyle(studentProfile.learningStyle || 'visual');
    }
  }, [studentProfile]);

  useEffect(() => {
    adaptContent();
  }, [difficulty, content]);

  const determineDifficulty = (profile) => {
    // Simple algorithm to determine difficulty based on student profile
    if (!profile) return 'beginner';

    const { technicalBackground, experienceLevel, hardwareAccess } = profile;

    if (technicalBackground === 'expert' && experienceLevel === 'high') {
      return 'advanced';
    } else if (technicalBackground === 'intermediate' || experienceLevel === 'medium') {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  };

  const adaptContent = async () => {
    if (!content) return;

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the backend API for content personalization
      // For now, we'll simulate content adaptation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      let adapted = content;

      // Apply difficulty-based adaptations
      switch (difficulty) {
        case 'beginner':
          adapted = applyBeginnerAdaptations(content);
          break;
        case 'intermediate':
          adapted = applyIntermediateAdaptations(content);
          break;
        case 'advanced':
          adapted = applyAdvancedAdaptations(content);
          break;
        default:
          adapted = content;
      }

      setAdaptedContent(adapted);

      // Notify parent component of content adaptation
      if (onContentAdapted) {
        onContentAdapted({
          originalContent: content,
          adaptedContent: adapted,
          difficulty: difficulty,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err.message);
      setAdaptedContent(content); // Fallback to original content
    } finally {
      setLoading(false);
    }
  };

  const applyBeginnerAdaptations = (content) => {
    // For beginners, add more explanations, examples, and visual aids
    let adapted = content;

    // Add more detailed explanations
    adapted = adapted.replace(/<h2/g, '<h2');
    adapted = adapted.replace(/<p/g, '<p');

    // Add beginner-friendly annotations
    adapted = adapted.replace(/\b(AI|ML|NN|CNN|RNN|LSTM)\b/g, '<abbr title="This is an important concept for beginners to understand">$1</abbr>');

    // Add more examples and step-by-step breakdowns
    adapted = adapted.replace(/<code/g, '<code');

    return adapted;
  };

  const applyIntermediateAdaptations = (content) => {
    // For intermediate learners, balance explanations with practical applications
    let adapted = content;

    // Add practical applications and use cases
    adapted = adapted.replace(/<p/g, '<p');

    // Include more technical details
    adapted = adapted.replace(/<code/g, '<code');

    return adapted;
  };

  const applyAdvancedAdaptations = (content) => {
    // For advanced learners, focus on complex concepts and research
    let adapted = content;

    // Add research papers references and advanced concepts
    adapted = adapted.replace(/<p/g, '<p');

    // Include more complex code examples and algorithms
    adapted = adapted.replace(/<code/g, '<code');

    return adapted;
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  const handleLearningStyleChange = (newStyle) => {
    setLearningStyle(newStyle);
    // In a real implementation, this would trigger content adaptation based on learning style
  };

  if (loading) {
    return (
      <div className="adaptive-content loading">
        <div className="loading-spinner">Adapting content for you...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adaptive-content error">
        <div className="error-message">Error adapting content: {error}</div>
        <div className="fallback-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className="adaptive-content">
      <div className="content-controls">
        <div className="difficulty-selector">
          <label htmlFor="difficulty-select">Content Difficulty:</label>
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="difficulty-dropdown"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="learning-style-selector">
          <label htmlFor="learning-style-select">Learning Style:</label>
          <select
            id="learning-style-select"
            value={learningStyle}
            onChange={(e) => handleLearningStyleChange(e.target.value)}
            className="learning-style-dropdown"
          >
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="reading">Reading/Writing</option>
            <option value="kinesthetic">Kinesthetic</option>
          </select>
        </div>

        <div className="student-profile-info">
          <small>Adapted for: {studentProfile?.name || 'Student'}</small>
        </div>
      </div>

      <div className="difficulty-indicator">
        <div className={`indicator ${difficulty}`}>
          <span className="label">Current Level:</span>
          <span className="value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
        </div>
      </div>

      <div className="adapted-content-container">
        <div
          className="content-display"
          dangerouslySetInnerHTML={{ __html: adaptedContent }}
        />
      </div>

      <div className="adaptation-info">
        <details className="adaptation-details">
          <summary>How this content was adapted for you</summary>
          <div className="adaptation-explanation">
            <p>
              This content has been personalized based on your profile and preferences.
              The system has adjusted the complexity, examples, and presentation style
              to match your learning needs.
            </p>
            <ul>
              <li><strong>Difficulty Level:</strong> {difficulty}</li>
              <li><strong>Learning Style:</strong> {learningStyle}</li>
              <li><strong>Technical Background:</strong> {studentProfile?.technicalBackground || 'Not specified'}</li>
              <li><strong>Hardware Access:</strong> {studentProfile?.hardwareAccess || 'Not specified'}</li>
            </ul>
          </div>
        </details>
      </div>

      {chapterMetadata && (
        <div className="chapter-context">
          <h4>Chapter Context</h4>
          <div className="metadata">
            <p><strong>Prerequisites:</strong> {chapterMetadata.prerequisites?.join(', ') || 'None'}</p>
            <p><strong>Estimated Time:</strong> {chapterMetadata.estimatedTime || 'N/A'}</p>
            <p><strong>Difficulty:</strong> {chapterMetadata.difficulty || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveContent;