import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { industryService, Industry } from '../services/industryService';
import { toast } from 'react-hot-toast';

const AddIndustry = () => {
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [newIndustry, setNewIndustry] = useState({ name: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchIndustries();
    }, []);

    const fetchIndustries = async () => {
        try {
            setLoading(true);
            const data = await industryService.getAllIndustries();
            setIndustries(data);
        } catch (error) {
            toast.error('Failed to fetch industries');
            console.error('Error fetching industries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIndustry = async () => {
        if (newIndustry.name.trim()) {
            try {
                setLoading(true);
                await industryService.createIndustry(newIndustry);
                await fetchIndustries();
                setNewIndustry({ name: '' });
                toast.success('Industry added successfully');
            } catch (error) {
                toast.error('Failed to add industry');
                console.error('Error adding industry:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleStartEdit = (industry: Industry) => {
        setEditingId(industry.id);
        setEditingIndustry({ ...industry });
    };
    const handleSaveEdit = async () => {
        if (editingIndustry && editingIndustry.name.trim()) {
            try {
                setLoading(true);
                
                // Eğer mevcut endüstri ile yeni isim aynıysa, güncelleme işlemi yapılır
                const existingIndustry = industries.find(ind => 
                    ind.name === editingIndustry.name && ind.id !== editingIndustry.id
                );
    
                if (existingIndustry) {
                    // Eğer aynı isimde başka bir endüstri varsa, hata döndür
                    toast.error('Bu endüstri zaten mevcut.');
                    return;
                }
    
                // Endüstriyi güncelle
                await industryService.updateIndustry(editingIndustry.id, {
                    name: editingIndustry.name
                });
    
                // Endüstrileri yeniden yükle
                await fetchIndustries();
                setEditingId(null);
                setEditingIndustry(null);
                toast.success('Endüstri başarıyla güncellendi');
            } catch (error) {
                toast.error('Endüstriyi güncellerken hata oluştu');
                console.error('Error updating industry:', error);
            } finally {
                setLoading(false);
            }
        }
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingIndustry(null);
    };

    const handleDeleteIndustry = async (id: number) => {
        try {
            setLoading(true);
            await industryService.deleteIndustry(id);
            await fetchIndustries();
            toast.success('Industry deleted successfully');
        } catch (error) {
            toast.error('Failed to delete industry');
            console.error('Error deleting industry:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>;
    }

    // Rest of the JSX remains the same as in your original component...
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Industries Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add New Industry Form */}
                        <div className="space-y-4 p-4 border border-purple-100 rounded-lg text-black">
                            <input
                                type="text"
                                value={newIndustry.name}
                                onChange={(e) => setNewIndustry({ name: e.target.value })}
                                placeholder="Industry Name"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                            />
                            <button
                                onClick={handleAddIndustry}
                                disabled={!newIndustry.name.trim()}
                                className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                Add New Industry
                            </button>
                        </div>

                        {/* Industries List */}
                        <div className="space-y-4">
                            {industries.map(industry => (
                                <div key={industry.id} className="p-4 border border-gray-200 rounded-lg">
                                    {editingId === industry.id ? (
                                        // Editing Mode
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={editingIndustry?.name}
                                                onChange={(e) => setEditingIndustry({
                                                    ...editingIndustry!,
                                                    name: e.target.value
                                                })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 text-black"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2 text-black"
                                                >
                                                    <X size={20} />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition flex items-center gap-2 text-black"
                                                >
                                                    <Check size={20} />
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display Mode
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-black">{industry.name}</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStartEdit(industry)}
                                                    className="p-2 text-yellow-600 hover:text-yellow-700 transition"
                                                >
                                                    <Pencil size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteIndustry(industry.id)}
                                                    className="p-2 text-red-600 hover:text-red-700 transition"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddIndustry;