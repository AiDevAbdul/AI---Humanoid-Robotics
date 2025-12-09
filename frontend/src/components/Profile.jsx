import React, { useState, useEffect } from 'react';

const Profile = ({ studentId, onSave }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    technicalBackground: 'beginner',
    experienceLevel: 'low',
    hardwareAccess: 'none',
    learningStyle: 'visual',
    interests: [],
    goals: '',
    preferredLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // In a real implementation, this would fetch the student profile from the backend
    // For now, we'll simulate with mock data
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock profile data
        const mockProfile = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          technicalBackground: 'intermediate',
          experienceLevel: 'medium',
          hardwareAccess: 'basic',
          learningStyle: 'visual',
          interests: ['robotics', 'machine learning'],
          goals: 'Learn advanced robotics concepts and build my own humanoid robot',
          preferredLanguage: 'en'
        };

        setProfile(mockProfile);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchProfile();
    }
  }, [studentId]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    const currentArray = profile[field] || [];
    if (currentArray.includes(value)) {
      // Remove if already exists
      setProfile(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== value)
      }));
    } else {
      // Add if doesn't exist
      setProfile(prev => ({
        ...prev,
        [field]: [...currentArray, value]
      }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setSaving(true);
    setSaved(false);

    try {
      // In a real implementation, this would save the profile to the backend
      // For now, we'll simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Call the onSave callback if provided
      if (onSave) {
        onSave(profile);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile loading">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2>Student Profile</h2>
        <p>Customize your learning experience</p>
      </div>

      <div className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
        </div>

        <div className="form-section">
          <h3>Learning Preferences</h3>

          <div className="form-group">
            <label htmlFor="technicalBackground">Technical Background</label>
            <select
              id="technicalBackground"
              value={profile.technicalBackground}
              onChange={(e) => handleInputChange('technicalBackground', e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experienceLevel">Programming Experience Level</label>
            <select
              id="experienceLevel"
              value={profile.experienceLevel}
              onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="learningStyle">Learning Style</label>
            <select
              id="learningStyle"
              value={profile.learningStyle}
              onChange={(e) => handleInputChange('learningStyle', e.target.value)}
            >
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading">Reading/Writing</option>
              <option value="kinesthetic">Kinesthetic</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="preferredLanguage">Preferred Language</label>
            <select
              id="preferredLanguage"
              value={profile.preferredLanguage}
              onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Hardware Access</h3>

          <div className="form-group">
            <label htmlFor="hardwareAccess">Hardware Access Level</label>
            <select
              id="hardwareAccess"
              value={profile.hardwareAccess}
              onChange={(e) => handleInputChange('hardwareAccess', e.target.value)}
            >
              <option value="none">No Hardware Access</option>
              <option value="basic">Basic Hardware (e.g., Arduino, Raspberry Pi)</option>
              <option value="intermediate">Intermediate Hardware (e.g., Robot kits)</option>
              <option value="advanced">Advanced Hardware (e.g., Real robots)</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Learning Goals & Interests</h3>

          <div className="form-group">
            <label htmlFor="interests">Areas of Interest</label>
            <div className="checkbox-group">
              {['robotics', 'machine learning', 'computer vision', 'control systems', 'humanoid robotics', 'kinematics'].map(interest => (
                <label key={interest} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.interests.includes(interest)}
                    onChange={() => handleArrayChange('interests', interest)}
                  />
                  <span className="checkbox-custom"></span>
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="goals">Learning Goals</label>
            <textarea
              id="goals"
              value={profile.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
              placeholder="What do you hope to achieve by learning Physical AI and Humanoid Robotics?"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          {saved && (
            <div className="save-success">
              Profile saved successfully!
            </div>
          )}
        </div>
      </div>

      <div className="profile-summary">
        <h3>Your Learning Profile</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <h4>Adaptation Level</h4>
            <p>
              Content will be adapted to your <strong>{profile.technicalBackground}</strong> level
              with <strong>{profile.experienceLevel}</strong> programming experience.
            </p>
          </div>

          <div className="summary-card">
            <h4>Learning Style</h4>
            <p>
              Content will be presented in a <strong>{profile.learningStyle}</strong> format
              with <strong>{profile.preferredLanguage}</strong> as your preferred language.
            </p>
          </div>

          <div className="summary-card">
            <h4>Hardware Context</h4>
            <p>
              Examples and exercises will be tailored to your <strong>{profile.hardwareAccess}</strong> access level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;