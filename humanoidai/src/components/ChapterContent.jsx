import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Chatbot from './Chatbot';

const ChapterContent = ({ chapterData }) => {
  const [content, setContent] = useState(chapterData || {});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const chapterSlug = location.pathname.split('/').pop();

  useEffect(() => {
    // In a real implementation, this would fetch from the backend API
    // For now, we'll use mock data based on the chapter slug
    const mockChapterData = {
      id: '1',
      title: 'Introduction to ROS 2',
      slug: 'intro-ros2',
      module: 'ros2',
      order: 1,
      content: {
        text: `# Introduction to ROS 2

Welcome to the first chapter of Module 1: The Robotic Nervous System. In this chapter, you'll learn the fundamentals of Robot Operating System 2 (ROS 2), which serves as the communication framework for robotic applications.

## What is ROS 2?

ROS 2 is a flexible framework for writing robotic software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robotic applications.

## Key Concepts

- **Nodes**: Processes that perform computation
- **Topics**: Named buses over which nodes exchange messages
- **Services**: Synchronous request/reply communication pattern
- **Actions**: Asynchronous, goal-oriented communication pattern

## Interactive Elements

This textbook includes interactive elements to help you learn:

1. **Code Playground**: Try out ROS 2 commands in our embedded terminal
2. **3D Visualization**: See ROS 2 concepts in action with our 3D robot models
3. **Quizzes**: Test your knowledge with interactive quizzes

Try running a simple ROS 2 command in the playground below:

\`\`\`bash
ros2 run turtlesim turtlesim_node
\`\`\`

This will launch the turtlesim node, which provides a simple simulator for learning ROS 2 concepts.`,
        html_content: '',
        translations: {
          ur: '# ROS 2 کا تعارف'
        }
      },
      interactive_elements: [
        {
          id: 'code-playground-1',
          type: 'code_playground',
          config: {
            language: 'bash',
            initial_code: 'ros2 run turtlesim turtlesim_node',
            title: 'Try ROS 2 Command'
          }
        }
      ],
      metadata: {
        estimated_reading_time: 15,
        learning_objectives: ['Understand ROS 2 basics', 'Learn about nodes and topics'],
        keywords: ['ROS 2', 'nodes', 'topics', 'services'],
        difficulty: 'beginner'
      },
      prerequisites: [],
      progress: {
        status: 'in_progress',
        completion_percentage: 30,
        time_spent: 420, // seconds
        scores: {
          quiz_score: 75,
          practical_score: 80,
          overall_score: 78
        }
      }
    };

    setContent(mockChapterData);
    setLoading(false);
  }, [chapterSlug]);

  if (loading) {
    return <div>Loading chapter content...</div>;
  }

  // Function to render interactive elements
  const renderInteractiveElement = (element) => {
    switch (element.type) {
      case 'code_playground':
        return (
          <div key={element.id} className="code-playground">
            <h4>{element.config.title}</h4>
            <SyntaxHighlighter
              language={element.config.language}
              style={atomDark}
              customStyle={{ margin: '1rem 0', borderRadius: '5px' }}
            >
              {element.config.initial_code}
            </SyntaxHighlighter>
            <div className="playground-controls">
              <button className="button button--primary">Run Code</button>
              <button className="button button--secondary">Reset</button>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div key={element.id} className="quiz-component">
            <h4>Knowledge Check</h4>
            <p>Test your understanding with this interactive quiz.</p>
            <div className="quiz-questions">
              {/* Quiz questions would be rendered here */}
            </div>
          </div>
        );
      default:
        return (
          <div key={element.id} className="interactive-element">
            <p>Interactive element of type: {element.type}</p>
          </div>
        );
    }
  };

  // Render markdown content - in a real implementation, we'd use a proper markdown parser
  const renderMarkdown = (text) => {
    // This is a simplified approach - in a real implementation, we'd use a proper markdown parser
    const sections = text.split('\n## ');

    return (
      <div>
        {sections.map((section, index) => {
          if (index === 0) {
            // First section (before first ##) - render as main content
            const lines = section.split('\n');
            return (
              <div key={index}>
                {lines.map((line, lineIndex) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={lineIndex}>{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={lineIndex}>{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={lineIndex}>{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={lineIndex}>{line.substring(2)}</li>;
                  } else if (line.startsWith('```')) {
                    // This is a simplified approach - in a real implementation, we'd properly parse code blocks
                    return null;
                  } else if (line.trim() !== '') {
                    return <p key={lineIndex}>{line}</p>;
                  }
                  return null;
                })}
              </div>
            );
          } else {
            // Subsequent sections (after ##) - render as subsections
            const lines = section.split('\n');
            const title = lines[0];
            return (
              <div key={index}>
                <h2>{title}</h2>
                {lines.slice(1).map((line, lineIndex) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={lineIndex}>{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={lineIndex}>{line.substring(2)}</li>;
                  } else if (line.startsWith('```')) {
                    // This is a simplified approach - in a real implementation, we'd properly parse code blocks
                    return null;
                  } else if (line.trim() !== '') {
                    return <p key={lineIndex}>{line}</p>;
                  }
                  return null;
                })}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="chapter-content">
      <header className="chapter-header">
        <h1>{content.title}</h1>
        <div className="chapter-meta">
          <span className="module">Module: {content.module}</span>
          <span className="difficulty">Difficulty: {content.metadata?.difficulty}</span>
          <span className="time">~{content.metadata?.estimated_reading_time} min read</span>
        </div>
        <div className="learning-objectives">
          <h3>Learning Objectives:</h3>
          <ul>
            {content.metadata?.learning_objectives?.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      </header>

      <div className="chapter-body">
        {renderMarkdown(content.content?.text || '')}

        {/* Render interactive elements */}
        {content.interactive_elements?.map(renderInteractiveElement)}
      </div>

      {/* Chatbot integration */}
      <div className="chapter-chatbot">
        <h3>Ask AI Assistant</h3>
        <p>Have questions about this chapter? Ask our AI assistant for clarification.</p>
        <Chatbot courseId={content.module} chapterId={content.id} />
      </div>

      <footer className="chapter-footer">
        <div className="progress-section">
          <h4>Your Progress</h4>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${content.progress?.completion_percentage || 0}%` }}
            ></div>
          </div>
          <p>{content.progress?.completion_percentage || 0}% complete</p>
        </div>

        <div className="navigation">
          <button className="button button--secondary">Previous Chapter</button>
          <button className="button button--primary">Next Chapter</button>
        </div>
      </footer>
    </div>
  );
};

export default ChapterContent;