import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, ChevronDown } from 'lucide-react';
import { skillService, Skill } from '../services/skillService';
import { industryService } from '../services/industryService';
import { toast } from 'react-hot-toast';

interface Industry {
    id: number;
    name: string;
}

const AddSkill: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [newSkill, setNewSkill] = useState<string>('');
    const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchIndustries();
        fetchSkills();
    }, []);

    const fetchIndustries = async () => {
        try {
            const data = await industryService.getAllIndustries();
            setIndustries(data);
        } catch (error) {
            toast.error('Failed to fetch industries');
            console.error('Error fetching industries:', error);
        }
    };

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const data = await skillService.getAllSkills();
            setSkills(data);
        } catch (error) {
            toast.error('Failed to fetch skills');
            console.error('Error fetching skills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async () => {
        if (newSkill.trim() && selectedIndustry) {
            try {
                setLoading(true);
                await skillService.createSkill({
                    name: newSkill.trim(),
                    industryId: selectedIndustry.id
                });
                await fetchSkills();
                setNewSkill('');
                setSelectedIndustry(null);
                toast.success('Skill added successfully');
            } catch (error) {
                toast.error('Failed to add skill');
                console.error('Error adding skill:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateSkill = async () => {
        if (editingSkillId !== null && newSkill.trim() && selectedIndustry) {
            try {
                setLoading(true);
                await skillService.updateSkill(editingSkillId, {
                    name: newSkill.trim(),
                    industryId: selectedIndustry.id
                });
                await fetchSkills();
                setEditingSkillId(null);
                setNewSkill('');
                setSelectedIndustry(null);
                toast.success('Skill updated successfully');
            } catch (error) {
                toast.error('Failed to update skill');
                console.error('Error updating skill:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditSkill = (skill: Skill) => {
        setEditingSkillId(skill.id);
        setNewSkill(skill.name);
        const industry = industries.find(i => i.id === skill.industryId);
        if (industry) {
            setSelectedIndustry(industry);
        }
    };

    const handleDeleteSkill = async (skillId: number) => {
        try {
            setLoading(true);
            await skillService.deleteSkill(skillId);
            await fetchSkills();
            toast.success('Skill deleted successfully');
        } catch (error) {
            toast.error('Failed to delete skill');
            console.error('Error deleting skill:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleIndustry = (industry: Industry) => {
        setSelectedIndustry(industry);
        setIsDropdownOpen(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-6">
                    {/* Yeni Beceri Ekleme */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                            placeholder="Enter new skill..."
                        />
                        {editingSkillId === null ? (
                            <button
                                onClick={handleAddSkill}
                                disabled={!newSkill.trim() || !selectedIndustry}
                                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                            >
                                <Plus size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleUpdateSkill}
                                disabled={!newSkill.trim() || !selectedIndustry}
                                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                            >
                                <Check size={20} />
                            </button>
                        )}
                    </div>

                    {/* Endüstri Dropdown Menüsü */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        >
                            {selectedIndustry ? selectedIndustry.name : "Select Industry"}
                            <ChevronDown size={20} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                {industries.map(industry => (
                                    <div
                                        key={industry.id}
                                        onClick={() => toggleIndustry(industry)}
                                        className={`px-4 py-2 cursor-pointer hover:bg-purple-100 ${
                                            selectedIndustry?.id === industry.id
                                                ? "bg-purple-200 text-purple-800 font-medium"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {industry.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Beceri Listesi */}
                    <div className="space-y-3">
                        {skills.map(skill => (
                            <div key={skill.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                                <span className="text-gray-700">{skill.name}</span>
                                <div className="text-sm text-gray-500">
                                    {industries.find(i => i.id === skill.industryId)?.name || 'Unknown Industry'}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditSkill(skill)}
                                        className="p-2 rounded-lg hover:bg-purple-100 text-purple-600"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSkill;
