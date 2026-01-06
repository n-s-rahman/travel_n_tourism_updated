import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { packageAPI } from '../services/packageAPI'; 
import AdminLayout from '../components/AdminLayout';

const PACKAGE_TYPES = [
    'adventure', 
    'luxury', 
    'relaxation', 
    'cultural', 
    'honeymoon', 
    'family',
    'friend',
];

const CreatePackagePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        description: '',
        price: '',
        duration: '',
        type: PACKAGE_TYPES[0],
        images: '',
        included: '', 
        excluded: '', 
        startDate: '',
        endDate: '',
        maxPeople: 20,
        isFeatured: false,
    });
    
    const [itinerary, setItinerary] = useState([
        { day: 1, title: '', description: '' }
    ]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // AI & Dynamic Features State
    const [generatingAI, setGeneratingAI] = useState(false);
    const [fetchingImages, setFetchingImages] = useState(false);
    const [fetchedImages, setFetchedImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    // 1. Auto End Date Calculation
    useEffect(() => {
        if (formData.startDate && formData.duration) {
            const start = new Date(formData.startDate);
            const duration = parseInt(formData.duration, 10);
            if (!isNaN(start.getTime()) && !isNaN(duration) && duration > 0) {
                const end = new Date(start);
                end.setDate(start.getDate() + duration - 1);
                const endDateStr = end.toISOString().split('T')[0];
                if (formData.endDate !== endDateStr) {
                    setFormData(prev => ({ ...prev, endDate: endDateStr }));
                }
            }
        }
    }, [formData.startDate, formData.duration]);

    // 2. AI Itinerary Generation
    const handleGenerateAI = async () => {
        if (!formData.destination || !formData.duration) {
            setError('Please enter destination and duration first.');
            return;
        }
        setGeneratingAI(true);
        setError(null);
        try {
            const result = await packageAPI.generateItinerary({
                destination: formData.destination,
                duration: parseInt(formData.duration),
                type: formData.type
            });
            setItinerary(result);
            setSuccess('AI Itinerary generated successfully!');
        } catch (err) {
            setError(err || 'Failed to generate itinerary with AI');
        } finally {
            setGeneratingAI(false);
        }
    };

    // 3. Dynamic Image Fetching
    const handleFetchImages = async () => {
        if (!formData.destination) {
            setError('Please enter a destination to fetch images.');
            return;
        }
        setFetchingImages(true);
        setError(null);
        try {
            const images = await packageAPI.searchImages(formData.destination);
            setFetchedImages(images);
            if (images.length > 0 && !formData.images) {
                const initial = images.slice(0, 3);
                setSelectedImages(initial);
                setFormData(prev => ({ ...prev, images: initial.join(', ') }));
            }
        } catch (err) {
            setError('Could not fetch images automatically.');
        } finally {
            setFetchingImages(false);
        }
    };

    const toggleImage = (url) => {
        const isSelected = selectedImages.includes(url);
        let updated;
        if (isSelected) {
            updated = selectedImages.filter(u => u !== url);
        } else {
            updated = [...selectedImages, url];
        }
        setSelectedImages(updated);
        setFormData(prev => ({ ...prev, images: updated.join(', ') }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleItineraryChange = (index, e) => {
        const { name, value } = e.target;
        const newItinerary = [...itinerary];
        newItinerary[index][name] = value;
        setItinerary(newItinerary);
    };

    const addItineraryDay = () => {
        setItinerary([...itinerary, { day: itinerary.length + 1, title: '', description: '' }]);
    };

    const removeItineraryDay = (index) => {
        const newItinerary = itinerary.filter((_, i) => i !== index).map((item, i) => ({
            ...item,
            day: i + 1
        }));
        setItinerary(newItinerary);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration, 10),
            maxPeople: parseInt(formData.maxPeople, 10),
            included: formData.included.split(',').map(h => h.trim()).filter(h => h.length > 0),
            excluded: formData.excluded.split(',').map(h => h.trim()).filter(h => h.length > 0),
            images: formData.images.split(',').map(img => img.trim()).filter(img => img.length > 0),
            itinerary: itinerary.filter(item => item.title && item.description),
        };

        if (isNaN(payload.price) || payload.price <= 0) {
            setError('Please enter a valid price.');
            setLoading(false);
            return;
        }

        if (!payload.startDate || !payload.endDate) {
            setError('Please select a valid duration and start date.');
            setLoading(false);
            return;
        }

        try {
            await packageAPI.createPackage(payload);
            setSuccess(`Package created successfully!`);
            setTimeout(() => navigate('/admin/dashboard'), 1500);
        } catch (err) {
            console.error("Submission Error:", err);
            const detailMsg = err.response?.data?.details || err.response?.data?.message || err.message || 'Failed to create package.';
            setError(detailMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            Craft Your Masterpiece
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Design an unforgettable journey with AI assistance</p>
                    </div>
                    <Link to="/admin/dashboard" className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">
                        Back to Dashboard
                    </Link>
                </div>

                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg animate-pulse">⚠️ {error}</div>}
                {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg animate-bounce">✅ {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                    {/* Section 1: Target & Type */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl">🌍</div>
                            <h2 className="text-2xl font-black text-gray-800">Destination Discovery</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Where to go?</label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Kyoto, Japan"
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-purple-600 rounded-2xl transition-all outline-none font-bold text-gray-800"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Package Title</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Catchy name like 'Kyoto Cherry Blossom Special'"
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-purple-600 rounded-2xl transition-all outline-none font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Package Summary / Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="3"
                                placeholder="Describe what makes this trip special, the key highlights, and the overall vibe..."
                                className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-purple-600 rounded-2xl transition-all outline-none font-bold text-gray-800"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Adventure Style</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-purple-600 rounded-2xl transition-all outline-none font-bold text-gray-800 appearance-none"
                                >
                                    {PACKAGE_TYPES.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Max Explorers</label>
                                <input
                                    type="number"
                                    name="maxPeople"
                                    value={formData.maxPeople}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-purple-600 rounded-2xl transition-all outline-none font-bold text-gray-800"
                                />
                            </div>
                            <div className="flex items-center pt-10">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isFeatured ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isFeatured ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 font-bold text-gray-700 group-hover:text-purple-600 transition">Feature this trip</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Section 2: Economics & Time */}
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50 h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-2xl">💳</div>
                                <h2 className="text-2xl font-black text-gray-800">Economics & Timing</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (USD)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 rounded-xl font-black text-xl text-green-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration (Days)</label>
                                        <input type="number" name="duration" value={formData.duration} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 rounded-xl font-black text-xl text-purple-600 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">When does it start?</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-800 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calculated End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} readOnly className="w-full px-6 py-4 bg-gray-100 rounded-2xl font-bold text-gray-400 outline-none cursor-not-allowed" />
                                    <p className="text-[10px] text-gray-400 italic">Automatically synced with duration</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Visual Identity */}
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50 h-full">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl">📸</div>
                                    <h2 className="text-2xl font-black text-gray-800">Visuals</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFetchImages}
                                    disabled={fetchingImages}
                                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-200 transition disabled:opacity-50"
                                >
                                    {fetchingImages ? '🤖 Searching...' : '✨ Magic Fetch'}
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {fetchedImages.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        {fetchedImages.map((url, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => toggleImage(url)}
                                                className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${selectedImages.includes(url) ? 'border-blue-500' : 'border-transparent opacity-60'}`}
                                            >
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-48 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                        <span className="text-4xl mb-2">🏔️</span>
                                        <p className="text-xs font-medium">Auto-fetch images by destination</p>
                                    </div>
                                )}
                                <textarea
                                    name="images"
                                    value={formData.images}
                                    onChange={handleChange}
                                    required
                                    placeholder="Click magic fetch or paste URLs here..."
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl font-mono text-[10px] text-gray-500 h-20 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: AI Powered Itinerary */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl">✨</div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800">AI-Powered Journey</h2>
                                    <p className="text-xs font-bold text-gray-400">Let Gemini design your itinerary</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={generatingAI}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl font-black shadow-lg hover:shadow-orange-200 transition transform hover:-translate-y-1 disabled:opacity-50"
                                >
                                    {generatingAI ? '🧠 Brainstorming...' : '🪄 Generate with AI'}
                                </button>
                                <button
                                    type="button"
                                    onClick={addItineraryDay}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition"
                                >
                                    + Manual Day
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {itinerary.map((item, index) => (
                                <div key={index} className="group relative p-8 bg-gray-50 rounded-[2.5rem] border-2 border-transparent hover:border-orange-200 transition-all flex gap-8">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-orange-500 shadow-md">
                                            {item.day}
                                        </div>
                                        <div className="w-1 h-full bg-orange-100 mt-4 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <input
                                                type="text"
                                                name="title"
                                                value={item.title}
                                                onChange={(e) => handleItineraryChange(index, e)}
                                                placeholder="What's the plan?"
                                                className="bg-transparent text-xl font-black text-gray-800 border-b-2 border-transparent focus:border-orange-400 outline-none w-full"
                                            />
                                            {itinerary.length > 1 && (
                                                <button type="button" onClick={() => removeItineraryDay(index)} className="text-red-300 hover:text-red-500 font-black opacity-0 group-hover:opacity-100 transition">✕</button>
                                            )}
                                        </div>
                                        <textarea
                                            name="description"
                                            value={item.description}
                                            onChange={(e) => handleItineraryChange(index, e)}
                                            placeholder="Tell us more about this day..."
                                            rows="3"
                                            className="bg-transparent w-full text-gray-600 font-medium leading-relaxed outline-none resize-none"
                                        />
                                        {item.image && (
                                            <div className="relative w-full h-40 rounded-2xl overflow-hidden mt-2 group/img">
                                                <img src={item.image} className="w-full h-full object-cover" alt={`Day ${item.day}`} />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <input 
                                                        type="text"
                                                        name="image"
                                                        value={item.image}
                                                        onChange={(e) => handleItineraryChange(index, e)}
                                                        className="bg-white/90 text-[10px] px-2 py-1 rounded w-3/4 outline-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 5: Inclusions */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-green-600 flex items-center gap-2">
                                    <span>✅</span> Inclusions
                                </h3>
                                <textarea
                                    name="included"
                                    value={formData.included}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-6 py-5 bg-green-50 rounded-3xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-green-200"
                                    placeholder="What's included? (e.g. WiFi, Meals, Guides)"
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-red-600 flex items-center gap-2">
                                    <span>❌</span> Exclusions
                                </h3>
                                <textarea
                                    name="excluded"
                                    value={formData.excluded}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-6 py-5 bg-red-50 rounded-3xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-red-200"
                                    placeholder="What's NOT included? (e.g. Flights, Tips)"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-2xl font-black rounded-[2rem] shadow-2xl transform transition hover:-translate-y-2 hover:shadow-indigo-200 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? '🚀 Launching Package...' : 'Publish Travel Experience'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreatePackagePage;
