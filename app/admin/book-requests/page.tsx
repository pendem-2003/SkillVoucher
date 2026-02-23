'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { BookOpen, Trash2, Check, X } from 'lucide-react';

interface BookRequest {
    id: string;
    bookName: string;
    author: string | null;
    description: string;
    category: string | null;
    expectedPrice: number | null;
    priority: string;
    status: string;
    adminNotes: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export default function AdminBookRequestsPage() {
    const { data: session, status } = useSession();
    const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionStatus, setActionStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        fetchBookRequests();
    }, []);

    const fetchBookRequests = async () => {
        try {
            const response = await fetch('/api/admin/book-requests');
            if (!response.ok) throw new Error('Failed to fetch book requests');
            const data = await response.json();
            setBookRequests(data.bookRequests);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load book requests');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId: string, status: string, notes: string) => {
        try {
            const response = await fetch(`/api/admin/book-requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNotes: notes }),
            });

            if (!response.ok) throw new Error('Failed to update request');

            toast.success(`Book request ${status.toLowerCase()}`);
            setSelectedRequest(null);
            setAdminNotes('');
            fetchBookRequests();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update request');
        }
    };

    const handleDelete = async (requestId: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return;

        try {
            const response = await fetch(`/api/admin/book-requests/${requestId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete request');

            toast.success('Book request deleted');
            fetchBookRequests();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete request');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
            case 'LOW': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-50';
            case 'REJECTED': return 'text-red-600 bg-red-50';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading book requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Book Requests</h1>
                    </div>
                    <p className="text-gray-600">Manage user book requests</p>
                </div>

                {bookRequests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No book requests yet</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookRequests.map((request) => (
                            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{request.bookName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                                                {request.priority}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        {request.author && (
                                            <p className="text-gray-600 mb-2">by {request.author}</p>
                                        )}
                                        <p className="text-gray-700 mb-3">{request.description}</p>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                            {request.category && (
                                                <div>
                                                    <span className="font-semibold">Category:</span> {request.category}
                                                </div>
                                            )}
                                            {request.expectedPrice && (
                                                <div>
                                                    <span className="font-semibold">Expected Price:</span> ₹{request.expectedPrice}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-semibold">Requested by:</span> {request.user.name || request.user.email}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Date:</span> {new Date(request.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {request.adminNotes && (
                                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                                <p className="text-sm font-semibold text-gray-700 mb-1">Admin Notes:</p>
                                                <p className="text-sm text-gray-600">{request.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(request.id)}
                                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete request"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                {request.status === 'PENDING' && (
                                    <div className="border-t pt-4">
                                        {selectedRequest?.id === request.id ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Action
                                                    </label>
                                                    <select
                                                        value={actionStatus}
                                                        onChange={(e) => setActionStatus(e.target.value as any)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="APPROVED">Approve</option>
                                                        <option value="REJECTED">Reject</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Admin Notes
                                                    </label>
                                                    <textarea
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        placeholder="Add notes about this request..."
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(request.id, actionStatus, adminNotes)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(null);
                                                            setAdminNotes('');
                                                            setActionStatus('PENDING');
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setAdminNotes(request.adminNotes || '');
                                                    setActionStatus(request.status as any);
                                                }}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Review Request
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
