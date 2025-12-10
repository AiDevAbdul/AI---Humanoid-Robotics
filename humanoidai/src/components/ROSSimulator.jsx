import React, { useState, useEffect } from 'react';

const ROSSimulator = ({ chapterId, studentId }) => {
  const [simulationState, setSimulationState] = useState('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  const startSimulation = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to start ROS 2 simulation
      const response = await fetch(`/api/simulations/ros2/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          studentId,
          config: {
            environment: 'default',
            robot: 'turtlebot3'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimulationData(data);
        setSimulationState('running');
      }
    } catch (error) {
      console.error('Error starting ROS 2 simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/simulations/ros2/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulationId: simulationData?.id,
          chapterId,
          studentId
        }),
      });
      setSimulationState('stopped');
      setSimulationData(null);
    } catch (error) {
      console.error('Error stopping ROS 2 simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = async (command) => {
    try {
      const response = await fetch(`/api/simulations/ros2/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulationId: simulationData?.id,
          command,
          chapterId,
          studentId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Error executing ROS 2 command:', error);
    }
  };

  return (
    <div className="ros-simulator-container">
      <div className="simulator-header">
        <h3>ROS 2 Interactive Simulator</h3>
        <div className="simulator-controls">
          <button
            onClick={startSimulation}
            disabled={simulationState === 'running' || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Starting...' : simulationState === 'running' ? 'Running' : 'Start Simulation'}
          </button>
          <button
            onClick={stopSimulation}
            disabled={simulationState !== 'running' || isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? 'Stopping...' : 'Stop'}
          </button>
        </div>
      </div>

      <div className="simulator-content">
        {simulationState === 'running' ? (
          <div className="simulation-view">
            <div className="simulation-iframe-container">
              {/* In a real implementation, this would be an iframe or canvas for the simulation */}
              <div className="simulation-placeholder">
                <p>ROS 2 Simulation Environment</p>
                <p>Status: {simulationData?.status || 'Initializing...'}</p>
              </div>
            </div>

            <div className="command-interface">
              <h4>Command Interface</h4>
              <div className="command-input">
                <input
                  type="text"
                  placeholder="Enter ROS 2 command (e.g., 'ros2 run turtlebot3_example move')"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      executeCommand(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value) {
                    executeCommand(input.value);
                    input.value = '';
                  }
                }}>
                  Execute
                </button>
              </div>

              <div className="command-history">
                <h5>Command History</h5>
                <pre className="command-output">
                  {simulationData?.commandHistory?.join('\n') || 'No commands executed yet'}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="simulator-instructions">
            <p>Click "Start Simulation" to begin the ROS 2 interactive environment.</p>
            <p>This simulator allows you to run ROS 2 commands and see their effects in a virtual environment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROSSimulator;