import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Discount } from '../types/discount';

const DiscountManager = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        startDate: '',
        endDate: '',
        usageLimit: 100,
        userType: 'all',
        isActive: true
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'discounts'));
            const discountsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate.toDate(),
                endDate: doc.data().endDate?.toDate() || null,
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            }) as Discount);
            setDiscounts(discountsData);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const discountData = {
                ...formData,
                code: formData.code.toUpperCase(),
                currentUsage: 0,
                startDate: new Date(formData.startDate),
                endDate: formData.endDate ? new Date(formData.endDate) : null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (editingDiscount) {
                await updateDoc(doc(db, 'discounts', editingDiscount.id), {
                    ...discountData,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'discounts'), discountData);
            }

            setShowForm(false);
            setEditingDiscount(null);
            resetForm();
            fetchDiscounts();
        } catch (error) {
            console.error('Error saving discount:', error);
        }
    };

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            description: discount.description,
            discountType: discount.discountType,
            value: discount.value,
            minPurchase: discount.minPurchase || 0,
            maxDiscount: discount.maxDiscount || 0,
            startDate: discount.startDate.toISOString().split('T')[0],
            endDate: discount.endDate ? discount.endDate.toISOString().split('T')[0] : '',
            usageLimit: discount.usageLimit,
            userType: discount.userType,
            isActive: discount.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this discount?')) {
            try {
                await deleteDoc(doc(db, 'discounts', id));
                fetchDiscounts();
            } catch (error) {
                console.error('Error deleting discount:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            value: 0,
            minPurchase: 0,
            maxDiscount: 0,
            startDate: '',
            endDate: '',
            usageLimit: 100,
            userType: 'all',
            isActive: true
        });
    };

    if (loading) {
        return <div className="p-4">Loading discounts...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Discount Management</h1>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingDiscount(null);
                        resetForm();
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    Create New Discount
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Minimum Purchase
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Discount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        User Type
                                    </label>
                                    <select
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'new' | 'all' | 'specific' })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="new">New Users Only</option>
                                        <option value="specific">Specific Users</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.isActive.toString()}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingDiscount(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                >
                                    {editingDiscount ? 'Update' : 'Create'} Discount
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Validity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {discounts.map((discount) => (
                            <tr key={discount.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {discount.code}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {discount.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {discount.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {discount.discountType === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {discount.currentUsage} / {discount.usageLimit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>
                                        Start: {new Date(discount.startDate).toLocaleDateString()}
                                    </div>
                                    <div>
                                        {discount.endDate
                                            ? `Expires: ${new Date(discount.endDate).toLocaleDateString()}`
                                            : 'No expiry date'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${!discount.isActive
                                        ? 'bg-red-100 text-red-800'
                                        : discount.endDate && new Date(discount.endDate) < new Date()
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                        {!discount.isActive
                                            ? 'Inactive'
                                            : discount.endDate && new Date(discount.endDate) < new Date()
                                                ? 'Expired'
                                                : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(discount)}
                                        className="text-primary hover:text-primary/80 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(discount.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiscountManager;
