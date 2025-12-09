// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System (ROS 2)',
      items: [
        'module1/intro-ros2',
        'module1/ros2-nodes-topics-services',
        'module1/rclpy-bridge',
        'module1/urdf-for-humanoids',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin (Gazebo & Unity)',
      items: [
        'module2/intro-simulation',
        'module2/gazebo-physics',
        'module2/unity-humanoid',
        'module2/sensor-simulation',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: The AI-Robot Brain (NVIDIA Isaac™)',
      items: [
        'module3/intro-isaac',
        'module3/isaac-sim',
        'module3/isaac-ros',
        'module3/nav2-path-planning',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: [
        'module4/intro-vla',
        'module4/voice-to-action',
        'module4/cognitive-planning',
        'module4/capstone-project',
      ],
    },
    {
      type: 'category',
      label: 'Appendices',
      items: [
        'appendices/hardware-requirements',
        'appendices/setup-guide',
        'appendices/troubleshooting',
      ],
    },
  ],
};

module.exports = sidebars;