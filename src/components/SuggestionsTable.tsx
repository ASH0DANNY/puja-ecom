import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Suggestion } from '../types/suggestion';

interface SuggestionsTableProps {
    suggestions: Suggestion[];
    onUpdate: () => void;
}

export const SuggestionsTable = ({ suggestions, onUpdate }: SuggestionsTableProps) => {
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (suggestionId: string, newStatus: Suggestion['status']) => {
        setLoading(true);
        try {
            await updateDoc(doc(db, 'suggestions', suggestionId), {
                status: newStatus
            });
            onUpdate();
        } catch (error) {
            console.error('Error updating suggestion status:', error);
            alert('Failed to update suggestion status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {suggestions.map((suggestion) => (
                        <tr key={suggestion.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{suggestion.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{suggestion.title}</td>
                            <td className="px-6 py-4 text-sm">
                                <div className="max-w-xs overflow-hidden text-ellipsis">
                                    {suggestion.description}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{suggestion.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${suggestion.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${suggestion.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' : ''}
                  ${suggestion.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                  ${suggestion.status === 'IMPLEMENTED' ? 'bg-purple-100 text-purple-800' : ''}
                `}>
                                    {suggestion.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {suggestion.createdAt.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <select
                                    value={suggestion.status}
                                    onChange={(e) => handleStatusUpdate(suggestion.id, e.target.value as Suggestion['status'])}
                                    disabled={loading}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="IMPLEMENTED">Implemented</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
