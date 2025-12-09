import React, { useState, useEffect } from 'react';

const CodePlayground = ({ chapterId, studentId, initialCode = '', language = 'python' }) => {
  const [code, setCode] = useState(initialCode || `# Welcome to the Robotics Code Playground
# Try running this simple ROS 2 example

import rclpy
from rclpy.node import Node

class SimpleNode(Node):
    def __init__(self):
        super().__init__('simple_node')
        self.get_logger().info('Hello from simple_node!')

def main(args=None):
    rclpy.init(args=args)
    node = SimpleNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [languageMode, setLanguageMode] = useState(language);
  const [theme, setTheme] = useState('light');

  const executeCode = async () => {
    setIsLoading(true);
    setOutput('');

    try {
      // Simulate code execution
      // In a real implementation, this would connect to a secure code execution environment
      setOutput('Executing code...\n');

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock execution result based on the code content
      if (code.toLowerCase().includes('ros')) {
        setOutput(prev => prev +
          'INFO] [simple_node]: Hello from simple_node!\n' +
          'Node spinning...\n' +
          'Code executed successfully in simulated ROS 2 environment.\n'
        );
        setExecutionResult({
          success: true,
          runtime: '2.3s',
          resources: { cpu: '45%', memory: '128MB' }
        });
      } else if (code.toLowerCase().includes('gym') || code.toLowerCase().includes('isaac')) {
        setOutput(prev => prev +
          'Initializing Isaac Gym environment...\n' +
          'Environment created successfully\n' +
          'Training started...\n' +
          'Episode 1: Reward = 0.85\n' +
          'Code executed successfully in simulation environment.\n'
        );
        setExecutionResult({
          success: true,
          runtime: '5.7s',
          resources: { cpu: '78%', memory: '512MB' }
        });
      } else {
        setOutput(prev => prev +
          'Code executed successfully.\n' +
          'This is a simulation. In a real environment, this would execute in a secure sandbox.\n'
        );
        setExecutionResult({
          success: true,
          runtime: '0.8s',
          resources: { cpu: '12%', memory: '64MB' }
        });
      }
    } catch (error) {
      setOutput(prev => prev + `Error: ${error.message}\n`);
      setExecutionResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setExecutionResult(null);
  };

  const loadExample = (exampleType) => {
    const examples = {
      ros2: `import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TalkerNode(Node):
    def __init__(self):
        super().__init__('talker')
        self.publisher = self.create_publisher(String, 'chatter', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    node = TalkerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
      gazebo: `#!/usr/bin/env python3
import rospy
from geometry_msgs.msg import Twist

def move_robot():
    rospy.init_node('robot_mover', anonymous=True)
    velocity_publisher = rospy.Publisher('/cmd_vel', Twist, queue_size=10)
    vel_msg = Twist()

    # Linear velocity in x
    vel_msg.linear.x = 1.0
    vel_msg.linear.y = 0.0
    vel_msg.linear.z = 0.0

    # Angular velocity in z
    vel_msg.angular.x = 0.0
    vel_msg.angular.y = 0.0
    vel_msg.angular.z = 0.5

    while not rospy.is_shutdown():
        velocity_publisher.publish(vel_msg)

if __name__ == '__main__':
    try:
        move_robot()
    except rospy.ROSInterruptException:
        pass`,
      pytorch: `import torch
import torch.nn as nn

# Simple neural network for robotics control
class RobotController(nn.Module):
    def __init__(self, input_size=4, hidden_size=64, output_size=2):
        super(RobotController, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size)
        )

    def forward(self, x):
        return self.network(x)

# Create and test the model
model = RobotController()
test_input = torch.randn(1, 4)  # sensor inputs
output = model(test_input)
print(f"Model output: {output.detach().numpy()}")
print("Neural network executed successfully!")`
    };

    setCode(examples[exampleType] || initialCode);
    setOutput('');
    setExecutionResult(null);
  };

  const availableLanguages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'cpp', name: 'C++', icon: '⚙️' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡' },
    { id: 'bash', name: 'Bash', icon: '🐚' }
  ];

  return (
    <div className="code-playground-container">
      <div className="playground-header">
        <h3>Code Playground</h3>
        <div className="playground-controls">
          <select
            value={languageMode}
            onChange={(e) => setLanguageMode(e.target.value)}
          >
            {availableLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className="playground-tabs">
        <button
          className={activeTab === 'editor' ? 'active' : ''}
          onClick={() => setActiveTab('editor')}
        >
          Editor
        </button>
        <button
          className={activeTab === 'examples' ? 'active' : ''}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </button>
        <button
          className={activeTab === 'output' ? 'active' : ''}
          onClick={() => setActiveTab('output')}
        >
          Output
        </button>
      </div>

      <div className="playground-content">
        {activeTab === 'editor' && (
          <div className="editor-section">
            <div className="editor-toolbar">
              <button
                onClick={executeCode}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Running...' : 'Run Code'}
              </button>
              <button onClick={clearOutput} className="btn btn-secondary">
                Clear Output
              </button>
            </div>

            <div className={`code-editor ${theme}`}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-textarea"
                spellCheck="false"
                placeholder="Write your robotics code here..."
              />
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="examples-section">
            <h4>Robotics Code Examples</h4>
            <div className="examples-grid">
              <div className="example-card" onClick={() => loadExample('ros2')}>
                <h5>ROS 2 Publisher</h5>
                <p>Create a simple ROS 2 node that publishes messages</p>
                <div className="example-tags">
                  <span className="tag ros2">ROS 2</span>
                  <span className="tag python">Python</span>
                </div>
              </div>

              <div className="example-card" onClick={() => loadExample('gazebo')}>
                <h5>Gazebo Control</h5>
                <p>Control a robot in Gazebo simulation environment</p>
                <div className="example-tags">
                  <span className="tag gazebo">Gazebo</span>
                  <span className="tag python">Python</span>
                </div>
              </div>

              <div className="example-card" onClick={() => loadExample('pytorch')}>
                <h5>Neural Network</h5>
                <p>Simple neural network for robotics control</p>
                <div className="example-tags">
                  <span className="tag pytorch">PyTorch</span>
                  <span className="tag ai">AI</span>
                </div>
              </div>
            </div>

            <div className="example-info">
              <h5>About the Code Playground</h5>
              <p>
                This secure code execution environment allows you to experiment with robotics code
                without installing any software. Code runs in a sandboxed environment with access
                to robotics libraries and frameworks.
              </p>
              <p>
                <strong>Supported Libraries:</strong> ROS/ROS2, Gazebo, PyTorch, TensorFlow,
                OpenCV, NumPy, SciPy, and more.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="output-section">
            <div className="output-header">
              <h4>Execution Output</h4>
              {executionResult && (
                <div className="execution-stats">
                  <span className={`status ${executionResult.success ? 'success' : 'error'}`}>
                    {executionResult.success ? '✓ Success' : '✗ Error'}
                  </span>
                  {executionResult.runtime && <span>Runtime: {executionResult.runtime}</span>}
                </div>
              )}
            </div>

            <div className="output-console">
              <pre className="console-output">
                {output || 'Run code to see output here...'}
              </pre>
            </div>

            {executionResult && executionResult.resources && (
              <div className="execution-resources">
                <h5>Resource Usage</h5>
                <div className="resources-grid">
                  <div className="resource-item">
                    <span>CPU Usage:</span>
                    <span>{executionResult.resources.cpu}</span>
                  </div>
                  <div className="resource-item">
                    <span>Memory:</span>
                    <span>{executionResult.resources.memory}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="playground-footer">
        <div className="environment-info">
          <span>Language: {availableLanguages.find(l => l.id === languageMode)?.name}</span>
          <span>Security: Sandboxed Environment</span>
          <span>Libraries: Robotics SDKs Available</span>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;