// src/components/dashboard/FoodEntryForm.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import { Loader2, Upload, Camera, X, Plus } from 'lucide-react';

// Add this utility function at the top of your file (outside the component)
const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localTime = new Date(now.getTime() - offset);
    return localTime.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
};

interface FoodEntryFormProps {
    onSuccess: () => void;
}

type InputMethod = 'manual' | 'image' | 'camera';

export default function FoodEntryForm({ onSuccess }: FoodEntryFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [inputMethod, setInputMethod] = useState<InputMethod>('manual');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentEntry, setCurrentEntry] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

    const [formData, setFormData] = useState({
        foodName: '',
        calories: '',
        proteins: '',
        carbs: '',
        fats: '',
        timestamp: getLocalISOString(),
    });

    // Clean up camera stream when component unmounts
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            foodName: '',
            calories: '',
            proteins: '',
            carbs: '',
            fats: '',
            timestamp: getLocalISOString(),
        });
        setImagePreview(null);
        setError('');
        setSuccess('');
        setCurrentEntry(null);
    };

    // Helper function to compress images
    const compressImage = (dataUrl: string, fileType: string, callback: (result: string) => void) => {
        const img = new Image();
        img.onload = () => {
            // Create a canvas to draw the resized image
            const canvas = document.createElement('canvas');

            // Set maximum dimensions while maintaining aspect ratio
            const maxDimension = 1200;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = (height / width) * maxDimension;
                    width = maxDimension;
                } else {
                    width = (width / height) * maxDimension;
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to data URL with reduced quality for JPEGs
                const mimeType = fileType || 'image/jpeg';
                const quality = mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 0.8 : 0.9;
                const compressedDataUrl = canvas.toDataURL(mimeType, quality);

                callback(compressedDataUrl);
            } else {
                // Fallback if canvas context fails
                callback(dataUrl);
            }
        };

        img.onerror = () => {
            // If there's an error, use the original data URL
            callback(dataUrl);
        };

        img.src = dataUrl;
    };

    const handleInputMethodChange = (method: InputMethod) => {
        // Stop camera if active and switching away
        if (inputMethod === 'camera' && method !== 'camera' && cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }

        setInputMethod(method);
        setImagePreview(null);

        if (method === 'camera') {
            startCamera();
        }
    };

    // Updated startCamera function with camera facing parameter
    const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Stop any existing camera stream first
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                }

                // Different constraints for mobile vs desktop
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                const constraints = {
                    video: isMobile
                        ? {
                            facingMode: { exact: facing } // Use specified camera on mobile
                        }
                        : true // Use default camera on desktop
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                setCameraStream(stream);
                setCameraFacing(facing);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } else {
                throw new Error('Camera not supported in this browser');
            }
        } catch (err) {
            console.error('Error accessing camera:', err);

            // If exact facingMode fails, try without 'exact' constraint
            if (err instanceof Error && /facingMode/.test(err.message)) {
                try {
                    const fallbackConstraints = {
                        video: { facingMode: facing } // Try without 'exact'
                    };

                    const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                    setCameraStream(stream);
                    setCameraFacing(facing);

                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    return;
                } catch (fallbackErr) {
                    // If that also fails, try any camera
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        setCameraStream(stream);

                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                        }
                        return;
                    } catch (anyErr) {
                        console.error('All camera attempts failed:', anyErr);
                    }
                }
            }

            setError('Could not access camera. Please check permissions and try again.');
            setInputMethod('manual');
        }
    };

    const toggleCamera = () => {
        const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
        startCamera(newFacing);
    };


    const captureImage = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas dimensions to match video but ensure reasonable size for API processing
        const maxDimension = 1200; // Max width or height to avoid huge images
        let width = video.videoWidth;
        let height = video.videoHeight;

        // Scale down if needed (maintain aspect ratio)
        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height = (height / width) * maxDimension;
                width = maxDimension;
            } else {
                width = (width / height) * maxDimension;
                height = maxDimension;
            }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the current video frame on canvas with proper scaling
        context.drawImage(video, 0, 0, width, height);

        try {
            // Convert canvas to data URL with appropriate quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use 80% JPEG quality
            setImagePreview(dataUrl);

            // Stop camera stream
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                setCameraStream(null);
            }

            // Analyze the captured image
            analyzeImage(dataUrl);
        } catch (error) {
            console.error('Error capturing image:', error);
            setError('Failed to capture image. Please try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size before processing
        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Image is too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        // Process the image to ensure it's suitable for analysis
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const dataUrl = event.target.result as string;

                // Compress the image if necessary
                compressImage(dataUrl, file.type, (compressedDataUrl) => {
                    setImagePreview(compressedDataUrl);
                    analyzeImage(compressedDataUrl);
                });
            }
        };
        reader.onerror = () => {
            setError('Failed to read the image file. Please try another image.');
        };
        reader.readAsDataURL(file);
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Validate file size
        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Image is too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const dataUrl = event.target.result as string;

                // Use the same compression function
                compressImage(dataUrl, file.type, (compressedDataUrl) => {
                    setImagePreview(compressedDataUrl);
                    analyzeImage(compressedDataUrl);
                });
            }
        };
        reader.onerror = () => {
            setError('Failed to read the image file. Please try another image.');
        };
        reader.readAsDataURL(file);
    };

    // Updated analyzeImage function
    const analyzeImage = async (imageData: string) => {
        // Clear previous data first
        setFormData({
            foodName: '',
            calories: '',
            proteins: '',
            carbs: '',
            fats: '',
            timestamp: getLocalISOString(),
        });

        setAnalyzing(true);
        setError('');

        try {
            // Log image data size for debugging (only the length, not the actual content)
            console.log(`Image data size: ${Math.round(imageData.length / 1024)} KB`);

            const response = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    userId: user?.id
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log("Analysis result:", result.data);

                // Generate a unique ID for this entry
                const entryId = Date.now().toString();
                setCurrentEntry(entryId);

                // Check if the food is unknown
                const isUnknownFood =
                    result.data.foodName.toLowerCase().includes("unknown") ||
                    !result.data.nutrition ||
                    result.data.nutrition.calories === 0;

                // Update form values with the analysis results
                setFormData({
                    foodName: result.data.foodName || '',
                    // Only set nutrition values if the food is not unknown
                    calories: !isUnknownFood ? result.data.nutrition?.calories?.toString() || '' : '',
                    proteins: !isUnknownFood ? result.data.nutrition?.proteins?.toString() || '' : '',
                    carbs: !isUnknownFood ? result.data.nutrition?.carbs?.toString() || '' : '',
                    fats: !isUnknownFood ? result.data.nutrition?.fats?.toString() || '' : '',
                    timestamp: getLocalISOString(),
                });

                // Use the cloudinary URL that was already uploaded
                if (result.data.imageUrl) {
                    setImagePreview(result.data.imageUrl);
                }

                // Show a notification if the food is unknown
                if (isUnknownFood) {
                    setError("Couldn't identify the food completely. Please fill in the nutrition details manually.");
                }
            } else {
                setError(result.error || 'Could not analyze the image. Please fill the details manually.');
            }
        } catch (err) {
            console.error('Error analyzing image:', err);
            setError('Error analyzing the image. Please try with a clearer photo or fill the details manually.');
        } finally {
            setAnalyzing(false);
        }
    };

    // Updated handleImageCancel function
    const handleImageCancel = () => {
        resetForm();

        // If camera was active, stop it
        if (inputMethod === 'camera' && cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Updated handleSubmit function with proper date handling
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!user?.id) {
            setError('You must be logged in to add food entries');
            setLoading(false);
            return;
        }

        try {
            // Create a proper Date object from the form timestamp
            const entryDate = new Date(formData.timestamp);

            // Only send the imageUrl, NOT the base64 data
            const response = await fetch('/api/food-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    foodName: formData.foodName,
                    calories: parseFloat(formData.calories) || 0,
                    proteins: parseFloat(formData.proteins) || 0,
                    carbs: parseFloat(formData.carbs) || 0,
                    fats: parseFloat(formData.fats) || 0,
                    imageUrl: imagePreview, // This should now always be the Cloudinary URL from analyze-food
                    timestamp: entryDate.toISOString(), // Send as ISO string
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess('Food entry added successfully!');
                resetForm(); // Reset everything after successful submission
                onSuccess();
            } else {
                setError(result.error || 'Failed to add food entry');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Food Entry</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    {success}
                </div>
            )}

            {/* Input method selector */}
            <div className="mb-6">
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                        type="button"
                        onClick={() => handleInputMethodChange('manual')}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${inputMethod === 'manual'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Manual Entry
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputMethodChange('image')}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${inputMethod === 'image'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Upload Image
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputMethodChange('camera')}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${inputMethod === 'camera'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Camera
                    </button>
                </div>
            </div>

            {/* Image upload area */}
            {inputMethod === 'image' && !imagePreview && (
                <div
                    className="mb-6 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
            )}

            {/* Camera view */}
            {inputMethod === 'camera' && !imagePreview && (
                <div className="mb-6 border border-gray-300 rounded-md overflow-hidden">
                    <div className="relative bg-black aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
                            <button
                                type="button"
                                onClick={toggleCamera}
                                className="bg-white rounded-full p-3 shadow-lg"
                                aria-label="Switch camera"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                    <path d="M16 3h5v5"></path>
                                    <path d="M8 21h-5v-5"></path>
                                    <path d="M21 3l-7 7"></path>
                                    <path d="M3 21l7-7"></path>
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={captureImage}
                                className="bg-white rounded-full p-3 shadow-lg"
                                aria-label="Take photo"
                            >
                                <Camera className="h-6 w-6 text-indigo-600" />
                            </button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}

            {/* Image preview */}
            {imagePreview && (
                <div className="mb-6 relative">
                    <img
                        src={imagePreview}
                        alt="Food preview"
                        className="w-full h-auto rounded-md max-h-60 object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleImageCancel}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>

                    {analyzing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                            <div className="text-center text-white">
                                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">Analyzing food...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="foodName" className="block text-sm font-medium text-gray-700">
                        Food Name
                    </label>
                    <input
                        type="text"
                        id="foodName"
                        name="foodName"
                        value={formData.foodName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
                            Calories
                        </label>
                        <input
                            type="number"
                            id="calories"
                            name="calories"
                            value={formData.calories}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.1"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="proteins" className="block text-sm font-medium text-gray-700">
                            Proteins (g)
                        </label>
                        <input
                            type="number"
                            id="proteins"
                            name="proteins"
                            value={formData.proteins}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.1"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                            Carbs (g)
                        </label>
                        <input
                            type="number"
                            id="carbs"
                            name="carbs"
                            value={formData.carbs}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.1"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="fats" className="block text-sm font-medium text-gray-700">
                            Fats (g)
                        </label>
                        <input
                            type="number"
                            id="fats"
                            name="fats"
                            value={formData.fats}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.1"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        id="timestamp"
                        name="timestamp"
                        value={formData.timestamp}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || analyzing}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Saving...
                        </>
                    ) : (
                        'Add Food Entry'
                    )}
                </button>
            </form>
        </div>
    );
}