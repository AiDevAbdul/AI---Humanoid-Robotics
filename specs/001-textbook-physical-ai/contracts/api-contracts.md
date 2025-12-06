# API Contracts: Physical AI & Humanoid Robotics Textbook

## Overview
This document defines the API contracts for the Physical AI & Humanoid Robotics textbook platform, including endpoints, request/response formats, and data schemas.

## Base Configuration

### Base URL
- **Development**: `http://localhost:8000`
- **Staging**: `https://staging.textbook-api.panaversity.org`
- **Production**: `https://api.textbook.panaversity.org`

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Content Type
All requests and responses use JSON format with the following headers:
```
Content-Type: application/json
Accept: application/json
```

## Authentication Endpoints

### POST /auth/register
Register a new student account with background information.

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (min 8 chars, required)",
  "username": "string (required, unique)",
  "background_info": {
    "technical_experience": "enum (beginner, intermediate, advanced)",
    "hardware_access": "enum (none, basic, advanced)",
    "primary_language": "string (default: en)",
    "career_goals": ["string"]
  }
}
```

**Response (201 Created):**
```json
{
  "access_token": "string",
  "token_type": "string (default: bearer)",
  "user": {
    "id": "uuid",
    "email": "string",
    "username": "string",
    "created_at": "timestamp"
  }
}
```

### POST /auth/login
Authenticate student and return access token.

**Request Body:**
```json
{
  "username": "string (or email)",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "access_token": "string",
  "token_type": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "username": "string"
  }
}
```

## User Profile Endpoints

### GET /users/me
Get current user's profile information.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "string",
  "username": "string",
  "profile": {
    "first_name": "string",
    "last_name": "string",
    "technical_background": "enum (beginner, intermediate, advanced)",
    "hardware_access": "enum (none, basic, advanced)",
    "primary_language": "string",
    "learning_preferences": ["string"],
    "career_goals": ["string"]
  },
  "preferences": {
    "ui_language": "string",
    "content_difficulty": "enum (adaptive, beginner, intermediate, advanced)"
  },
  "progress_stats": {
    "completed_chapters": "integer",
    "total_points": "integer",
    "current_streak": "integer"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### PUT /users/me
Update user profile information.

**Request Body:**
```json
{
  "profile": {
    "first_name": "string",
    "last_name": "string",
    "technical_background": "enum (beginner, intermediate, advanced)",
    "hardware_access": "enum (none, basic, advanced)",
    "primary_language": "string",
    "learning_preferences": ["string"]
  },
  "preferences": {
    "ui_language": "string",
    "content_difficulty": "enum (adaptive, beginner, intermediate, advanced)"
  }
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "string",
  "username": "string",
  "profile": "{updated profile object}",
  "preferences": "{updated preferences object}",
  "updated_at": "timestamp"
}
```

## Content Endpoints

### GET /chapters
List all available chapters with filtering and pagination.

**Query Parameters:**
- `module`: Filter by module (ros2, gazebo, nvidia_isaac, vla)
- `difficulty`: Filter by difficulty (beginner, intermediate, advanced)
- `search`: Search in title and content
- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Offset for pagination (default: 0)

**Response (200 OK):**
```json
{
  "chapters": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "module": "enum (ros2, gazebo, nvidia_isaac, vla)",
      "order": "integer",
      "difficulty": "enum (beginner, intermediate, advanced)",
      "estimated_reading_time": "integer (minutes)",
      "learning_objectives": ["string"],
      "prerequisites": ["uuid"],
      "is_locked": "boolean (based on prerequisites)",
      "progress": {
        "status": "enum (not_started, in_progress, completed)",
        "completion_percentage": "integer"
      }
    }
  ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```

### GET /chapters/{slug}
Get detailed information about a specific chapter.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "module": "enum (ros2, gazebo, nvidia_isaac, vla)",
  "order": "integer",
  "content": {
    "text": "string (markdown)",
    "html_content": "string (rendered HTML)",
    "translations": {
      "ur": "string (Urdu translation)",
      "other_lang": "string"
    }
  },
  "interactive_elements": [
    {
      "id": "string",
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
  "prerequisites": ["uuid"],
  "progress": {
    "status": "enum (not_started, in_progress, completed)",
    "completion_percentage": "integer",
    "time_spent": "integer (seconds)",
    "scores": {
      "quiz_score": "integer",
      "practical_score": "integer",
      "overall_score": "integer"
    }
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Progress Tracking Endpoints

### POST /progress/{chapter_id}
Update progress for a specific chapter.

**Request Body:**
```json
{
  "action": "enum (start, continue, complete)",
  "time_spent": "integer (seconds)",
  "completion_percentage": "integer (0-100)",
  "quiz_answers": [
    {
      "question_id": "uuid",
      "selected_option": "string",
      "is_correct": "boolean"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "chapter_id": "uuid",
  "status": "enum (not_started, in_progress, completed)",
  "completion_percentage": "integer",
  "time_spent": "integer (seconds)",
  "scores": {
    "quiz_score": "integer",
    "practical_score": "integer",
    "overall_score": "integer"
  },
  "updated_at": "timestamp"
}
```

### GET /progress
Get overall progress for the current user.

**Response (200 OK):**
```json
{
  "overall_completion": "integer (0-100)",
  "completed_chapters": "integer",
  "total_chapters": "integer",
  "total_points": "integer",
  "badges_earned": "integer",
  "current_streak": "integer (days)",
  "module_progress": [
    {
      "module": "enum (ros2, gazebo, nvidia_isaac, vla)",
      "completion_percentage": "integer",
      "completed_chapters": "integer"
    }
  ],
  "recent_activity": [
    {
      "type": "enum (chapter_completed, badge_earned, quiz_taken)",
      "description": "string",
      "timestamp": "timestamp",
      "chapter_title": "string (nullable)"
    }
  ]
}
```

## AI Services Endpoints

### POST /ai/chat
Ask questions to the RAG chatbot about textbook content.

**Request Body:**
```json
{
  "question": "string (required)",
  "context": {
    "current_chapter_id": "uuid (nullable)",
    "selected_text": "string (nullable)",
    "learning_path": "json (optional user context)"
  },
  "selected_text": "string (text the user highlighted, if any)"
}
```

**Response (200 OK):**
```json
{
  "question_id": "uuid",
  "question": "string",
  "answer": "string",
  "sources": [
    {
      "chapter_id": "uuid",
      "chapter_title": "string",
      "content_snippet": "string",
      "relevance_score": "float (0-1)"
    }
  ],
  "confidence_score": "float (0-1)",
  "timestamp": "timestamp"
}
```

### POST /ai/personalize-content
Get personalized content adaptation based on user profile.

**Request Body:**
```json
{
  "chapter_id": "uuid",
  "content_type": "enum (text, explanation, example, exercise)",
  "current_difficulty": "enum (beginner, intermediate, advanced)"
}
```

**Response (200 OK):**
```json
{
  "adapted_content": "string",
  "explanation_level": "string (detailed, moderate, concise)",
  "examples": [
    {
      "type": "enum (code, analogy, diagram_description)",
      "content": "string",
      "complexity_level": "enum (simplified, standard, advanced)"
    }
  ],
  "difficulty_adjustment": "enum (easier, same, harder)",
  "alternative_paths": [
    {
      "title": "string",
      "description": "string",
      "prerequisite_level": "enum (review_needed, adequate, advanced)"
    }
  ]
}
```

## Gamification Endpoints

### GET /gamification/badges
Get available and earned badges for the current user.

**Response (200 OK):**
```json
{
  "available_badges": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "description": "string",
      "icon": "string (URL)",
      "category": "enum (completion, skill, milestone, achievement)",
      "points_value": "integer",
      "criteria": {
        "type": "enum (chapter_completion, course_completion, quiz_score, time_based)",
        "requirement": "json"
      },
      "is_earned": "boolean",
      "earned_at": "timestamp (nullable)"
    }
  ],
  "total_points": "integer",
  "recent_achievements": [
    {
      "badge_name": "string",
      "earned_at": "timestamp",
      "points_earned": "integer"
    }
  ]
}
```

### GET /gamification/leaderboard
Get leaderboard information (if enabled).

**Query Parameters:**
- `period`: enum (weekly, monthly, all_time)
- `limit`: Number of users to return (default: 10)

**Response (200 OK):**
```json
{
  "leaderboard": [
    {
      "rank": "integer",
      "username": "string",
      "total_points": "integer",
      "completed_chapters": "integer",
      "current_streak": "integer"
    }
  ],
  "user_rank": {
    "rank": "integer (nullable)",
    "points": "integer",
    "progress": "integer (0-100)"
  }
}
```

## Translation Endpoints

### POST /translation/switch-language
Switch the language for content delivery.

**Request Body:**
```json
{
  "language_code": "string (e.g., ur, en, es)",
  "translate_content": "boolean (default: true)"
}
```

**Response (200 OK):**
```json
{
  "language_code": "string",
  "language_name": "string",
  "content_translated": "boolean",
  "message": "string"
}
```

## Error Response Format

All error responses follow this format:

**Response (4xx/5xx):**
```json
{
  "detail": "string (error message)",
  "error_code": "string (machine-readable error code)",
  "timestamp": "timestamp",
  "request_id": "string (for debugging)"
}
```

## Common Error Codes

- `AUTH_001`: Authentication required
- `AUTH_002`: Invalid credentials
- `AUTH_003`: Account not found
- `CONTENT_001`: Chapter not found
- `CONTENT_002`: Content not available in requested language
- `PROGRESS_001`: Invalid progress update
- `AI_001`: AI service temporarily unavailable
- `VALIDATION_001`: Invalid request parameters