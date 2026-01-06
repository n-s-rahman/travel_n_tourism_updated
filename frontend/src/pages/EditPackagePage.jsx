import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const EditPackagePage = () => {
    const { id } = useParams(); 
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
        available: true,
    });
    
    const [itinerary, setItinerary] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchPackage = async () => {
            setLoading(true);
            setError(null);
            try {
                const pkg = await packageAPI.getPackageById(id); 

                setFormData({
                    name: pkg.name || '',
                    destination: pkg.destination || '',
                    description: pkg.description || '',
                    price: pkg.price || '',
                    duration: pkg.duration || '',
                    type: pkg.type || PACKAGE_TYPES[0],
                    images: Array.isArray(pkg.images) ? pkg.images.join(', ') : '',
                    included: Array.isArray(pkg.included) ? pkg.included.join(', ') : '',
                    excluded: Array.isArray(pkg.excluded) ? pkg.excluded.join(', ') : '',
                    startDate: pkg.startDate ? new Date(pkg.startDate).toISOString().split('T')[0] : '',
                    endDate: pkg.endDate ? new Date(pkg.endDate).toISOString().split('T')[0] : '',
                    maxPeople: pkg.maxPeople || 20,
                    isFeatured: pkg.isFeatured || false,
                    available: pkg.available !== undefined ? pkg.available : true, 
                });

                if (pkg.itinerary && pkg.itinerary.length > 0) {
                    setItinerary(pkg.itinerary);
                } else {
                    setItinerary([{ day: 1, title: '', description: '' }]);
                }
            } catch (err) {
                console.error("Error fetching package:", err);
                setError(`Failed to load package details.`);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPackage();
        }
    }, [id]);

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
        setIsSaving(true);
        setError(null);
        setSuccess(null);

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

        try {
            await packageAPI.updatePackage(id, payload);
            setSuccess(`Package updated successfully!`);
            
            setTimeout(() => {
                navigate('/admin/dashboard'); 
            }, 1500);

        } catch (err) {
            console.error("Package update failed:", err);
            setError(err.response?.data?.message || 'Failed to update package.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <AdminLayout><div className="text-center py-20">Loading Package Details...</div></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
                            Edit Journey: {formData.name}
                        </h1>
                        <p className="text-gray-500 mt-2">Refine and update this travel experience</p>
                    </div>
                    <Link to="/admin/dashboard" className="flex items-center text-teal-600 hover:text-teal-800 font-semibold transition">
                        <span className="mr-2">←</span> Back to Dashboard
                    </Link>
                </div>

                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm flex items-center">⚠️ {error}</div>}
                {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg shadow-sm flex items-center">✅ {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Status Toggle */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-teal-100 text-teal-600 p-2 rounded-lg mr-4">⚙️</span>
                            <div>
                                <h3 className="font-bold text-gray-800">Package Visibility</h3>
                                <p className="text-sm text-gray-500">Deactivate to hide from users</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className={`mr-3 font-bold ${formData.available ? 'text-green-600' : 'text-red-500'}`}>
                                {formData.available ? 'ACTIVE' : 'DEACTIVATED'}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} className="sr-only peer" />
                                <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-teal-100 text-teal-600 p-2 rounded-lg mr-3">📍</span>
                            Destination & Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Package Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Destination</label>
                                <input type="text" name="destination" value={formData.destination} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Detailed Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                             <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Package Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white" >
                                    {PACKAGE_TYPES.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Max Travelers</label>
                                <input type="number" name="maxPeople" value={formData.maxPeople} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                           <div className="flex items-center pt-8">
                                <input id="isFeatured" type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition-all cursor-pointer" />
                                <label htmlFor="isFeatured" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">Feature on Home Page</label>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Schedule */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">💰</span>
                            Pricing & Schedule
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Price (USD)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Duration (Days)</label>
                                <input type="number" name="duration" value={formData.duration} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">🗓️</span>
                                Journey Itinerary
                            </h2>
                            <button type="button" onClick={addItineraryDay} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-md" > + Add Day </button>
                        </div>
                        
                        <div className="space-y-6">
                            {itinerary.map((item, index) => (
                                <div key={index} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-200 group transition-all hover:border-teal-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-teal-700">Day {item.day}</h3>
                                        {itinerary.length > 1 && (
                                            <button type="button" onClick={() => removeItineraryDay(index)} className="text-red-500 hover:text-red-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition" > Remove Day </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <input type="text" name="title" value={item.title} onChange={(e) => handleItineraryChange(index, e)} placeholder="Day Title" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                                        <textarea name="description" value={item.description} onChange={(e) => handleItineraryChange(index, e)} placeholder="Description" required rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inclusions & Exclusions */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">🍱</span>
                            Inclusions & Exclusions
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">What's Included (comma separated)</label>
                                <textarea name="included" value={formData.included} onChange={handleChange} rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">What's Not Included (comma separated)</label>
                                <textarea name="excluded" value={formData.excluded} onChange={handleChange} rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 ml-1">Image URLs (comma separated)</label>
                                <textarea name="images" value={formData.images} onChange={handleChange} rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xl font-bold rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none" >
                        {isSaving ? 'Saving Masterpiece...' : 'Save Changes'}
                    </button>
                    <div className="h-20"></div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditPackagePage;