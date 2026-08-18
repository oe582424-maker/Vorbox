import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'name';
  onSortChange: (sort: 'featured' | 'price-low' | 'price-high' | 'name') => void;
  totalCount: number;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalCount,
}) => {
  return (
    <div id="category-filters-container" className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-neutral-200">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Item count & Sorting dropdown */}
      <div className="flex items-center justify-between md:justify-end gap-3 text-xs sm:text-sm">
        <span className="text-neutral-500 font-medium">
          Showing <span className="font-semibold text-neutral-900">{totalCount}</span> item{totalCount !== 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-neutral-500 text-xs font-medium hidden sm:inline">Sort:</span>
          <select
            id="sort-select-dropdown"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            aria-label="Sort products"
            className="bg-transparent border-none text-xs font-medium text-neutral-900 focus:outline-hidden cursor-pointer"
          >
            <option value="featured">Featured / Best</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
