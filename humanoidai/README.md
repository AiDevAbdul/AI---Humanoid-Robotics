# Physical AI & Humanoid Robotics Textbook

This is an interactive textbook for learning Physical AI and Humanoid Robotics with AI-powered features for personalization, multilingual support, and gamification.

## Project Structure

- `docs/` - Contains all textbook content in Markdown format
  - Core textbook chapters covering Physical AI and Humanoid Robotics
  - Urdu translations for multilingual support
- `src/` - Custom React components for interactive features
- `docusaurus.config.ts` - Site configuration
- `sidebars.ts` - Navigation structure

## Content Organization

The textbook is organized into 5 modules:
1. The Robotic Nervous System (ROS 2, Control Systems, Kinematics)
2. Perception and Sensing (Computer Vision, Sensor Fusion)
3. Decision Making and AI (Machine Learning, Path Planning)
4. Physical Implementation (Humanoid Robotics, Hardware)
5. Advanced Topics (Bipedal Locomotion, Multi-Robot Systems)

## Running the Project

Due to the special character (&) in the parent directory name, running the development server may encounter path parsing issues. To run the development server:

1. Navigate to the humanoidai directory
2. Use one of these approaches:
   - Use npm instead of yarn: `npm run start`
   - Use PowerShell: `npx docusaurus start` (in PowerShell)
   - Or temporarily rename the parent directory to remove special characters
   - Or use VS Code's integrated terminal which may handle paths differently

To build the static site:
```bash
npm run build
```

The built site will be in the `build` directory and can be served statically.

## Features

- Interactive textbook content with code examples
- AI-powered personalization based on student profile
- Multi-language support (English and Urdu)
- RAG-based chatbot for answering questions
- Progress tracking and gamification with badges
- Responsive design for all device sizes

## Deployment

This site is configured for GitHub Pages deployment to `https://panaversity.github.io/textbook-physical-ai/`
