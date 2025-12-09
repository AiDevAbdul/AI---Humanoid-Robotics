import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Physical AI & Humanoid Robotics Textbook',
      items: [
        'index',
        {
          type: 'category',
          label: 'Module 1: The Robotic Nervous System',
          items: [
            'intro-ros2',
            'control-systems',
            'advanced-control',
            'kinematics-dynamics',
          ],
        },
        {
          type: 'category',
          label: 'Module 2: Perception and Sensing',
          items: [
            'computer-vision',
            // Additional chapters will be added as they are created
          ],
        },
        {
          type: 'category',
          label: 'Module 3: Decision Making and AI',
          items: [
            'machine-learning',
            // Additional chapters will be added as they are created
          ],
        },
        {
          type: 'category',
          label: 'Module 4: Physical Implementation',
          items: [
            'humanoid-robotics',
            // Additional chapters will be added as they are created
          ],
        },
        {
          type: 'category',
          label: 'Module 5: Advanced Topics',
          items: [
            // Additional chapters will be added as they are created
            // For now, we'll include an introductory document
            'intro',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
