'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

interface ProfessionMatch {
    id: number;
    professionId: number;
    professionName: string;
    matchPercentage: number;
}

interface SurveyResult {
    id: number;
    userId: number;
    surveyId: number;
    surveyTitle: string; // Survey ismi için yeni alan
    attemptNumber: number;
    professionMatches: ProfessionMatch[];
    createdAt: string;
}

interface UserResultComponentProps {
    companyId: string;
    userId: string;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: '#9333ea',
        cursor: 'pointer',
        '& .MuiTableCell-root': {
            color: 'white'
        },
        '& .action-badge': {
            backgroundColor: 'white',
            color: '#9333ea'
        },
        '& .delete-icon': {
            color: 'white'
        }
    },
}));

const UserResultComponent: React.FC<UserResultComponentProps> = ({ companyId, userId }) => {
    const [results, setResults] = useState<SurveyResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userResponse = await axios.get(`http://localhost:8081/api/users/${userId}`);
                setUsername(userResponse.data.name);

                const resultsResponse = await axios.get(`http://localhost:8081/api/surveys/results/user/${userId}`);
                setResults(resultsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleDelete = async (resultId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this result?')) {
            try {
                await axios.delete(`http://localhost:8081/api/surveys/results/${resultId}`);
                setResults(prevResults => prevResults.filter(result => result.id !== resultId));
            } catch (error) {
                console.error('Error deleting result:', error);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div
                onClick={() => router.push(`/companies/${companyId}`)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    color: '#9333ea',
                }}
            >
                <ArrowLeft size={20} />
                <span>Back to Company</span>
            </div>

            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    background: 'linear-gradient(to right, #9333ea, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '2rem',
                    fontWeight: 'bold'
                }}
            >
                Survey Results for {username}
            </Typography>

            <Card elevation={3}>
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Survey Date</TableCell>
                                    <TableCell>Survey Name</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result) => (
                                    <StyledTableRow
                                        key={result.id}
                                        onClick={() => router.push(`/companies/${companyId}/${userId}/${result.id}`)}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell>{formatDate(result.createdAt)}</TableCell>
                                        <TableCell>{result.surveyTitle}</TableCell>
                                        <TableCell align="right">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                <IconButton
                                                    onClick={(e) => handleDelete(result.id, e)}
                                                    className="delete-icon"
                                                    sx={{
                                                        color: '#dc2626',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(220, 38, 38, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={20} />
                                                </IconButton>
                                                <span
                                                    className="action-badge"
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#f3e8ff',
                                                        color: '#9333ea',
                                                        fontSize: '0.875rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    Details
                                                    <ArrowRight size={16} />
                                                </span>
                                            </div>
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {results.length === 0 && (
                            <Typography
                                variant="body1"
                                sx={{
                                    textAlign: 'center',
                                    py: 3,
                                    color: 'text.secondary'
                                }}
                            >
                                No survey results found for this user.
                            </Typography>
                        )}
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserResultComponent;