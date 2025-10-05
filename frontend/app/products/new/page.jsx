'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../../../components/products/ProductForm';
import productService from '../../../services/ProductService'; // OOP Service
import commonService from '../../../services/Common';


const CreateProductPage = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const router = useRouter();
    
        useEffect(() => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                router.replace('/login');
            }
        }, []);

    const handleCreate = async (formData) => {
        setError(null);
        setLoading(true);
        try {
            await productService.createProduct(formData);
            alert("Product created successfully!");
            router.push('/products');
        } catch (err) {
            setError(err.message || "Failed to create product. Check your data.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configData = await commonService.getConfig();
                setConfig(configData);
            } catch (error) {
                // handle error if needed
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded shadow">
            <h1 className="text-3xl font-bold text-center mb-8">Create New Product</h1>
            {error && (
                <p className="text-red-600 text-center mb-4">{error}</p>
            )}
            <ProductForm 
                config = {config}
                onSubmit={handleCreate} 
                disabled={loading}
            />
        </div>
    );
};

export default CreateProductPage;