'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import productService from '../../services/ProductService';
import ProductCard from '../../components/products/ProductCard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import commonService from '../../services/Common';

const ALLOWED_SORT_FIELDS = ['name', 'price', 'discountFactor', 'finalTotalPrice', 'stock', 'createdAt'];

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [config, setConfig] = useState(null);
    const [userId, setUserId] = useState(null);

    // ✨ NEW: State for search/filter toggle and search query
    const [searchModeActive, setSearchModeActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [categories, setCategories] = useState([]);
    const [ownedByMe, setOwnedByMe] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const router = useRouter();
    const observer = useRef();

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
            router.replace('/login');
        }

        if (typeof window !== 'undefined') {
            let userid = localStorage.getItem('userId');
            setUserId(userid);
        }
    }, []);

    const ondelete = async (id) => {
        try {
            const deleter = await productService.deleteProduct(id);
            if (!deleter.success) {
                toast.error(deleter?.message || "Failed to delete product.");
                return;
            }
            toast.success("Product deleted successfully!");
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
            toast.error(err?.message || "Failed to delete product.");
        }
    };
    
    // 🔄 MODIFIED: fetchProducts now handles both search and filters
    const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
        setIsLoading(true);
        try {
            // Build the request parameters dynamically
            let params = {
                page: pageNum,
                limit: 12,
            };

            if (searchModeActive && searchQuery.trim()) {
                // If in search mode, use the search query
                const response = await productService.searchProducts(searchQuery.trim());
                setProducts(response?.products || []);
                return;
                
            } else if (!searchModeActive) {
                // Otherwise, use the filter states
                params.sortBy = sortBy;
                params.sortOrder = sortOrder;
                params.categories = categories;
                params.ownedByMe = ownedByMe;
            } else {
                // If in search mode but query is empty, fetch nothing
                setProducts([]);
                setHasMore(false);
                setIsLoading(false);
                return;
            }

            const data = await productService.getProducts(params);
            const fetchedProducts = data?.data?.products || [];

            setProducts(prev => append ? [...prev, ...fetchedProducts] : fetchedProducts);
            setHasMore(fetchedProducts.length > 0);
        } catch (err) {
            console.error(err);
            setError("Failed to load products.");
            toast.error("Failed to load products.");
        } finally {
            setIsLoading(false);
        }
    }, [searchModeActive, searchQuery, sortBy, sortOrder, categories, ownedByMe]); // Add dependencies

    // ✨ NEW: Debounce effect for search input
    useEffect(() => {
        // Only run this effect when in search mode
        if (!searchModeActive) return;

        const handler = setTimeout(() => {
            setPage(1); // Reset to page 1 for a new search
            fetchProducts(1, false); // Fetch with the new query (append = false)
        }, 300); // 300ms delay

        // Cleanup function: clears the timeout if the user types again
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, searchModeActive]); // Re-run effect when query or mode changes

    // 🔄 MODIFIED: This effect now triggers fetches for filter changes only
    useEffect(() => {
        // Only trigger re-fetch if not in search mode
        if (!searchModeActive) {
            setPage(1);
            fetchProducts(1, false);
        }
    }, [sortBy, sortOrder, categories, ownedByMe]);

    // ✨ NEW: Effect to reset state when switching between Filter and Search modes
    useEffect(() => {
        setPage(1);
        setProducts([]); // Clear products to prevent showing stale data
        setHasMore(true); // Reset pagination
        setError(null);

        if (!searchModeActive) {
            // Switched back to filter mode, so fetch with current filter settings
            fetchProducts(1, false);
        }
    }, [searchModeActive]);

    // Fetch config for categories (no change needed here)
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configData = await commonService.getConfig();
                setConfig(configData);
            } catch { }
        };
        fetchConfig();
    }, []);
    
    // Infinite scroll intersection observer (no change needed here)
    const lastProductRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    // Fetch next page when `page` changes (no change needed here)
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, true);
        }
    }, [page, fetchProducts]);

    if (isLoading && products.length === 0)
        return <p className="text-gray-500 text-center mt-8">Loading products...</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Products</h1>

            {/* ✨ NEW: Toggle Switch for Filter/Search */}
            <div className="flex items-center mb-4 p-1 bg-gray-100 rounded-lg w-min">
                <button
                    onClick={() => setSearchModeActive(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!searchModeActive ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                    Filters
                </button>
                <button
                    onClick={() => setSearchModeActive(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${searchModeActive ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                    Search
                </button>
            </div>

            {/* ✨ NEW: Conditional Rendering for Search Bar or Filters */}
            {searchModeActive ? (
                // Search Bar UI
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search for products by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                </div>
            ) : (
                // Filters Section UI
                <div className="bg-gray-50 border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
                    {/* Sort */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sort By</label>
                        <select className="border rounded p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            {ALLOWED_SORT_FIELDS.map((field) => (
                                <option key={field} value={field}>
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Order</label>
                        <select className="border rounded p-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                        <select
                            multiple
                            className="w-64 border rounded-xl p-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                            value={categories}
                            onChange={(e) => setCategories(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                        >
                            {config?.data?.productCategories?.length ? (
                                config.data.productCategories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))
                            ) : (
                                <option disabled>Loading categories...</option>
                            )}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Hold <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl</kbd> (or <kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd</kbd>) to select multiple
                        </p>
                    </div>

                    {/* Owned by me */}
                    <div className="flex items-center mt-6">
                        <input type="checkbox" checked={ownedByMe} onChange={() => setOwnedByMe(!ownedByMe)} className="mr-2" />
                        <label className="text-sm font-medium text-gray-700">Only Owned By Me</label>
                    </div>

                    {/* Clear Filters Button (Apply button is removed as filters apply on change) */}
                    <button
                        onClick={() => {
                            setSortBy('name');
                            setSortOrder('asc');
                            setCategories([]);
                            setOwnedByMe(false);
                            // No need to call fetchProducts here, the useEffect will handle it
                        }}
                        className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-all shadow-sm border border-gray-200 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Filters
                    </button>
                </div>
            )}

            <Link href="/products/new" className="inline-block px-5 py-2 mb-8 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition">
                Create New Product
            </Link>

            {/* Products */}
            <div className="flex flex-wrap gap-6">
                {products.length > 0 ? (
                    products.map((product, index) => {
                        const isLast = index === products.length - 1;
                        return (
                            <div key={product.id || product._id} ref={isLast ? lastProductRef : null}>
                                <ProductCard userId={userId} product={product} onDelete={() => ondelete(product.id)} />
                            </div>
                        );
                    })
                ) : (
                    // Show different message based on mode
                    !isLoading && <p className="text-gray-500 w-full text-center">{searchModeActive ? "No products match your search." : "No products found."}</p>
                )}
            </div>

            {isLoading && (
  <p className="text-center my-6 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse animate-bounce">
    🔄 Loading more products...
  </p>
)}

            {error && <p className="text-center text-red-500 my-4">{error}</p>}
        </div>
    );
};

export default ProductsPage;