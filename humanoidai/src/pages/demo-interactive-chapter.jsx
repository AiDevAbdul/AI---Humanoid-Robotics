import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import InteractiveChapter from '../components/InteractiveChapter';

const DemoInteractiveChapterPage = () => {
  const [apiContext, setApiContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically import and use the API context
  useEffect(() => {
    const loadApiContext = async () => {
      try {
        const apiModule = await import('../contexts/ApiContext');
        // Get the context value using a custom hook approach
        // For now, we'll just indicate that the context is available
        setApiContext({ isAvailable: true });
      } catch (error) {
        console.error('Error loading API context:', error);
        setApiContext({ isAvailable: false });
      } finally {
        setIsLoading(false);
      }
    };

    loadApiContext();
  }, []);

  return (
    <Layout title="Interactive Chapter Demo" description="Demo of interactive chapter with backend integration">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>Interactive Chapter Demo</h1>

            <div className="margin-bottom--lg">
              <h2>Current Status</h2>
              <p>
                <strong>Context:</strong> {isLoading ? 'Loading...' : apiContext?.isAvailable ? '✅ Available' : '❌ Not available (SSR/SSG)'}
              </p>
              {isLoading && <p>Loading API context...</p>}
            </div>

            <InteractiveChapter
              chapterSlug="intro-ros2"
              title="Introduction to ROS 2"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DemoInteractiveChapterPage;