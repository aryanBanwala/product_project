'use client';

import React, { useState, useEffect } from 'react';

// Define the initial state structure
const initialProductState = { 
    name: '', 
    description: '', 
    price: '',
    category: '',
    stock: '',
    discountFactor: ''
};

const ProductForm = ({ initialData = initialProductState, onSubmit, isEdit = false, disabled = false, config }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            price: initialData.price || '',
            category: initialData.category || '',
            stock: initialData.stock || '',
            discountFactor: initialData.discountFactor || ''
        });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'number' || name == "discountFactor" ? parseInt(value || 0, 10) : value,
        });
    };

    


    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); 
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-xl mx-auto"
        >
            {/* Name Field */}
            <label className="font-medium">Product Name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Quantum Leap T-Shirt"
                disabled={disabled}
            />
            
            {/* Price Field */}
            <label className="font-medium">Price ($)</label>
            <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 29.99"
                disabled={disabled}
            />

            {/* Category Field */}
            <label className="font-medium">Category</label>
            <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled}
            >
                <option value="" disabled>
                    Select a category
                </option>
                {Array.isArray(config?.data?.productCategories) &&
                    config.data.productCategories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
            </select>

            {/* Stock Field */}
            <label className="font-medium">Stock</label>
            <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
                disabled={disabled}
            />

            {/* Description Field */}
            <label className="font-medium">Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A brief description of the product..."
                disabled={disabled}
            />

            {/* Discount Factor Field */}
            <label className="font-medium">Discount Factor (%)</label>
            <select
                name="discountFactor"
                type="number"
                value={formData.discountFactor}
                onChange={handleChange}
                required
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled}
            >
                <option value="" disabled>
                    Select a discount factor
                </option>
                {Array.isArray(config?.data?.discountFactors) &&
                    config.data.discountFactors.map((factor) => (
                        <option key={factor} value={factor}>
                            {factor}%
                        </option>
                    ))}
            </select>
            <button
                type="submit"
                disabled={disabled}
                className={`py-2 px-4 rounded bg-blue-600 text-white font-semibold transition-opacity ${
                    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
            >
                {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
        </form>
    );
};

export default ProductForm;
