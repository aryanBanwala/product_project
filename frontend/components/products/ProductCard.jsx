import React from 'react';
import Link from 'next/link';

const ProductCard = ({ userId, product, onDelete }) => {
  // Return null if no product is provided to prevent errors
  if (!product) {
    return null;
  }

  const { id, name, price, description, createdBy, stock, finalTotalPrice, discountFactor, category } = product;
  
  // ✅ Check ownership (handles null/undefined values)
  const isOwner = String(userId) === String(createdBy);

  // --- Conditional Styling for Stock ---
  // Determines the text and background color for the stock badge based on quantity.
  let stockText = 'Out of Stock';
  let stockClasses = 'bg-red-100 text-red-800';
  if (stock > 10) {
    stockText = 'In Stock';
    stockClasses = 'bg-green-100 text-green-800';
  } else if (stock > 0) {
    stockText = 'Low Stock';
    stockClasses = 'bg-yellow-100 text-yellow-800';
  }

  // --- Delete Confirmation ---
  const handleDelete = () => {
    // Extra safety check and user confirmation dialog
    if (isOwner && window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    // --- Main Card Container ---
    // Added group for hover effects on child elements and smooth transitions.
    // The hover effect lifts the card and increases its shadow for a 3D effect.
    <div className={`group bg-white border border-gray-200 rounded-lg shadow-md flex flex-col max-w-100
                    transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1
                    ${isOwner ? '' : 'opacity-60'}`}>
      
      {/* --- Image Placeholder --- */}
      
      {/* --- Content Area --- */}
      <div className="p-5 flex flex-col flex-grow">
        {/* --- Badges for Category & Stock --- */}
        <div className="flex justify-between items-center mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {category || 'Uncategorized'}
          </span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${stockClasses}`}>
            {stockText} ({stock || 0})
          </span>
        </div>

        {/* --- Product Name --- */}
        <h3 className="text-xl font-bold tracking-tight text-gray-900 mt-2">
          {name || 'Unnamed Product'}
        </h3>
        
        {/* --- Product Description --- */}
        {/* 'flex-grow' allows this section to expand and push the price/buttons to the bottom. */}
        <p className="text-gray-600 text-sm mt-2 mb-4 flex-grow">
          {description ? `${description.substring(0, 6)}...` : 'No description available.'}
        </p>
        
        {/* --- Pricing Section --- */}
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-extrabold text-gray-900">
                ${parseFloat(price*(1-(discountFactor/100)) || 0).toFixed(2)}
              </span>
              {/* Show original price and discount only if a discount exists */}
              {discountFactor > 0 && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-md text-gray-500 line-through">
                    ${parseFloat(price).toFixed(2)}
                  </span>
                  <span className="text-md font-semibold text-green-600">
                    ({discountFactor}% off)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Action Buttons (Owner Only) --- */}
      {/* Buttons are only visible to the product owner. */}
      {isOwner && (
        <div className="border-t bg-gray-50 px-5 py-3 flex items-center justify-end space-x-3 rounded-b-lg">
          <Link
            href={`/products/${id}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;