import React, { useState } from 'react';
import PropTypes from 'prop-types';

const CareTips = ({ provider }) => {
  const [tips, setTips] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');

  const fetchTips = async () => {
    setLoading(true);
    setError('');
    setTips('');
    try {
      const response = await fetch('http://localhost:8000/api/ai/gemini-care-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_name: provider.name,
          specialty: provider.specialty,
          reason: provider.reason,
          question: customQuestion || undefined
        })
      });
      if (!response.ok) {
        let errorMsg = 'Failed to generate tips.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setTips(data.tips);
    } catch (err) {
      console.error('Error fetching care tips:', err);
      setError('Failed to generate tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="care-tips" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h3>AI Care Navigation Tips</h3>
      <div style={{ marginBottom: 12 }}>
        <textarea
          rows={3}
          placeholder="Ask a specific question about your visit (optional)"
          value={customQuestion}
          onChange={e => setCustomQuestion(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <button onClick={fetchTips} disabled={loading} style={{ padding: '10px 20px', borderRadius: 4, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
        {loading ? 'Generating...' : 'Get Care Tips'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {tips && (
        <div className="tips-box" style={{ background: '#f8f9fa', marginTop: 20, padding: 16, borderRadius: 8, border: '1px solid #e0e7ff' }}>
          <h4>Care Tips</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{tips}</p>
        </div>
      )}
    </div>
  );
};

CareTips.propTypes = {
  provider: PropTypes.shape({
    name: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
    reason: PropTypes.string
  }).isRequired
};

export default CareTips; 