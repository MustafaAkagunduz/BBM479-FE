"use client";
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";


import {ChevronDown } from 'lucide-react';



ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Company {
    id: number;
    name: string;
}

interface Survey {
    id: number;
    title: string;
}

interface SkillScore {
    skillName: string;
    averageScore: number;
}

interface CompanyAnalysis {
    companyId: number;
    companyName: string;
    skillScores: SkillScore[];
}

function CompanyBasedEvaluationsComponent() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<number>();
    const [selectedSurvey, setSelectedSurvey] = useState<number>();
    const [analysisData, setAnalysisData] = useState<CompanyAnalysis | null>(null);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [isSurveyDropdownOpen, setIsSurveyDropdownOpen] = useState(false);
    const [companySearchTerm, setCompanySearchTerm] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8081/api/companies')
            .then(response => setCompanies(response.data))
            .catch(error => console.error('Error fetching companies:', error));
    }, []);

    useEffect(() => {
        axios.get('http://localhost:8081/api/surveys')
            .then(response => setSurveys(response.data))
            .catch(error => console.error('Error fetching surveys:', error));
    }, []);

    useEffect(() => {
        if (selectedCompany && selectedSurvey) {
            axios.get(`http://localhost:8081/api/analysis/company/${selectedCompany}/survey/${selectedSurvey}/skills`)
                .then(response => setAnalysisData(response.data))
                .catch(error => console.error('Error fetching analysis:', error));
        }
    }, [selectedCompany, selectedSurvey]);

    return (
        <Card className="max-w-4xl mx-auto mt-16">
            <CardHeader className="py-8">
                <CardTitle className="text-center text-3xl lg:text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Company Based Skill Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="space-y-4 w-80 mx-auto mb-8">
                    <div className="relative">
                        <button
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        >
                            {selectedCompany ? companies.find(c => c.id === selectedCompany)?.name : "Select Company"}
                            <ChevronDown size={20}/>
                        </button>
                        {isCompanyDropdownOpen && (
                            <div
                                className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                <input
                                    type="text"
                                    placeholder="Type company name..."
                                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                                    className="w-full p-2 border-b"
                                />
                                {companies
                                    .filter(company =>
                                        company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
                                    )
                                    .map(company => (
                                        <div
                                            key={company.id}
                                            onClick={() => {
                                                setSelectedCompany(company.id);
                                                setIsCompanyDropdownOpen(false);
                                            }}
                                            className="px-4 py-2 cursor-pointer hover:bg-purple-100"
                                        >
                                            {company.name}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsSurveyDropdownOpen(!isSurveyDropdownOpen)}
                            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        >
                            {selectedSurvey ? surveys.find(s => s.id === selectedSurvey)?.title : "Select Survey"}
                            <ChevronDown size={20}/>
                        </button>
                        {isSurveyDropdownOpen && (
                            <div
                                className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                {surveys.map(survey => (
                                    <div
                                        key={survey.id}
                                        onClick={() => {
                                            setSelectedSurvey(survey.id);
                                            setIsSurveyDropdownOpen(false);
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-purple-100"
                                    >
                                        {survey.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {analysisData && (
                    <div className="h-[400px]">
                        <Bar
                            data={{
                                labels: [...analysisData.skillScores]
                                    .sort((a, b) => b.averageScore - a.averageScore)
                                    .map(score => score.skillName),
                                datasets: [{
                                    label: 'Skill Scores',
                                    data: [...analysisData.skillScores]
                                        .sort((a, b) => b.averageScore - a.averageScore)
                                        .map(score => score.averageScore * 20), // 5'lik sistemden 100'lük sisteme çevirme
                                    backgroundColor: 'rgba(147, 51, 234, 0.5)',
                                    borderColor: 'rgb(147, 51, 234)',
                                    borderWidth: 1
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: `${analysisData.companyName} - Skill Analysis`
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            stepSize: 10
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default CompanyBasedEvaluationsComponent;