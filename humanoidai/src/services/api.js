// API service to connect Docusaurus frontend to backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method to make authenticated API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Chapter-related methods
  async getChapters(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/v1/chapters?${params}`);
  }

  async getChapter(slug) {
    return this.request(`/api/v1/chapters/${slug}`);
  }

  // Progress tracking
  async getProgress(studentId) {
    return this.request(`/api/v1/progress/${studentId}`);
  }

  async updateProgress(studentId, chapterId, progressData) {
    return this.request(`/api/v1/progress/${studentId}/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  // AI features
  async getAiResponse(question, context = {}) {
    return this.request('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  }

  // Navigation and prerequisites
  async checkPrerequisites(chapterId) {
    return this.request(`/api/v1/navigation/check-prerequisites/${chapterId}`);
  }

  async getLearningPath(startChapterId = null) {
    const params = startChapterId ? `?start_chapter_id=${startChapterId}` : '';
    return this.request(`/api/v1/navigation/learning-path${params}`);
  }

  async getAvailableChapters() {
    return this.request('/api/v1/navigation/available-chapters');
  }

  // Spaced repetition
  async getReviewSchedule() {
    return this.request('/api/v1/spaced-repetition/schedule');
  }

  async updateReviewStatus(chapterId, quality) {
    return this.request('/api/v1/spaced-repetition/update', {
      method: 'POST',
      body: JSON.stringify({ chapter_id: chapterId, quality }),
    });
  }

  // Microlearning
  async getMicrolearningUnits(chapterId) {
    return this.request(`/api/v1/microlearning/${chapterId}/units`);
  }

  async updateMicrolearningProgress(unitId, action = 'complete') {
    return this.request('/api/v1/microlearning/update-progress', {
      method: 'POST',
      body: JSON.stringify({ unit_id: unitId, action }),
    });
  }

  // Translation
  async translateContent(content, targetLanguage) {
    return this.request('/api/v1/translation/translate', {
      method: 'POST',
      body: JSON.stringify({ content, target_language: targetLanguage }),
    });
  }
}

export default new ApiService();