import React, { useState, useEffect } from 'react';

const GazeboUnitySimulator = ({ chapterId, studentId, simulationType = 'gazebo' }) => {
  const [simulationState, setSimulationState] = useState('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [activeTab, setActiveTab] = useState('simulation');

  const startSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/simulations/${simulationType}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          studentId,
          config: {
            environment: 'default',
            simulationType
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimulationData(data);
        setSimulationState('running');
      }
    } catch (error) {
      console.error(`Error starting ${simulationType} simulation:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/simulations/${simulationType}/stop`, {
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
      console.error(`Error stopping ${simulationType} simulation:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeSimulationCommand = async (command) => {
    try {
      const response = await fetch(`/api/simulations/${simulationType}/execute`, {
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
      console.error(`Error executing ${simulationType} command:`, error);
    }
  };

  const loadScenario = async (scenarioId) => {
    try {
      const response = await fetch(`/api/simulations/${simulationType}/scenarios/${scenarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const scenarioData = await response.json();
        setSimulationData(prev => ({ ...prev, ...scenarioData }));
      }
    } catch (error) {
      console.error(`Error loading ${simulationType} scenario:`, error);
    }
  };

  return (
    <div className="gazebo-unity-simulator-container">
      <div className="simulator-header">
        <h3>{simulationType === 'gazebo' ? 'Gazebo' : 'Unity'} Simulation Environment</h3>
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

      <div className="simulator-tabs">
        <button
          className={activeTab === 'simulation' ? 'active' : ''}
          onClick={() => setActiveTab('simulation')}
        >
          Simulation
        </button>
        <button
          className={activeTab === 'scenarios' ? 'active' : ''}
          onClick={() => setActiveTab('scenarios')}
        >
          Scenarios
        </button>
        <button
          className={activeTab === 'parameters' ? 'active' : ''}
          onClick={() => setActiveTab('parameters')}
        >
          Parameters
        </button>
      </div>

      <div className="simulator-content">
        {simulationState === 'running' ? (
          <div className="simulation-view">
            {activeTab === 'simulation' && (
              <div className="simulation-iframe-container">
                {/* In a real implementation, this would be an iframe or canvas for the simulation */}
                <div className="simulation-placeholder">
                  <p>{simulationType === 'gazebo' ? 'Gazebo' : 'Unity'} Simulation Environment</p>
                  <p>Status: {simulationData?.status || 'Initializing...'}</p>
                  <p>Environment: {simulationData?.environment || 'Default'}</p>
                </div>

                <div className="simulation-controls">
                  <h4>Simulation Controls</h4>
                  <div className="control-buttons">
                    <button onClick={() => executeSimulationCommand('pause')}>Pause</button>
                    <button onClick={() => executeSimulationCommand('resume')}>Resume</button>
                    <button onClick={() => executeSimulationCommand('reset')}>Reset</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scenarios' && (
              <div className="scenarios-panel">
                <h4>Available Scenarios</h4>
                <div className="scenarios-list">
                  {simulationData?.scenarios?.map((scenario, index) => (
                    <div key={index} className="scenario-item">
                      <h5>{scenario.name}</h5>
                      <p>{scenario.description}</p>
                      <button onClick={() => loadScenario(scenario.id)}>Load</button>
                    </div>
                  )) || (
                    <p>No scenarios available. The backend will provide scenario data when connected.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="parameters-panel">
                <h4>Simulation Parameters</h4>
                <div className="parameters-form">
                  <label>
                    Physics Engine:
                    <select defaultValue="ode">
                      <option value="ode">ODE</option>
                      <option value="bullet">Bullet</option>
                      <option value="dart">DART</option>
                    </select>
                  </label>

                  <label>
                    Real-time Factor:
                    <input type="number" defaultValue="1" min="0.1" max="10" step="0.1" />
                  </label>

                  <label>
                    Update Rate (Hz):
                    <input type="number" defaultValue="1000" min="1" max="10000" />
                  </label>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="simulator-instructions">
            <p>Click "Start Simulation" to begin the {simulationType === 'gazebo' ? 'Gazebo' : 'Unity'} environment.</p>
            <p>This simulator provides a realistic physics-based environment for testing robotics algorithms.</p>
            {simulationType === 'gazebo' && (
              <div>
                <h4>What you can do with Gazebo:</h4>
                <ul>
                  <li>Test robot navigation algorithms</li>
                  <li>Simulate sensor data</li>
                  <li>Validate control systems</li>
                  <li>Run physics-based experiments</li>
                </ul>
              </div>
            )}
            {simulationType === 'unity' && (
              <div>
                <h4>What you can do with Unity:</h4>
                <ul>
                  <li>Visualize complex 3D environments</li>
                  <li>Test perception algorithms</li>
                  <li>Simulate realistic lighting conditions</li>
                  <li>Run VR/AR compatible simulations</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GazeboUnitySimulator;