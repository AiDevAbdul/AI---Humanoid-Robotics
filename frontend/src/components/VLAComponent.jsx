import React, { useState, useEffect } from 'react';

const VLAComponent = ({ chapterId, studentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [modelResponse, setModelResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('interface');
  const [modelConfig, setModelConfig] = useState({
    modelType: 'octavius',
    confidenceThreshold: 0.8,
    maxSteps: 10
  });

  const executeVLACommand = async (command) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vla/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          studentId,
          command,
          config: modelConfig
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setModelResponse(result);

        // Add to task history
        const newTask = {
          id: Date.now(),
          command,
          result,
          timestamp: new Date().toISOString()
        };
        setTaskHistory(prev => [newTask, ...prev.slice(0, 9)]); // Keep last 10 tasks

        return result;
      }
    } catch (error) {
      console.error('Error executing VLA command:', error);
      setModelResponse({ error: 'Failed to execute command' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!inputText.trim()) return;

    await executeVLACommand(inputText);
    setInputText('');
  };

  const loadPredefinedTask = async (taskType) => {
    const predefinedTasks = {
      'pick_object': 'Pick up the red cube from the table',
      'navigate_room': 'Navigate to the kitchen and find the blue bottle',
      'assembly': 'Assemble the two parts together',
      'sorting': 'Sort the objects by color into different bins'
    };

    setInputText(predefinedTasks[taskType]);
    await executeVLACommand(predefinedTasks[taskType]);
  };

  const availableModels = [
    { id: 'octavius', name: 'Octavius VLA', description: 'State-of-the-art vision-language-action model' },
    { id: 'vima', name: 'VIMA', description: 'Vision-language models for manipulation' },
    { id: 'instruct2act', name: 'Instruct2Act', description: 'Instruction-guided robotic manipulation' }
  ];

  return (
    <div className="vla-component-container">
      <div className="vla-header">
        <h3>Vision-Language-Action (VLA) Models</h3>
        <div className="model-selector">
          <label htmlFor="model-select">Model:</label>
          <select
            id="model-select"
            value={modelConfig.modelType}
            onChange={(e) => setModelConfig(prev => ({ ...prev, modelType: e.target.value }))}
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="vla-tabs">
        <button
          className={activeTab === 'interface' ? 'active' : ''}
          onClick={() => setActiveTab('interface')}
        >
          Interface
        </button>
        <button
          className={activeTab === 'examples' ? 'active' : ''}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={activeTab === 'config' ? 'active' : ''}
          onClick={() => setActiveTab('config')}
        >
          Config
        </button>
      </div>

      <div className="vla-content">
        {activeTab === 'interface' && (
          <div className="vla-interface">
            <div className="input-section">
              <h4>Enter Natural Language Command</h4>
              <div className="command-input">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what you want the robot to do (e.g., 'Pick up the red cube and place it in the box')"
                  rows="3"
                  disabled={isLoading}
                />
                <button
                  onClick={handleExecute}
                  disabled={isLoading || !inputText.trim()}
                  className="execute-btn"
                >
                  {isLoading ? 'Processing...' : 'Execute'}
                </button>
              </div>
            </div>

            {modelResponse && (
              <div className="response-section">
                <h4>Model Response</h4>
                <div className={`response-content ${modelResponse.error ? 'error' : ''}`}>
                  {modelResponse.error ? (
                    <div className="error-message">
                      <strong>Error:</strong> {modelResponse.error}
                    </div>
                  ) : (
                    <>
                      <div className="response-details">
                        <h5>Action Sequence:</h5>
                        <ul>
                          {modelResponse.actions?.map((action, index) => (
                            <li key={index}>
                              <strong>Step {index + 1}:</strong> {action.description}
                              {action.confidence && ` (Confidence: ${(action.confidence * 100).toFixed(1)}%)`}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {modelResponse.visualization && (
                        <div className="visualization">
                          <h5>Visual Representation:</h5>
                          <img
                            src={modelResponse.visualization}
                            alt="VLA model visualization"
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </div>
                      )}

                      <div className="confidence-metrics">
                        <h5>Confidence Metrics:</h5>
                        <div className="metrics-grid">
                          <div className="metric">
                            <span>Overall Confidence:</span>
                            <span>{modelResponse.confidence ? (modelResponse.confidence * 100).toFixed(1) + '%' : 'N/A'}</span>
                          </div>
                          <div className="metric">
                            <span>Success Probability:</span>
                            <span>{modelResponse.successProbability ? (modelResponse.successProbability * 100).toFixed(1) + '%' : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="examples-section">
            <h4>Predefined Tasks</h4>
            <div className="task-grid">
              <div className="task-card" onClick={() => loadPredefinedTask('pick_object')}>
                <h5>Pick Object</h5>
                <p>Pick up the red cube from the table</p>
              </div>
              <div className="task-card" onClick={() => loadPredefinedTask('navigate_room')}>
                <h5>Navigation</h5>
                <p>Navigate to the kitchen and find the blue bottle</p>
              </div>
              <div className="task-card" onClick={() => loadPredefinedTask('assembly')}>
                <h5>Assembly</h5>
                <p>Assemble the two parts together</p>
              </div>
              <div className="task-card" onClick={() => loadPredefinedTask('sorting')}>
                <h5>Sorting</h5>
                <p>Sort the objects by color into different bins</p>
              </div>
            </div>

            <h4>Model Information</h4>
            <div className="model-info">
              <h5>{availableModels.find(m => m.id === modelConfig.modelType)?.name}</h5>
              <p>{availableModels.find(m => m.id === modelConfig.modelType)?.description}</p>
              <div className="model-features">
                <h6>Key Features:</h6>
                <ul>
                  <li>End-to-end learning from vision, language, and action data</li>
                  <li>Zero-shot generalization to new tasks and environments</li>
                  <li>Real-time inference for robotic manipulation</li>
                  <li>Integration with robotic simulation and real-world platforms</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h4>Task History</h4>
            {taskHistory.length > 0 ? (
              <div className="history-list">
                {taskHistory.map((task) => (
                  <div key={task.id} className="history-item">
                    <div className="task-command">
                      <strong>Command:</strong> {task.command}
                    </div>
                    <div className="task-result">
                      <strong>Result:</strong> {task.result?.actions?.length || 0} actions generated
                    </div>
                    <div className="task-timestamp">
                      {new Date(task.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tasks executed yet.</p>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="config-section">
            <h4>Model Configuration</h4>
            <div className="config-form">
              <div className="form-group">
                <label htmlFor="confidence-threshold">Confidence Threshold:</label>
                <input
                  id="confidence-threshold"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={modelConfig.confidenceThreshold}
                  onChange={(e) => setModelConfig(prev => ({
                    ...prev,
                    confidenceThreshold: parseFloat(e.target.value)
                  }))}
                />
                <span>{(modelConfig.confidenceThreshold * 100).toFixed(0)}%</span>
              </div>

              <div className="form-group">
                <label htmlFor="max-steps">Maximum Steps:</label>
                <input
                  id="max-steps"
                  type="number"
                  min="1"
                  max="50"
                  value={modelConfig.maxSteps}
                  onChange={(e) => setModelConfig(prev => ({
                    ...prev,
                    maxSteps: parseInt(e.target.value)
                  }))}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={modelConfig.useGrounding}
                    onChange={(e) => setModelConfig(prev => ({
                      ...prev,
                      useGrounding: e.target.checked
                    }))}
                  />
                  Use Object Grounding
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={modelConfig.enableLearning}
                    onChange={(e) => setModelConfig(prev => ({
                      ...prev,
                      enableLearning: e.target.checked
                    }))}
                  />
                  Enable Online Learning
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="vla-info">
        <h4>About Vision-Language-Action Models</h4>
        <p>
          VLA models combine visual perception, natural language understanding, and robotic action planning
          to enable robots to follow complex natural language instructions in real-world environments.
          These models represent a significant advancement in robotic manipulation and autonomy.
        </p>
        <p>
          <strong>Key Capabilities:</strong> Object recognition, spatial reasoning, task planning,
          multi-modal integration, and zero-shot generalization to novel tasks.
        </p>
      </div>
    </div>
  );
};

export default VLAComponent;