// src/app/water-tracker/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import {
    Loader2,
    Droplet,
    Plus,
    ArrowLeft,
    Settings,
    Camera,
    Upload,
    X,
    Trash2,
    Check,
    AlertTriangle,
    Save,
    ChevronLeft,
    RotateCcw,
    Minus,
    ChevronRight,
    Thermometer,
    MapPin,
    Calendar,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface WaterIntakeEntry {
    _id: string;
    amount: number;
    method: 'manual' | 'image' | 'camera';
    timestamp: string;
    imageUrl?: string;
}

interface WaterIntakeData {
    entries: WaterIntakeEntry[];
    totalIntake: number;
    waterIntakeGoal: number;
    recommendedIntake: number;
    progress: number;
    unit: string;
    weight: number | null;
}

interface VolumeEstimation {
    containerType: string;
    fullnessLevel: string;
    estimatedVolume: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    reasoning: string;
    climateAdjustmentFactor?: number;
    climateReasoning?: string;
    adjustedRecommendation?: number;
    baseRecommendation?: number;
    imageUrl?: string;
}

export default function WaterTracker() {
    const { user } = useAuth();
    const [waterData, setWaterData] = useState<WaterIntakeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGoalSettings, setShowGoalSettings] = useState(false);
    const [newGoal, setNewGoal] = useState<number>(2000);
    const [addAmount, setAddAmount] = useState<number>(250);
    const [activeView, setActiveView] = useState<'main' | 'camera' | 'upload' | 'estimate'>('main');
    const [image, setImage] = useState<string | null>(null);
    const [estimating, setEstimating] = useState(false);
    const [estimation, setEstimation] = useState<VolumeEstimation | null>(null);
    const [saving, setSaving] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Common cup sizes in ml
    const commonSizes = [100, 250, 350, 500];
    type ViewType = 'main' | 'camera' | 'upload' | 'estimate';

    // Fetch water intake data
    const fetchWaterData = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/water-intake');

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setWaterData(data.data);
                setNewGoal(data.data.waterIntakeGoal);
            } else {
                throw new Error(data.error || 'Failed to fetch water intake data');
            }
        } catch (err) {
            console.error("Error fetching water intake data:", err);
            setError(err instanceof Error ? err.message : "Failed to load water intake data");
        } finally {
            setLoading(false);
        }
    };

    // Add water intake
    const addWaterIntake = async (amount: number, method: 'manual' | 'image' | 'camera' = 'manual', uploadedImage: string | null = null) => {
        try {
            setSaving(true);

            const response = await fetch('/api/water-intake', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    method,
                    image: uploadedImage
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Reset the image and estimation states
                setImage(null);
                setEstimation(null);
                // Go back to the main view
                setActiveView('main');
                // Fetch updated data
                fetchWaterData();
            } else {
                throw new Error(data.error || 'Failed to add water intake');
            }
        } catch (err) {
            console.error("Error adding water intake:", err);
            setError(err instanceof Error ? err.message : "Failed to add water intake");
        } finally {
            setSaving(false);
        }
    };

    // Update water intake goal
    const updateWaterGoal = async () => {
        try {
            const response = await fetch('/api/water-intake', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ waterIntakeGoal: newGoal }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                fetchWaterData();
                setShowGoalSettings(false);
            } else {
                throw new Error(data.error || 'Failed to update water intake goal');
            }
        } catch (err) {
            console.error("Error updating water goal:", err);
            setError(err instanceof Error ? err.message : "Failed to update water intake goal");
        }
    };

    // Delete water intake entry
    const deleteWaterIntake = async (entryId: string) => {
        try {
            const response = await fetch(`/api/water-intake?id=${entryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                fetchWaterData();
            } else {
                throw new Error(data.error || 'Failed to delete water intake entry');
            }
        } catch (err) {
            console.error("Error deleting water intake:", err);
            setError(err instanceof Error ? err.message : "Failed to delete water intake entry");
        }
    };

    // Start camera
    const startCamera = async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                setCameraStream(stream);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                setActiveView('camera');
            } else {
                setError('Camera not supported on your device or browser');
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(err instanceof Error ? err.message : "Failed to access camera");
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Capture image from camera
    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                const imageDataUrl = canvas.toDataURL('image/jpeg');
                setImage(imageDataUrl);
                stopCamera();
                estimateWaterVolume(imageDataUrl);
            }
        }
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result as string;
                setImage(result);
                estimateWaterVolume(result);
            };

            reader.readAsDataURL(file);
        }
    };

    // Trigger file input click
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Estimate water volume from image
    const estimateWaterVolume = async (imageData: string) => {
        try {
            setEstimating(true);
            setActiveView('estimate');

            const response = await fetch('/api/water-intake/estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setEstimation(data.data);
                setAddAmount(data.data.estimatedVolume);
            } else {
                throw new Error(data.error || 'Failed to estimate water volume');
            }
        } catch (err) {
            console.error("Error estimating water volume:", err);
            setError(err instanceof Error ? err.message : "Failed to estimate water volume");
            setActiveView('main');
        } finally {
            setEstimating(false);
        }
    };

    // Reset everything
    const resetAll = () => {
        setImage(null);
        setEstimation(null);
        stopCamera();
        setActiveView('main');
    };

    // Format a timestamp for display
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Initial data fetch
    useEffect(() => {
        if (user?.id) {
            fetchWaterData();
        }

        // Cleanup camera when component unmounts
        return () => {
            stopCamera();
        };
    }, [user?.id]);

    // Handle view changes
    useEffect(() => {
        if (activeView === 'camera') {
            startCamera();
        } else if (activeView !== 'main' && cameraStream) {
            stopCamera();
        }
    }, [activeView]);

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#8BAA7C]" />
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (loading && !waterData) {
        return (
            <div className="min-h-screen bg-[#FEFEFF] p-4 sm:p-6 md:p-8 font-DM_Sans">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <Droplet className="h-12 w-12 text-sky-500 mx-auto mb-4 animate-pulse" />
                            <h2 className="text-xl font-bold text-[#010100] mb-2">Loading Water Tracker</h2>
                            <p className="text-gray-600">Please wait while we fetch your hydration data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FEFEFF] p-4 sm:p-6 md:p-8 font-DM_Sans">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-[#010100]">Water Tracker</h1>
                    <button
                        onClick={() => setShowGoalSettings(!showGoalSettings)}
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto -mt-1 -mr-1 p-1.5 rounded-full text-red-500 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {activeView === 'main' && waterData && (
                        <motion.div
                            key="main-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Goal Settings */}
                            <AnimatePresence>
                                {showGoalSettings && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 bg-sky-50 p-4 rounded-lg border border-sky-100"
                                    >
                                        <h3 className="text-sm font-semibold text-sky-900 mb-3">Set Daily Water Goal</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-full">
                                                <input
                                                    type="number"
                                                    min="500"
                                                    max="5000"
                                                    step="100"
                                                    value={newGoal}
                                                    onChange={(e) => setNewGoal(parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-gray-500">
                                                    ml
                                                </div>
                                            </div>
                                            <button
                                                onClick={updateWaterGoal}
                                                className="px-4 py-2 bg-[#FC842D] text-white rounded-lg font-medium hover:bg-[#FC842D]/90 focus:outline-none focus:ring-2 focus:ring-[#FC842D] focus:ring-offset-2 transition-colors"
                                            >
                                                Save
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="text-xs text-sky-700">
                                                Recommended for you: {waterData.recommendedIntake} ml
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setNewGoal(waterData.recommendedIntake);
                                                }}
                                                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                                            >
                                                Use Recommended
                                            </button>
                                        </div>

                                        {/* Climate adjustment info */}
                                        {user?.country && (
                                            <div className="mt-3 pt-3 border-t border-sky-200">
                                                <div className="flex items-center text-xs text-sky-700">
                                                    <MapPin className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                                                    <span className="font-medium">{user.country}{user.state ? `, ${user.state}` : ''}</span>
                                                    <span className="mx-2">•</span>
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                                                    <span>{new Date().toLocaleString('default', { month: 'long' })}</span>
                                                    <span className="mx-2">•</span>
                                                    <Activity className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                                                    <span className="capitalize">{user.activityLevel || 'Moderate'} activity</span>
                                                </div>

                                                <div className="mt-2 flex items-center bg-blue-100 p-2 rounded-md">
                                                    <Thermometer className="h-4 w-4 text-blue-500 mr-2" />
                                                    <div className="text-xs">
                                                        <span className="text-blue-800">Your location and current season affect water needs.</span>
                                                        <span className="text-blue-600 ml-1">Water recommendations are adjusted automatically when you use the camera/upload feature.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs text-sky-700 mt-2">
                                            Based on your weight ({waterData.weight ? `${waterData.weight} kg` : 'Not specified'})
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress section */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-base font-semibold text-[#010100]">
                                        Today's Progress
                                    </span>
                                    <span className="font-bold text-lg flex items-baseline">
                                        <span className="text-sky-600">{waterData.totalIntake}</span>
                                        <span className="text-gray-400 text-sm ml-1">/ {waterData.waterIntakeGoal} ml</span>
                                    </span>
                                </div>

                                <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${waterData.progress}%` }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
                                    ></motion.div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-medium text-white drop-shadow-md">
                                            {waterData.progress}%
                                        </span>
                                    </div>
                                </div>

                                {/* New climate adjustment indicator */}
                                {user?.country && (
                                    <div className="mt-2 flex items-center text-xs text-gray-600">
                                        <Thermometer className="h-3.5 w-3.5 text-blue-500 mr-1" />
                                        <span>Based on your location and the current season</span>
                                        <button
                                            className="ml-auto text-blue-600 hover:text-blue-800"
                                            onClick={() => setShowGoalSettings(true)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons section */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-[#010100] mb-4">Add Water Intake</h2>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <button
                                        onClick={() => setActiveView('camera')}
                                        className="py-4 px-4 border-2 border-[#ABD483]/30 rounded-xl bg-white hover:bg-[#ABD483]/10 transition-colors text-center flex flex-col items-center"
                                    >
                                        <Camera className="h-8 w-8 text-[#8BAA7C] mb-2" />
                                        <span className="font-medium text-[#010100]">Use Camera</span>
                                        <span className="text-xs text-gray-500 mt-1">Scan your glass</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveView('upload')}
                                        className="py-4 px-4 border-2 border-[#ABD483]/30 rounded-xl bg-white hover:bg-[#ABD483]/10 transition-colors text-center flex flex-col items-center"
                                    >
                                        <Upload className="h-8 w-8 text-[#8BAA7C] mb-2" />
                                        <span className="font-medium text-[#010100]">Upload Photo</span>
                                        <span className="text-xs text-gray-500 mt-1">From your gallery</span>
                                    </button>
                                </div>

                                <div className="border-t border-b border-gray-100 py-4 my-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Add</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {commonSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => addWaterIntake(size)}
                                                className="px-1 py-3 border border-[#ABD483]/30 rounded-lg hover:bg-[#ABD483]/10 transition-colors flex flex-col items-center text-center"
                                            >
                                                <Droplet className={`h-5 w-5 mb-1 text-sky-500`} />
                                                <span className="text-sm font-medium text-[#010100]">{size} ml</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            min="10"
                                            max="2000"
                                            step="10"
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:border-transparent"
                                            placeholder="Custom amount"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-gray-500">
                                            ml
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addWaterIntake(addAmount)}
                                        className="px-5 py-3 bg-[#FC842D] text-white rounded-lg font-medium hover:bg-[#FC842D]/90 focus:outline-none focus:ring-2 focus:ring-[#FC842D] focus:ring-offset-2 transition-colors flex items-center"
                                    >
                                        <Plus className="h-5 w-5 mr-1" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Water log section */}
                            {waterData.entries.length > 0 ? (
                                <div>
                                    <h2 className="text-lg font-bold text-[#010100] mb-4 flex items-center">
                                        <Droplet className="h-5 w-5 mr-2 text-sky-500" />
                                        Today's Water Log
                                    </h2>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                        {waterData.entries.map((entry) => (
                                            <div
                                                key={entry._id}
                                                className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mr-4 flex-shrink-0">
                                                    {entry.method === 'manual' ? (
                                                        <Droplet className="h-6 w-6 text-sky-500" />
                                                    ) : (
                                                        <Camera className="h-6 w-6 text-sky-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-[#010100]">
                                                        {entry.amount} ml
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center">
                                                        {formatTimestamp(entry.timestamp)}
                                                        {entry.method !== 'manual' && (
                                                            <span className="ml-2 px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px]">
                                                                Scanned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {entry.imageUrl && (
                                                    <div className="mx-3 h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <Image
                                                            src={entry.imageUrl}
                                                            alt="Water"
                                                            width={48}
                                                            height={48}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => deleteWaterIntake(entry._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                                                    aria-label="Delete entry"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                    <Droplet className="h-10 w-10 mx-auto text-sky-500 mb-3" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Water Logged Today</h3>
                                    <p className="text-sm text-gray-500 mb-4">Start tracking your hydration by adding water intake</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeView === 'camera' && (
                        <motion.div
                            key="camera-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[80vh] flex flex-col"
                        >
                            <div className="mb-4 flex items-center">
                                <button
                                    onClick={resetAll}
                                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <h2 className="text-lg font-bold text-center flex-1">Take a Photo of Your Water</h2>
                            </div>

                            <div className="relative flex-1 bg-black rounded-xl overflow-hidden mb-4">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="absolute inset-0 h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 pointer-events-none border-2 border-white/50 rounded-xl"></div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                    <p className="text-white/90 text-sm">
                                        Position the glass in the center of the frame for best results
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={captureImage}
                                    className="w-16 h-16 rounded-full bg-white border-4 border-[#8BAA7C] flex items-center justify-center"
                                    aria-label="Take photo"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#8BAA7C]"></div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'upload' && (
                        <motion.div
                            key="upload-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="mb-4 flex items-center">
                                <button
                                    onClick={resetAll}
                                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <h2 className="text-lg font-bold text-center flex-1">Upload a Photo of Your Water</h2>
                            </div>

                            <div
                                onClick={triggerFileInput}
                                className="border-2 border-dashed border-[#ABD483]/30 rounded-xl h-[60vh] flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-[#ABD483]/10 transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Upload className="h-16 w-16 text-[#8BAA7C] mb-4" />
                                <h3 className="text-lg font-medium text-[#010100] mb-2">Upload an Image</h3>
                                <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
                                    Take a clear photo of your water container to estimate the volume
                                </p>
                                <button className="px-6 py-3 bg-[#FC842D] text-white rounded-lg font-medium">
                                    Choose Image
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'estimate' && (
                        <motion.div
                            key="estimate-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pb-10"
                        >
                            <div className="mb-4 flex items-center">
                                <button
                                    onClick={resetAll}
                                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <h2 className="text-lg font-bold text-center flex-1">Water Volume Estimation</h2>
                            </div>

                            {estimating ? (
                                <div className="flex flex-col items-center justify-center h-[60vh]">
                                    <Loader2 className="h-12 w-12 text-[#8BAA7C] animate-spin mb-4" />
                                    <h3 className="text-lg font-medium text-[#010100] mb-2">Analyzing image...</h3>
                                    <p className="text-sm text-gray-500 max-w-xs text-center">
                                        Our AI is scanning your image to estimate the water volume
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {image && (
                                        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
                                            <Image
                                                src={image}
                                                alt="Water container"
                                                width={600}
                                                height={400}
                                                className="w-full h-auto object-contain"
                                            />
                                        </div>
                                    )}

                                    {estimation && (
                                        <div className="mb-6 space-y-4">
                                            <div className="bg-[#ABD483]/10 border border-[#ABD483]/20 rounded-lg p-4">
                                                <div className="flex items-start mb-3">
                                                    <div className="p-1.5 bg-sky-100 rounded-md mr-3">
                                                        <Droplet className="h-5 w-5 text-sky-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-[#010100]">
                                                            Detected: {estimation.containerType}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {estimation.fullnessLevel}
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto bg-sky-100 px-2 py-1 rounded text-xs font-medium text-sky-800">
                                                        {estimation.confidenceLevel.toUpperCase()} CONFIDENCE
                                                    </div>
                                                </div>

                                                <div className="pl-10 text-sm text-gray-600">
                                                    <p>{estimation.reasoning}</p>
                                                </div>
                                            </div>

                                            {/* Climate adjustment info - NEW SECTION */}
                                            {estimation.climateAdjustmentFactor && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start mb-3">
                                                        <div className="p-1.5 bg-blue-100 rounded-md mr-3">
                                                            <Thermometer className="h-5 w-5 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-[#010100]">
                                                                Climate-Adjusted Recommendation
                                                            </h3>
                                                            <div className="flex items-center mt-1">
                                                                <div className="text-sm text-gray-600 flex-1">
                                                                    <span className="font-medium text-blue-700">
                                                                        {estimation.baseRecommendation} ml
                                                                    </span>
                                                                    <ChevronRight className="inline h-4 w-4 mx-1 text-gray-400" />
                                                                    <span className="font-bold text-blue-800">
                                                                        {estimation.adjustedRecommendation} ml
                                                                    </span>
                                                                    <span className="text-xs ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                        {estimation.climateAdjustmentFactor > 1
                                                                            ? `+${Math.round((estimation.climateAdjustmentFactor - 1) * 100)}%`
                                                                            : `${Math.round((estimation.climateAdjustmentFactor - 1) * 100)}%`}
                                                                    </span>
                                                                </div>
                                                                <MapPin className="h-4 w-4 text-blue-500 mr-1" />
                                                                <span className="text-xs text-blue-700">
                                                                    {user?.country || 'Location'} • {new Date().toLocaleString('default', { month: 'long' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {estimation.climateReasoning && (
                                                        <div className="pl-10 text-sm text-gray-600">
                                                            <p>{estimation.climateReasoning}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="bg-white border border-[#ABD483]/20 rounded-lg p-4">
                                                <h3 className="font-medium text-[#010100] mb-3">
                                                    Estimated Volume
                                                </h3>

                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-3xl font-bold text-sky-600">
                                                        {addAmount} ml
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setAddAmount(Math.max(10, addAmount - 50))}
                                                            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg"
                                                            aria-label="Decrease volume"
                                                        >
                                                            <Minus className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setAddAmount(addAmount + 50)}
                                                            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg"
                                                            aria-label="Increase volume"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="2000"
                                                        step="10"
                                                        value={addAmount}
                                                        onChange={(e) => setAddAmount(parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={resetAll}
                                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
                                        >
                                            Retake
                                        </button>
                                        <button
                                            onClick={() => addWaterIntake(addAmount, image ? 'image' : 'camera', image)}
                                            disabled={saving || addAmount <= 0}
                                            className="flex-1 px-4 py-3 bg-[#FC842D] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 mr-2" />
                                                    <span>Save {addAmount} ml</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}