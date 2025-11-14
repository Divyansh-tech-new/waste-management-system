import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CameraFeedImage = () => {
  const [cameraFeed, setCameraFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCameraFeed = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/camera-feed/latest');
        if (response.data.success) {
          setCameraFeed(response.data.data);
        } else {
          setCameraFeed(null);
        }
      } catch (err) {
        console.error('Error fetching camera feed:', err);
        setError('Failed to load camera feed');
        setCameraFeed(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCameraFeed();
    const interval = setInterval(fetchCameraFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-[450px] h-80 bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A8D5A2]"></div>
      </div>
    );
  }

  if (cameraFeed && cameraFeed.imageUrl) {
    return (
      <img
        src={cameraFeed.imageUrl}
        alt="Live camera feed"
        className="w-[450px] h-80 object-cover rounded-xl shadow-md"
      />
    );
  }

  return (
    <img
      src="/download.webp"
      alt="Camera feed unavailable"
      className="w-[450px] h-80 object-cover rounded-xl shadow-md opacity-60"
    />
  );
};

export default CameraFeedImage;
