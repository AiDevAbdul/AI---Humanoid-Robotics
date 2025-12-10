import React, { useState, useEffect, useRef } from 'react';

const URDFViewer = ({ urdfUrl, robotName = 'Robot', chapterId, studentId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerState, setViewerState] = useState({
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    camera: { distance: 5, angleX: 0, angleY: 0 }
  });
  const [robotJoints, setRobotJoints] = useState([]);
  const [jointStates, setJointStates] = useState({});
  const [activeTab, setActiveTab] = useState('viewer');
  const [selectedLink, setSelectedLink] = useState(null);
  const [showCollision, setShowCollision] = useState(false);
  const [showInertial, setShowInertial] = useState(false);
  const viewerRef = useRef(null);

  // Simulate loading URDF model
  useEffect(() => {
    const loadURDF = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would parse the actual URDF
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock robot joints data
        const mockJoints = [
          { name: 'shoulder_pan_joint', type: 'revolute', limits: { lower: -3.14, upper: 3.14 } },
          { name: 'shoulder_lift_joint', type: 'revolute', limits: { lower: -3.14, upper: 3.14 } },
          { name: 'elbow_joint', type: 'revolute', limits: { lower: -3.14, upper: 3.14 } },
          { name: 'wrist_1_joint', type: 'revolute', limits: { lower: -3.14, upper: 3.14 } },
          { name: 'wrist_2_joint', type: 'revolute', limits: { lower: -3.14, upper: 3.14 } },
          { name: 'wrist_3_joint', type: 'revolute', limits: { lower: -3.14, upper: 3.14 } }
        ];

        const initialJointStates = {};
        mockJoints.forEach(joint => {
          initialJointStates[joint.name] = 0;
        });

        setRobotJoints(mockJoints);
        setJointStates(initialJointStates);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load URDF model');
        setIsLoading(false);
      }
    };

    if (urdfUrl) {
      loadURDF();
    } else {
      setError('No URDF URL provided');
      setIsLoading(false);
    }
  }, [urdfUrl]);

  const handleJointChange = (jointName, value) => {
    setJointStates(prev => ({
      ...prev,
      [jointName]: parseFloat(value)
    }));
  };

  const handleRotate = (axis, delta) => {
    setViewerState(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        [axis]: prev.rotation[axis] + delta
      }
    }));
  };

  const handleScale = (delta) => {
    setViewerState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, prev.scale + delta))
    }));
  };

  const handleReset = () => {
    setViewerState({
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      scale: 1,
      camera: { distance: 5, angleX: 0, angleY: 0 }
    });

    // Reset joint states to 0
    const resetJointStates = {};
    robotJoints.forEach(joint => {
      resetJointStates[joint.name] = 0;
    });
    setJointStates(resetJointStates);
  };

  const loadExampleRobot = (robotType) => {
    setIsLoading(true);
    // In a real implementation, this would load a different URDF
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const availableRobots = [
    { id: 'ur5', name: 'Universal Robots UR5', urdf: '/models/ur5.urdf', description: '6-axis industrial robot' },
    { id: 'panda', name: 'Franka Emika Panda', urdf: '/models/panda.urdf', description: '7-DOF collaborative robot' },
    { id: 'fetch', name: 'Fetch Robot', urdf: '/models/fetch.urdf', description: 'Mobile manipulation platform' },
    { id: 'turtlebot3', name: 'TurtleBot3', urdf: '/models/turtlebot3.urdf', description: 'Educational mobile robot' },
    { id: 'shadowhand', name: 'Shadow Hand', urdf: '/models/shadow_hand.urdf', description: 'Anthropomorphic robotic hand' }
  ];

  return (
    <div className="urdf-viewer-container">
      <div className="viewer-header">
        <h3>URDF Robot Viewer - {robotName}</h3>
        <div className="viewer-controls">
          <select
            onChange={(e) => loadExampleRobot(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Load example robot...</option>
            {availableRobots.map(robot => (
              <option key={robot.id} value={robot.id}>
                {robot.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="viewer-tabs">
        <button
          className={activeTab === 'viewer' ? 'active' : ''}
          onClick={() => setActiveTab('viewer')}
        >
          Viewer
        </button>
        <button
          className={activeTab === 'joints' ? 'active' : ''}
          onClick={() => setActiveTab('joints')}
        >
          Joints
        </button>
        <button
          className={activeTab === 'links' ? 'active' : ''}
          onClick={() => setActiveTab('links')}
        >
          Links
        </button>
        <button
          className={activeTab === 'properties' ? 'active' : ''}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
      </div>

      <div className="viewer-content">
        {activeTab === 'viewer' && (
          <div className="viewer-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading URDF model...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
              </div>
            ) : (
              <>
                <div className="urdf-viewer" ref={viewerRef}>
                  {/* In a real implementation, this would be a 3D canvas for URDF visualization */}
                  <div className="urdf-canvas">
                    <div className="robot-visualization">
                      <div className="robot-structure">
                        {/* Simplified robot visualization */}
                        <div className="robot-base"></div>
                        <div className="robot-shoulder"></div>
                        <div className="robot-arm"></div>
                        <div className="robot-forearm"></div>
                        <div className="robot-wrist"></div>
                        <div className="robot-end-effector"></div>
                      </div>

                      {/* Overlay with joint information */}
                      <div className="joint-overlay">
                        {robotJoints.slice(0, 3).map((joint, index) => (
                          <div key={joint.name} className="joint-indicator" style={{
                            top: `${20 + index * 15}%`,
                            left: `${10}%`
                          }}>
                            <div className="joint-name">{joint.name}</div>
                            <div className="joint-value">{jointStates[joint.name]?.toFixed(2) || 0} rad</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="viewer-controls-panel">
                  <div className="transform-controls">
                    <button onClick={() => handleRotate('x', 0.1)}>Rotate X+</button>
                    <button onClick={() => handleRotate('x', -0.1)}>Rotate X-</button>
                    <button onClick={() => handleRotate('y', 0.1)}>Rotate Y+</button>
                    <button onClick={() => handleRotate('y', -0.1)}>Rotate Y-</button>
                    <button onClick={() => handleRotate('z', 0.1)}>Rotate Z+</button>
                    <button onClick={() => handleRotate('z', -0.1)}>Rotate Z-</button>
                  </div>

                  <div className="scale-controls">
                    <button onClick={() => handleScale(0.1)}>Zoom In</button>
                    <button onClick={() => handleScale(-0.1)}>Zoom Out</button>
                    <button onClick={handleReset}>Reset View</button>
                  </div>

                  <div className="display-options">
                    <label>
                      <input
                        type="checkbox"
                        checked={showCollision}
                        onChange={(e) => setShowCollision(e.target.checked)}
                      />
                      Show Collision
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showInertial}
                        onChange={(e) => setShowInertial(e.target.checked)}
                      />
                      Show Inertial
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'joints' && (
          <div className="joints-section">
            <h4>Robot Joints</h4>
            <div className="joints-list">
              {robotJoints.map((joint) => (
                <div key={joint.name} className="joint-item">
                  <div className="joint-header">
                    <h5>{joint.name}</h5>
                    <span className="joint-type">{joint.type}</span>
                  </div>
                  <div className="joint-controls">
                    <label>
                      Position (rad):
                      <input
                        type="range"
                        min={joint.limits?.lower || -3.14}
                        max={joint.limits?.upper || 3.14}
                        step="0.01"
                        value={jointStates[joint.name] || 0}
                        onChange={(e) => handleJointChange(joint.name, e.target.value)}
                      />
                      <span>{(jointStates[joint.name] || 0).toFixed(2)}</span>
                    </label>
                  </div>
                  <div className="joint-limits">
                    <span>Min: {joint.limits?.lower || -3.14} rad</span>
                    <span>Max: {joint.limits?.upper || 3.14} rad</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="links-section">
            <h4>Robot Links</h4>
            <div className="links-grid">
              <div className="link-card">
                <h5>base_link</h5>
                <div className="link-info">
                  <p>Root link of the robot</p>
                  <p>Mass: 2.0 kg</p>
                  <p>Visual: cylinder</p>
                  <p>Collision: cylinder</p>
                </div>
              </div>
              <div className="link-card">
                <h5>shoulder_link</h5>
                <div className="link-info">
                  <p>Shoulder joint link</p>
                  <p>Mass: 1.5 kg</p>
                  <p>Visual: mesh</p>
                  <p>Collision: box</p>
                </div>
              </div>
              <div className="link-card">
                <h5>upper_arm_link</h5>
                <div className="link-info">
                  <p>Upper arm link</p>
                  <p>Mass: 2.5 kg</p>
                  <p>Visual: mesh</p>
                  <p>Collision: cylinder</p>
                </div>
              </div>
              <div className="link-card">
                <h5>forearm_link</h5>
                <div className="link-info">
                  <p>Forearm link</p>
                  <p>Mass: 1.8 kg</p>
                  <p>Visual: mesh</p>
                  <p>Collision: cylinder</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="properties-section">
            <h4>URDF Properties</h4>

            <div className="property-group">
              <h5>Robot Information</h5>
              <div className="property-item">
                <span>Name:</span>
                <span>{robotName}</span>
              </div>
              <div className="property-item">
                <span>Total Links:</span>
                <span>{4}</span>
              </div>
              <div className="property-item">
                <span>Total Joints:</span>
                <span>{robotJoints.length}</span>
              </div>
              <div className="property-item">
                <span>DOF:</span>
                <span>{robotJoints.length}</span>
              </div>
            </div>

            <div className="property-group">
              <h5>URDF Structure</h5>
              <div className="urdf-tree">
                <div className="tree-node root">
                  base_link
                  <div className="tree-children">
                    <div className="tree-node">shoulder_link</div>
                    <div className="tree-node">upper_arm_link</div>
                    <div className="tree-node">forearm_link</div>
                    <div className="tree-node">wrist_link</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="property-group">
              <h5>Visual Properties</h5>
              <div className="visual-options">
                <div className="option-item">
                  <label>
                    <input
                      type="checkbox"
                      defaultChecked
                    />
                    Show Visual Meshes
                  </label>
                </div>
                <div className="option-item">
                  <label>
                    <input
                      type="checkbox"
                    />
                      Show Collision Geometry
                  </label>
                </div>
                <div className="option-item">
                  <label>
                    <input
                      type="checkbox"
                    />
                    Show Coordinate Frames
                  </label>
                </div>
                <div className="option-item">
                  <label>
                    <input
                      type="checkbox"
                    />
                    Show Joint Axes
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="viewer-footer">
        <div className="viewer-stats">
          <span>Joints: {robotJoints.length}</span>
          <span>Links: 4</span>
          <span>Scale: {viewerState.scale.toFixed(1)}x</span>
          <span>Mode: URDF</span>
        </div>
      </div>
    </div>
  );
};

export default URDFViewer;