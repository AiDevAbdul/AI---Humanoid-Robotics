import React, { useState, useEffect, useRef } from 'react';

const Model3DViewer = ({ modelUrl, modelType = 'glb', chapterId, studentId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerState, setViewerState] = useState({
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    camera: { distance: 5, angleX: 0, angleY: 0 }
  });
  const [controlsMode, setControlsMode] = useState('orbit'); // orbit, pan, zoom
  const [activeTab, setActiveTab] = useState('viewer');
  const viewerRef = useRef(null);

  // Simulate loading a 3D model
  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would load the actual 3D model
        // For now, we'll simulate the loading process
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (modelUrl) {
          // Simulate successful model loading
          setIsLoading(false);
        } else {
          setError('No model URL provided');
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    };

    loadModel();
  }, [modelUrl]);

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
  };

  const handleModelSelect = async (modelType) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch a different model
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load selected model');
      setIsLoading(false);
    }
  };

  const availableModels = [
    { id: 'ur5', name: 'Universal Robots UR5', description: '6-axis industrial robot arm' },
    { id: 'franka', name: 'Franka Emika Panda', description: '7-DOF collaborative robot' },
    { id: 'turtlebot3', name: 'TurtleBot3 Burger', description: 'Mobile robot platform' },
    { id: 'carter', name: 'Carter Mobile Base', description: 'Differential drive robot' },
    { id: 'stretch', name: 'Hello Robot Stretch', description: 'Mobile manipulator' },
    { id: 'atlas', name: 'Boston Dynamics Atlas', description: 'Humanoid robot' }
  ];

  return (
    <div className="model-3d-viewer-container">
      <div className="viewer-header">
        <h3>3D Model Viewer</h3>
        <div className="viewer-controls">
          <select
            onChange={(e) => handleModelSelect(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select a robot model...</option>
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
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
          className={activeTab === 'controls' ? 'active' : ''}
          onClick={() => setActiveTab('controls')}
        >
          Controls
        </button>
        <button
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
      </div>

      <div className="viewer-content">
        {activeTab === 'viewer' && (
          <div className="viewer-viewport">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading 3D model...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
              </div>
            ) : (
              <>
                <div className="model-placeholder" ref={viewerRef}>
                  {/* In a real implementation, this would be a 3D canvas/webgl context */}
                  <div className="model-canvas">
                    <div className="model-visualization">
                      <div className="model-render">
                        {/* This would be replaced with actual 3D rendering */}
                        <div className="robot-model-placeholder">
                          <div className="robot-shape">
                            {/* Simplified robot representation */}
                            <div className="robot-base"></div>
                            <div className="robot-arm"></div>
                            <div className="robot-end-effector"></div>
                          </div>
                        </div>
                      </div>

                      {/* Overlay with model info */}
                      <div className="model-overlay">
                        <div className="model-coordinates">
                          <div>X: {viewerState.rotation.x.toFixed(2)}</div>
                          <div>Y: {viewerState.rotation.y.toFixed(2)}</div>
                          <div>Z: {viewerState.rotation.z.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="viewer-interactions">
                  <div className="interaction-controls">
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
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="controls-panel">
            <h4>Model Controls</h4>

            <div className="control-section">
              <h5>Rotation</h5>
              <div className="control-group">
                <label>
                  X-axis:
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.01"
                    value={viewerState.rotation.x}
                    onChange={(e) => setViewerState(prev => ({
                      ...prev,
                      rotation: { ...prev.rotation, x: parseFloat(e.target.value) }
                    }))}
                  />
                  <span>{viewerState.rotation.x.toFixed(2)} rad</span>
                </label>

                <label>
                  Y-axis:
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.01"
                    value={viewerState.rotation.y}
                    onChange={(e) => setViewerState(prev => ({
                      ...prev,
                      rotation: { ...prev.rotation, y: parseFloat(e.target.value) }
                    }))}
                  />
                  <span>{viewerState.rotation.y.toFixed(2)} rad</span>
                </label>

                <label>
                  Z-axis:
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.01"
                    value={viewerState.rotation.z}
                    onChange={(e) => setViewerState(prev => ({
                      ...prev,
                      rotation: { ...prev.rotation, z: parseFloat(e.target.value) }
                    }))}
                  />
                  <span>{viewerState.rotation.z.toFixed(2)} rad</span>
                </label>
              </div>
            </div>

            <div className="control-section">
              <h5>Scale</h5>
              <div className="control-group">
                <label>
                  Scale:
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={viewerState.scale}
                    onChange={(e) => setViewerState(prev => ({
                      ...prev,
                      scale: parseFloat(e.target.value)
                    }))}
                  />
                  <span>{viewerState.scale.toFixed(1)}x</span>
                </label>
              </div>
            </div>

            <div className="control-section">
              <h5>Navigation</h5>
              <div className="control-group">
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="controls-mode"
                      value="orbit"
                      checked={controlsMode === 'orbit'}
                      onChange={(e) => setControlsMode(e.target.value)}
                    />
                    Orbit
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="controls-mode"
                      value="pan"
                      checked={controlsMode === 'pan'}
                      onChange={(e) => setControlsMode(e.target.value)}
                    />
                    Pan
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="controls-mode"
                      value="zoom"
                      checked={controlsMode === 'zoom'}
                      onChange={(e) => setControlsMode(e.target.value)}
                    />
                    Zoom
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="info-panel">
            <h4>Model Information</h4>

            <div className="model-details">
              <div className="detail-item">
                <strong>Model Type:</strong> {modelType.toUpperCase()}
              </div>
              <div className="detail-item">
                <strong>File Size:</strong> {modelUrl ? 'Loading...' : 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Triangles:</strong> {modelUrl ? 'Loading...' : 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Materials:</strong> {modelUrl ? 'Loading...' : 'N/A'}
              </div>
            </div>

            <h5>Available Models</h5>
            <div className="models-grid">
              {availableModels.map(model => (
                <div key={model.id} className="model-item" onClick={() => handleModelSelect(model.id)}>
                  <h6>{model.name}</h6>
                  <p>{model.description}</p>
                </div>
              ))}
            </div>

            <h5>Technical Specifications</h5>
            <div className="specs-list">
              <div className="spec-item">
                <strong>Format Support:</strong> GLB, GLTF, OBJ, FBX, STL
              </div>
              <div className="spec-item">
                <strong>Rendering:</strong> WebGL with Physically-Based Rendering (PBR)
              </div>
              <div className="spec-item">
                <strong>Features:</strong> Lighting, Textures, Animations, Interactivity
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="viewer-footer">
        <div className="viewer-stats">
          <span>Controls: {controlsMode}</span>
          <span>Scale: {viewerState.scale.toFixed(1)}x</span>
          <span>Rotation: X:{viewerState.rotation.x.toFixed(2)} Y:{viewerState.rotation.y.toFixed(2)} Z:{viewerState.rotation.z.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Model3DViewer;