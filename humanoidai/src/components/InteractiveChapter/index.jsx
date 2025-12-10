import React, { useState, useEffect } from 'react';

// Import the existing chatbot component from the frontend directory
const Chatbot = React.lazy(() => import('../../../../frontend/src/components/Chatbot'));
// Import the existing progress tracker component from the frontend directory
const ProgressTracker = React.lazy(() => import('../../../../frontend/src/components/ProgressTracker'));

const InteractiveChapter = ({ chapterSlug, title }) => {
  // Handle API context dynamically to avoid SSR issues
  const [apiService, setApiService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contextInitialized, setContextInitialized] = useState(false);
  const [chapterContent, setChapterContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('content');

  // Initialize API context after component mounts (client-side only)
  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Try to import the actual API service
        const apiServiceModule = await import('../../services/api');

        // Set the actual API service
        setApiService(apiServiceModule.default);

        // Check if user is authenticated by checking localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } catch (e) {
            console.error('Error parsing saved user:', e);
          }
        }
      } catch (error) {
        console.warn('API service not available (SSR/SSG environment)', error);
        // Create a mock API service for static generation
        setApiService({
          getChapter: async (slug) => {
            return {
              id: slug,
              title: title || 'Chapter',
              content: {
                text: `This is the content for ${title || chapterSlug}. The full interactive experience requires backend connectivity.`,
                html: `<p>This is the content for ${title || chapterSlug}. The full interactive experience requires backend connectivity.</p>`
              },
              interactive_elements: [],
              metadata: {
                estimated_reading_time: 5,
                difficulty: 'beginner',
                learning_objectives: ['Learn key concepts', 'Apply knowledge', 'Practice skills']
              }
            };
          }
        });
      } finally {
        setContextInitialized(true);
      }
    };

    initializeApi();
  }, [chapterSlug, title]);

  // Fetch chapter content once API service is initialized
  useEffect(() => {
    if (contextInitialized && apiService && chapterSlug) {
      const fetchChapter = async () => {
        try {
          setIsLoading(true);

          // Try to fetch from backend API first, fallback to static content
          try {
            const response = await apiService.getChapter(chapterSlug);
            setChapterContent(response);
          } catch (apiError) {
            // If API fails, we'll show a message but the component can still function
            console.warn('Could not fetch chapter from backend:', apiError.message);

            // Use mock content
            setChapterContent({
              id: chapterSlug,
              title: title || 'Chapter',
              content: {
                text: `This is the content for ${title || chapterSlug}. The full interactive experience requires backend connectivity.`,
                html: `<p>This is the content for ${title || chapterSlug}. The full interactive experience requires backend connectivity.</p>`
              },
              interactive_elements: [],
              metadata: {
                estimated_reading_time: 5,
                difficulty: 'beginner',
                learning_objectives: ['Learn key concepts', 'Apply knowledge', 'Practice skills']
              }
            });
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchChapter();
    }
  }, [contextInitialized, apiService, chapterSlug, title]);

  if (!contextInitialized) {
    return (
      <div className="interactive-chapter">
        <div className="loading-spinner">
          <div className="spinner">Initializing...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="interactive-chapter">
        <div className="loading-spinner">
          <div className="spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interactive-chapter">
        <div className="error-message">
          <h3>Error loading chapter</h3>
          <p>{error}</p>
          <p>Make sure your backend server is running at http://127.0.0.1:8000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-chapter">
      <div className="chapter-header">
        <h1>{chapterContent.title}</h1>
        {chapterContent.metadata && (
          <div className="chapter-meta">
            <span className="reading-time">⏱️ {chapterContent.metadata.estimated_reading_time} min read</span>
            <span className="difficulty">📊 {chapterContent.metadata.difficulty}</span>
          </div>
        )}
      </div>

      <div className="chapter-navigation">
        <button
          className={activeSection === 'content' ? 'active' : ''}
          onClick={() => setActiveSection('content')}
        >
          Content
        </button>
        <button
          className={activeSection === 'chatbot' ? 'active' : ''}
          onClick={() => setActiveSection('chatbot')}
        >
          AI Assistant
        </button>
        <button
          className={activeSection === 'progress' ? 'active' : ''}
          onClick={() => setActiveSection('progress')}
        >
          Progress
        </button>
      </div>

      <div className="chapter-content">
        {activeSection === 'content' && (
          <div className="content-section">
            <div
              className="chapter-text"
              dangerouslySetInnerHTML={{
                __html: chapterContent.content?.html || chapterContent.content?.text || 'No content available'
              }}
            />

            {chapterContent.interactive_elements && chapterContent.interactive_elements.length > 0 && (
              <div className="interactive-elements">
                <h3>Interactive Elements</h3>
                {chapterContent.interactive_elements.map((element, index) => (
                  <div key={index} className="interactive-element">
                    {/* Render different types of interactive elements based on type */}
                    <div className="element-placeholder">
                      <p>[Interactive Element: {element.type || 'Unknown'}]</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'chatbot' && (
          <div className="chatbot-section">
            <h3>AI Study Assistant</h3>
            <p>Ask questions about this chapter content</p>
            <React.Suspense fallback={<div>Loading AI assistant...</div>}>
              <Chatbot
                courseId={chapterContent.id}
                chapterId={chapterContent.id}
              />
            </React.Suspense>
          </div>
        )}

        {activeSection === 'progress' && (
          <div className="progress-section">
            <h3>Learning Progress</h3>
            <p>Track your understanding of this chapter</p>
            {isAuthenticated && currentUser ? (
              <React.Suspense fallback={<div>Loading progress tracker...</div>}>
                <ProgressTracker
                  studentId={currentUser.id}
                  chapterId={chapterContent.id}
                />
              </React.Suspense>
            ) : (
              <div className="auth-prompt">
                <p>Please log in to track your progress and access personalized features.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {chapterContent.metadata?.learning_objectives && (
        <div className="learning-objectives">
          <h4>Learning Objectives</h4>
          <ul>
            {chapterContent.metadata.learning_objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InteractiveChapter;