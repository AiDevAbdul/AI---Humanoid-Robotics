import React, { useState, useEffect } from 'react';

const IsaacSimComponent = ({ chapterId, studentId }) => {
  const [simulationState, setSimulationState] = useState('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [activeTab, setActiveTab] = useState('simulation');
  const [selectedRobot, setSelectedRobot] = useState('franka');

  const startSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/simulations/isaac/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          studentId,
          config: {
            environment: 'warehouse',
            robot: selectedRobot,
            scene: 'default'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimulationData(data);
        setSimulationState('running');
      }
    } catch (error) {
      console.error('Error starting Isaac Sim simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/simulations/isaac/stop', {
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
      console.error('Error stopping Isaac Sim simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeIsaacCommand = async (command) => {
    try {
      const response = await fetch('/api/simulations/isaac/execute', {
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
      console.error('Error executing Isaac Sim command:', error);
    }
  };

  const loadRobotTask = async (taskId) => {
    try {
      const response = await fetch(`/api/simulations/isaac/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const taskData = await response.json();
        setSimulationData(prev => ({ ...prev, ...taskData }));
      }
    } catch (error) {
      console.error('Error loading Isaac Sim task:', error);
    }
  };

  const availableRobots = [
    { id: 'franka', name: 'Franka Emika Panda', description: '7-DOF robotic arm' },
    { id: 'carter', name: 'Carter Mobile Base', description: 'Differential drive robot' },
    { id: 'stretch', name: 'Hello Robot Stretch', description: 'Mobile manipulator' },
    { id: 'ur5', name: 'Universal Robots UR5', description: '6-DOF industrial arm' }
  ];

  const availableTasks = [
    { id: 'pick_place', name: 'Pick and Place', description: 'Basic manipulation task' },
    { id: 'navigation', name: 'Navigation', description: 'Path planning and obstacle avoidance' },
    { id: 'grasping', name: 'Grasping', description: 'Object grasping and manipulation' },
    { id: 'assembly', name: 'Assembly', description: 'Multi-step assembly task' }
  ];

  return (
    <div className="isaac-sim-component-container">
      <div className="simulator-header">
        <h3>NVIDIA Isaac Sim Environment</h3>
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

      <div className="simulator-setup">
        <div className="robot-selection">
          <label htmlFor="robot-select">Select Robot:</label>
          <select
            id="robot-select"
            value={selectedRobot}
            onChange={(e) => setSelectedRobot(e.target.value)}
            disabled={simulationState === 'running'}
          >
            {availableRobots.map(robot => (
              <option key={robot.id} value={robot.id}>
                {robot.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="simulator-tabs">
        <button
          className={activeTab === 'simulation' ? 'active' : ''}
          onClick={() => setActiveTab('simulation')}
        >
          Simulation
        </button>
        <button
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="simulator-content">
        {simulationState === 'running' ? (
          <div className="simulation-view">
            {activeTab === 'simulation' && (
              <div className="simulation-iframe-container">
                {/* In a real implementation, this would be an iframe or canvas for the simulation */}
                <div className="simulation-placeholder">
                  <p>NVIDIA Isaac Sim Environment</p>
                  <p>Status: {simulationData?.status || 'Initializing...'}</p>
                  <p>Robot: {availableRobots.find(r => r.id === selectedRobot)?.name}</p>
                  <p>Environment: {simulationData?.environment || 'Warehouse'}</p>
                </div>

                <div className="simulation-controls">
                  <h4>Robot Controls</h4>
                  <div className="control-buttons">
                    <button onClick={() => executeIsaacCommand('reset_robot')}>Reset Robot</button>
                    <button onClick={() => executeIsaacCommand('pause_physics')}>Pause Physics</button>
                    <button onClick={() => executeIsaacCommand('resume_physics')}>Resume Physics</button>
                  </div>

                  <div className="robot-commands">
                    <h5>Robot-Specific Commands</h5>
                    <div className="command-input">
                      <input
                        type="text"
                        placeholder="Enter Isaac Sim command..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            executeIsaacCommand(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        if (input.value) {
                          executeIsaacCommand(input.value);
                          input.value = '';
                        }
                      }}>
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="tasks-panel">
                <h4>Available Tasks</h4>
                <div className="tasks-grid">
                  {availableTasks.map((task, index) => (
                    <div key={index} className="task-item">
                      <h5>{task.name}</h5>
                      <p>{task.description}</p>
                      <button onClick={() => loadRobotTask(task.id)}>Load Task</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-panel">
                <h4>Simulation Analytics</h4>
                <div className="analytics-grid">
                  <div className="metric-card">
                    <h5>Success Rate</h5>
                    <p>{simulationData?.analytics?.successRate || '0'}%</p>
                  </div>
                  <div className="metric-card">
                    <h5>Time Elapsed</h5>
                    <p>{simulationData?.analytics?.timeElapsed || '0'}s</p>
                  </div>
                  <div className="metric-card">
                    <h5>Energy Used</h5>
                    <p>{simulationData?.analytics?.energyUsed || '0'} J</p>
                  </div>
                  <div className="metric-card">
                    <h5>Collisions</h5>
                    <p>{simulationData?.analytics?.collisions || '0'}</p>
                  </div>
                </div>

                <div className="performance-chart">
                  <h5>Performance Over Time</h5>
                  <div className="chart-placeholder">
                    {/* In a real implementation, this would be a chart component */}
                    <p>Performance chart would be displayed here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="simulator-instructions">
            <p>Click "Start Simulation" to begin the NVIDIA Isaac Sim environment.</p>
            <p>Isaac Sim provides high-fidelity simulation for robotics development with NVIDIA's GPU-accelerated physics.</p>

            <h4>Key Features:</h4>
            <ul>
              <li>Realistic physics simulation with PhysX</li>
              <li>High-fidelity graphics rendering</li>
              <li>Sensor simulation (camera, LiDAR, IMU)</li>
              <li>Robotics frameworks integration (ROS/ROS2)</li>
              <li>AI training environments</li>
            </ul>

            <h4>Supported Robots:</h4>
            <ul>
              {availableRobots.map(robot => (
                <li key={robot.id}><strong>{robot.name}</strong>: {robot.description}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default IsaacSimComponent;