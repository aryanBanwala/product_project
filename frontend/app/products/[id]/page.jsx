'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import productService from '../../../services/ProductService';
import { notFound } from 'next/navigation';
import Link from 'next/link';


const ProductDetailsPage = ({ params }) => {
   
    const router = useRouter();
    const pathname = usePathname(); // "/products/68e2920aaf95e5d553a2cbf3/edit"
    
        // Extract the productId from the URL
    const productId = pathname.split('/')[2];
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    
        useEffect(() => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                router.replace('/login');
            }
        }, []);


    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            try {
                const data = await productService.getProduct(productId);
                setProduct(data);
            } catch (err) {
                if (err.message.includes('404')) {
                    notFound();
                }
                setError(err.message || "Failed to fetch product details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (isLoading)
        return (
            <p className="text-center py-20 text-lg text-gray-500">Loading product...</p>
        );
    if (error)
        return (
            <p className="text-center py-20 text-red-600 font-semibold">Error: {error}</p>
        );
    if (!product)
        return (
            <p className="text-center py-20 text-gray-500">Product not found.</p>
        );

    return (
        <div className="max-w-xl mx-auto my-12 p-8 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h1 className="text-2xl font-bold border-b-2 border-gray-100 pb-3 mb-6">{product.name}</h1>

            <p className="text-xl font-bold mb-6 text-green-700">
                Price: ${parseFloat(product.price).toFixed(2)}
            </p>

            <div className="mb-8">
                <strong className="block text-gray-700 mb-1">Description:</strong>
                <p className="mt-1 text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex gap-4">
                <Link
                    href={`/products/${productId}/edit`}
                    className="inline-block px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                >
                    ✏️ Edit Product
                </Link>
                <Link
                    href="/products"
                    className="inline-block px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded transition"
                >
                    ← Back to List
                </Link>
            </div>
        </div>
    );
};

export default ProductDetailsPage;