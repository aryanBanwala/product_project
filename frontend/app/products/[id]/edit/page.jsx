'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProductForm from '../../../../components/products/ProductForm';
import productService from '../../../../services/ProductService';
import { notFound } from 'next/navigation';
import commonService from '../../../../services/Common';

const EditProductPage = ({ params }) => {
    const router = useRouter();
    const pathname = usePathname(); // "/products/68e2920aaf95e5d553a2cbf3/edit"

    // Extract the productId from the URL
    const productId = pathname.split('/')[2]; // second index is the ID
    const [config, setConfig] = useState(null);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);


    // ✅ Check auth on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.replace('/login');
            }
        }
    }, []);


    useEffect(() => {
            const fetchConfig = async () => {
                try {
                    const configData = await commonService.getConfig();
                    setConfig(configData);
                } catch {}
            };
            fetchConfig();
        }, []);

    // 🔹 Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await productService.getProductById(productId);

                if (!response.success) {
                    if (response.status === 403) {
                        // Auto logout
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userId');
                        router.replace('/login');
                        return;
                    } else if (response.status === 404) {
                        notFound();
                        return;
                    }
                    throw new Error(response.message || 'Failed to fetch product.');
                }

                setProduct(response.data);
            } catch (err) {
                setError(err.message || "Failed to load product for editing.");
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, router]);

    const handleUpdate = async (formData) => {
        setError(null);
        setIsSaving(true);
        try {
            const response = await productService.updateProduct(productId, formData);

            if (!response.success) {
                console.log(response)
                if (response.status === 403) {
                    // Auto logout
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    router.replace('/login');
                    return;
                }
                throw new Error(response.message || 'Failed to update product.');
            }

            alert("Product updated successfully!");
            
        } catch (err) {
            setError(err.message || "Failed to update product.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading)
        return (
            <p className="text-center py-20 text-lg text-gray-500">
                Loading product details...
            </p>
        );
    if (error)
        return (
            <p className="text-center py-20 text-lg text-red-500">
                Error: {error}
            </p>
        );
    if (!product)
        return (
            <p className="text-center py-20 text-lg text-gray-500">
                Product not found.
            </p>
        );

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-center mb-8">
                Edit Product: <span className="text-blue-600">{product.name}</span>
            </h1>
            <ProductForm
                initialData={product}
                onSubmit={handleUpdate}
                isEdit={true}
                config={config}
                disabled={isSaving}
            />
        </div>
    );
};

export default EditProductPage;
