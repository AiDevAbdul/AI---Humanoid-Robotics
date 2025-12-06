# Data Model: Physical AI & Humanoid Robotics Textbook

## Overview
This document defines the data structures for all entities in the Physical AI & Humanoid Robotics textbook platform, following constitutional principles for data management and privacy.

## Core Entities

### Student
**Description**: Individual learner with profile data including technical background, hardware access, learning progress, and achievement records

```json
{
  "id": "uuid",
  "email": "string (unique, indexed)",
  "username": "string (unique, indexed)",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "profile": {
    "first_name": "string",
    "last_name": "string",
    "technical_background": "enum (beginner, intermediate, advanced)",
    "hardware_access": "enum (none, basic, advanced)",
    "primary_language": "string (default: en)",
    "learning_preferences": ["string"],
    "career_goals": ["string"]
  },
  "preferences": {
    "ui_language": "string",
    "content_difficulty": "enum (adaptive, beginner, intermediate, advanced)",
    "notification_settings": {
      "email": "boolean",
      "progress_updates": "boolean"
    }
  },
  "auth_provider": "string",
  "last_login": "timestamp",
  "is_active": "boolean (default: true)"
}
```

### Chapter
**Description**: Educational content unit covering specific Physical AI topics with text, interactive elements, and assessments

```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string (unique, indexed)",
  "module": "enum (ros2, gazebo, nvidia_isaac, vla)",
  "order": "integer (indexed)",
  "prerequisites": ["uuid"], // other chapter IDs
  "content": {
    "text": "text",
    "html_content": "text (processed)",
    "translations": {
      "ur": "text",
      "other_lang": "text"
    }
  },
  "interactive_elements": [
    {
      "type": "enum (simulator, code_playground, 3d_viewer, quiz)",
      "config": "json",
      "difficulty_levels": {
        "beginner": "json",
        "intermediate": "json",
        "advanced": "json"
      }
    }
  ],
  "metadata": {
    "estimated_reading_time": "integer (minutes)",
    "learning_objectives": ["string"],
    "keywords": ["string"],
    "difficulty": "enum (beginner, intermediate, advanced)"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "is_published": "boolean (default: false)"
}
```

### Progress
**Description**: Record of student completion status, scores, and learning analytics for each chapter and module

```json
{
  "id": "uuid",
  "student_id": "uuid (foreign key to Student)",
  "chapter_id": "uuid (foreign key to Chapter)",
  "status": "enum (not_started, in_progress, completed)",
  "completion_percentage": "integer (0-100)",
  "time_spent": "integer (seconds)",
  "scores": {
    "quiz_score": "integer (0-100)",
    "practical_score": "integer (0-100)",
    "overall_score": "integer (0-100)"
  },
  "attempts": "integer (default: 1)",
  "last_accessed": "timestamp",
  "completed_at": "timestamp (nullable)",
  "personalized_path": "json", // tracks adaptive learning path
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Badge
**Description**: Achievement recognition awarded for completing milestones, mastering concepts, or demonstrating skills

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string (unique, indexed)",
  "description": "text",
  "icon": "string (URL)",
  "category": "enum (completion, skill, milestone, achievement)",
  "points_value": "integer (default: 10)",
  "criteria": {
    "type": "enum (chapter_completion, course_completion, quiz_score, time_based)",
    "requirement": "json"
  },
  "is_visible": "boolean (default: true)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### StudentBadge (Junction Table)
**Description**: Records badges earned by students

```json
{
  "id": "uuid",
  "student_id": "uuid (foreign key to Student)",
  "badge_id": "uuid (foreign key to Badge)",
  "earned_at": "timestamp",
  "evidence": "json (optional proof of achievement)",
  "created_at": "timestamp"
}
```

### Question
**Description**: Student inquiry submitted to the RAG chatbot with associated context and response history

```json
{
  "id": "uuid",
  "student_id": "uuid (foreign key to Student)",
  "chapter_id": "uuid (foreign key to Chapter, nullable)",
  "question_text": "text",
  "context": {
    "current_page": "string",
    "selected_text": "text (nullable)",
    "learning_path": "json"
  },
  "ai_response": {
    "response_text": "text",
    "source_chunks": ["uuid"], // references to textbook content
    "confidence_score": "float (0-1)",
    "timestamp": "timestamp"
  },
  "feedback": {
    "is_helpful": "boolean (nullable)",
    "rating": "integer (1-5, nullable)",
    "comments": "text (nullable)"
  },
  "session_id": "string (for conversation history)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### CourseModule
**Description**: Organizational unit grouping related chapters

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string (unique, indexed)",
  "description": "text",
  "order": "integer (indexed)",
  "learning_objectives": ["string"],
  "duration_estimate": "integer (hours)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Relationships

### Entity Relationships
- **Student** 1 ←→ * **Progress** (student has many progresses)
- **Student** 1 ←→ * **StudentBadge** (student can earn many badges)
- **Badge** 1 ←→ * **StudentBadge** (badge can be earned by many students)
- **Chapter** 1 ←→ * **Progress** (chapter can have many progresses)
- **Student** 1 ←→ * **Question** (student can ask many questions)
- **Chapter** 1 ←→ * **Question** (chapter can be referenced by many questions)
- **CourseModule** 1 ←→ * **Chapter** (module contains many chapters)

## Indexes and Performance Considerations

### Critical Indexes
- Student.email (unique)
- Student.username (unique)
- Chapter.slug (unique)
- Progress.student_id + Progress.chapter_id (composite unique)
- Question.student_id + Question.created_at (composite for history)
- Badge.slug (unique)

### Performance Optimizations
- Chapter.html_content should be indexed for search
- Progress status should be indexed for filtering
- Student last_login should be indexed for analytics
- Frequently accessed content should be cached

## Data Validation Rules

### Constraints
- Email format validation for Student.email
- Unique constraint on Progress for student_id + chapter_id combination
- Foreign key constraints to maintain referential integrity
- Check constraints on enum values
- Timestamps automatically managed by the system

### Privacy Considerations
- Personal data is stored separately from learning analytics
- Anonymized data used for system improvement
- Students can request data deletion
- Data retention policies applied automatically