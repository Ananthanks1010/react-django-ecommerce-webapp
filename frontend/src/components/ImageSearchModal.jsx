import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ImageSearchModal = () => {
  const [file, setFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.error('Error playing video:', err));
    }
  }, [showCamera, stream]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImage = () => {
    if (!file) return alert('Please select an image first.');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];

      try {
        setIsUploading(true);
        const response = await axios.post('${import.meta.env.VITE_API_URL}/imagerecog/imagesearch/', {
          image_data: base64String,
        });

        if (response.data && response.data.product_ids) {
          console.log('Upload successful. Product IDs:', response.data.product_ids);
          navigate('/list', { state: { productIds: response.data.product_ids } });
        } else {
          console.warn('Unexpected response:', response);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      setCapturedImage(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
  };

  const uploadCapturedImage = async () => {
    if (!capturedImage) return;

    const base64String = capturedImage.split(',')[1];

    try {
      setIsUploading(true);
      const response = await axios.post('${import.meta.env.VITE_API_URL}/imagerecog/imagesearch/', {
        image_data: base64String,
      });

      if (response.data && response.data.product_ids) {
        console.log('Capture upload successful. Product IDs:', response.data.product_ids);
        closeCamera();
        navigate('/list', { state: { productIds: response.data.product_ids } });
      } else {
        console.warn('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Capture upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  const closeModal = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className='w-screen h-screen flex flex-col gap-6 items-center justify-center relative'>
      {isUploading && <div className="fixed top-0 left-0 w-full p-4 text-center bg-yellow-500 text-white z-50">Uploading image...</div>}

      {/* Close Button */}
      <button onClick={closeModal} className="absolute top-4 right-4 btn btn-sm btn-error z-50">
        Close
      </button>

      {/* File Upload Section */}
      <div className="flex flex-col md:gap-2">
        <input
          type="file"
          className="file-input file-input-secondary text-white"
          onChange={handleFileChange}
        />
        <button onClick={uploadImage} className="btn btn-primary mt-2">
          Upload Image
        </button>
      </div>

      {/* Camera Section */}
      <div className="flex flex-col items-center gap-2">
        <button onClick={openCamera} className="btn btn-primary">
          Open Camera
        </button>

        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 gap-4 p-4">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="rounded-lg shadow-lg max-w-md w-full h-auto"
                />
                <div className="flex gap-4">
                  <button onClick={captureImage} className="btn btn-accent">
                    Capture
                  </button>
                  <button onClick={closeCamera} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <img src={capturedImage} alt="Captured preview" className="rounded-lg max-w-md w-full shadow-lg" />
                <div className="flex gap-4">
                  <button onClick={uploadCapturedImage} className="btn btn-success">
                    Upload
                  </button>
                  <button onClick={closeCamera} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSearchModal;
