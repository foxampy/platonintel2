/**
 * Plato-Intel v2 - Catalog JavaScript
 * Product catalog functionality
 */

import { showToast } from './animations.js';
import { getInquiry, addToInquiry, removeFromInquiry, clearInquiry } from './data.js';

// ==========================================
// State Management
// ==========================================
const catalogState = {
    products: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 12,
    filters: {
        category: 'all',
        minPrice: 0,
        maxPrice: Infinity,
        search: '',
        availability: 'all'
    },
    sortBy: 'default',
    isLoading: false
};

// ==========================================
// Filter Products by Category
// ==========================================
const filterByCategory = (products, category) => {
    if (category === 'all') return products;
    return products.filter(product => product.category === category);
};

// ==========================================
// Price Range Filter
// ==========================================
const initPriceRangeSlider = () => {
    const minSlider = document.getElementById('price-min');
    const maxSlider = document.getElementById('price-max');
    const minDisplay = document.getElementById('price-min-display');
    const maxDisplay = document.getElementById('price-max-display');
    const track = document.querySelector('.price-range__track');

    if (!minSlider || !maxSlider) return;

    const updateSlider = () => {
        let minVal = parseInt(minSlider.value);
        let maxVal = parseInt(maxSlider.value);

        // Prevent overlap
        if (maxVal - minVal < 100) {
            if (event?.target === minSlider) {
                minSlider.value = maxVal - 100;
            } else {
                maxSlider.value = minVal + 100;
            }
        }

        minVal = parseInt(minSlider.value);
        maxVal = parseInt(maxSlider.value);

        // Update displays
        if (minDisplay) minDisplay.textContent = `${minVal.toLocaleString()} BYN`;
        if (maxDisplay) maxDisplay.textContent = `${maxVal.toLocaleString()} BYN`;

        // Update track
        if (track) {
            const percent1 = (minVal / parseInt(minSlider.max)) * 100;
            const percent2 = (maxVal / parseInt(maxSlider.max)) * 100;
            track.style.background = `linear-gradient(to right, #e0e0e0 ${percent1}%, #2563eb ${percent1}%, #2563eb ${percent2}%, #e0e0e0 ${percent2}%)`;
        }

        // Update state
        catalogState.filters.minPrice = minVal;
        catalogState.filters.maxPrice = maxVal;
        
        // Debounce filter application
        debounceApplyFilters();
    };

    minSlider.addEventListener('input', updateSlider);
    maxSlider.addEventListener('input', updateSlider);

    // Initialize
    updateSlider();
};

// ==========================================
// Sort Products
// ==========================================
const sortProducts = (products, sortBy) => {
    const sorted = [...products];

    switch (sortBy) {
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'availability':
            sorted.sort((a, b) => (b.inStock === a.inStock) ? 0 : b.inStock ? 1 : -1);
            break;
        default:
            // Keep original order
            break;
    }

    return sorted;
};

const initSortDropdown = () => {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        catalogState.sortBy = e.target.value;
        applyFilters();
    });
};

// ==========================================
// Apply All Filters
// ==========================================
let debounceTimer;
const debounceApplyFilters = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 300);
};

const applyFilters = () => {
    let filtered = [...catalogState.products];

    // Category filter
    if (catalogState.filters.category !== 'all') {
        filtered = filterByCategory(filtered, catalogState.filters.category);
    }

    // Price filter
    filtered = filtered.filter(product => 
        product.price >= catalogState.filters.minPrice && 
        product.price <= catalogState.filters.maxPrice
    );

    // Search filter
    if (catalogState.filters.search) {
        const searchTerm = catalogState.filters.search.toLowerCase();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm) ||
            product.sku?.toLowerCase().includes(searchTerm)
        );
    }

    // Availability filter
    if (catalogState.filters.availability !== 'all') {
        filtered = filtered.filter(product => 
            catalogState.filters.availability === 'in-stock' ? product.inStock : !product.inStock
        );
    }

    // Sort
    filtered = sortProducts(filtered, catalogState.sortBy);

    // Update state
    catalogState.filteredProducts = filtered;
    catalogState.currentPage = 1;

    // Render
    renderProducts();
    updateResultsCount();
};

// ==========================================
// Render Products
// ==========================================
const renderProducts = () => {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    const { filteredProducts, currentPage, itemsPerPage } = catalogState;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(0, end);

    // Show loading state if needed
    if (catalogState.isLoading) {
        grid.innerHTML = '<div class="loading-spinner"></div>';
        return;
    }

    // Empty state
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="products-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
                <button class="btn btn--secondary" onclick="resetFilters()">Сбросить фильтры</button>
            </div>
        `;
        updateLoadMoreButton(false);
        return;
    }

    // Render products
    const productsHTML = paginatedProducts.map(product => createProductCard(product)).join('');

    if (currentPage === 1) {
        grid.innerHTML = productsHTML;
    } else {
        grid.insertAdjacentHTML('beforeend', productsHTML);
    }

    // Update load more button visibility
    updateLoadMoreButton(filteredProducts.length > end);
};

const createProductCard = (product) => {
    const inquiry = getInquiry();
    const isInInquiry = inquiry.some(item => item.id === product.id);

    return `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-card__image-wrapper">
                <img 
                    src="${product.image}" 
                    alt="${product.name}" 
                    class="product-card__image"
                    loading="lazy"
                >
                ${product.inStock ? '' : '<span class="product-card__badge product-card__badge--out">Нет в наличии</span>'}
                ${product.isNew ? '<span class="product-card__badge product-card__badge--new">Новинка</span>' : ''}
                ${product.discount ? `<span class="product-card__badge product-card__badge--discount">-${product.discount}%</span>` : ''}
                
                <div class="product-card__actions">
                    <button class="product-card__action-btn" data-action="quick-view" title="Быстрый просмотр">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="product-card__action-btn" data-action="add-inquiry" title="${isInInquiry ? 'В запросе' : 'Добавить в запрос'}" ${isInInquiry ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${isInInquiry 
                                ? '<path d="M20 6 9 17l-5-5"/>' 
                                : '<path d="M9 11V6a3 3 0 0 1 6 0v5M9 11h6M9 11H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3h-3"/>'
                            }
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="product-card__content">
                <span class="product-card__category">${product.categoryName}</span>
                <h3 class="product-card__title">
                    <a href="product.html?id=${product.id}">${product.name}</a>
                </h3>
                <p class="product-card__sku">Арт: ${product.sku}</p>
                
                <div class="product-card__footer">
                    <div class="product-card__price">
                        ${product.oldPrice ? `<span class="product-card__price-old">${product.oldPrice.toLocaleString()} BYN</span>` : ''}
                        <span class="product-card__price-current">${product.price.toLocaleString()} BYN</span>
                    </div>
                    <button class="btn btn--small ${isInInquiry ? 'btn--success' : 'btn--primary'}" data-action="add-inquiry-main" ${!product.inStock || isInInquiry ? 'disabled' : ''}>
                        ${isInInquiry ? 'В запросе' : 'В запрос'}
                    </button>
                </div>
            </div>
        </article>
    `;
};

const updateResultsCount = () => {
    const countElement = document.querySelector('.results-count');
    if (countElement) {
        countElement.textContent = `Найдено: ${catalogState.filteredProducts.length} товаров`;
    }
};

const updateLoadMoreButton = (show) => {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = show ? 'inline-flex' : 'none';
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = 'Показать ещё';
    }
};

// ==========================================
// Load More / Pagination
// ==========================================
const initLoadMore = () => {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<span class="spinner"></span> Загрузка...';
        
        // Simulate loading delay
        setTimeout(() => {
            catalogState.currentPage++;
            renderProducts();
        }, 300);
    });
};

// ==========================================
// Search Products
// ==========================================
const initSearch = () => {
    const searchInput = document.getElementById('product-search');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            catalogState.filters.search = e.target.value.trim();
            applyFilters();
        }, 400);
    });

    // Clear search
    const clearBtn = document.querySelector('.search-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            catalogState.filters.search = '';
            applyFilters();
        });
    }
};

// ==========================================
// Category Filters
// ==========================================
const initCategoryFilters = () => {
    const categoryButtons = document.querySelectorAll('[data-category]');
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            // Update state and apply
            catalogState.filters.category = btn.dataset.category;
            applyFilters();
        });
    });
};

// ==========================================
// Filter Reset
// ==========================================
const resetFilters = () => {
    // Reset state
    catalogState.filters = {
        category: 'all',
        minPrice: 0,
        maxPrice: Infinity,
        search: '',
        availability: 'all'
    };
    catalogState.sortBy = 'default';
    catalogState.currentPage = 1;

    // Reset UI
    document.querySelectorAll('[data-category]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.category === 'all');
    });

    const searchInput = document.getElementById('product-search');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';

    const minSlider = document.getElementById('price-min');
    const maxSlider = document.getElementById('price-max');
    if (minSlider) minSlider.value = minSlider.min;
    if (maxSlider) maxSlider.value = maxSlider.max;

    // Apply
    applyFilters();
    showToast('Фильтры сброшены', 'info');
};

window.resetFilters = resetFilters;

// ==========================================
// Add to Inquiry/Cart
// ==========================================
const handleAddToInquiry = (productId) => {
    const product = catalogState.products.find(p => p.id === productId);
    if (!product) return;

    const success = addToInquiry(product);
    
    if (success) {
        showToast(`${product.name} добавлен в запрос`, 'success');
        updateInquiryCount();
        
        // Update button state
        document.querySelectorAll(`[data-product-id="${productId}"] [data-action^="add-inquiry"]`).forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = btn.dataset.action === 'add-inquiry-main' ? 'В запросе' : 
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';
            btn.classList.add('is-active');
        });
    } else {
        showToast('Товар уже в запросе', 'warning');
    }
};

const updateInquiryCount = () => {
    const inquiry = getInquiry();
    const badges = document.querySelectorAll('.inquiry-count, .cart-count');
    
    badges.forEach(badge => {
        badge.textContent = inquiry.length;
        badge.classList.toggle('is-visible', inquiry.length > 0);
    });
};

// ==========================================
// Quick View Modal
// ==========================================
const initQuickView = () => {
    // Event delegation for quick view buttons
    document.addEventListener('click', (e) => {
        const quickViewBtn = e.target.closest('[data-action="quick-view"]');
        if (!quickViewBtn) return;

        const card = quickViewBtn.closest('[data-product-id]');
        if (!card) return;

        const productId = card.dataset.productId;
        const product = catalogState.products.find(p => p.id === productId);
        
        if (product) {
            openQuickViewModal(product);
        }
    });
};

const openQuickViewModal = (product) => {
    const modal = document.createElement('div');
    modal.className = 'modal modal--quick-view is-open';
    modal.innerHTML = `
        <div class="modal__overlay"></div>
        <div class="modal__content">
            <button class="modal__close" aria-label="Закрыть">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            </button>
            
            <div class="quick-view">
                <div class="quick-view__image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="quick-view__info">
                    <span class="quick-view__category">${product.categoryName}</span>
                    <h2 class="quick-view__title">${product.name}</h2>
                    <p class="quick-view__sku">Артикул: ${product.sku}</p>
                    
                    <div class="quick-view__price">
                        ${product.oldPrice ? `<span class="quick-view__price-old">${product.oldPrice.toLocaleString()} BYN</span>` : ''}
                        <span class="quick-view__price-current">${product.price.toLocaleString()} BYN</span>
                    </div>
                    
                    <p class="quick-view__description">${product.description || ''}</p>
                    
                    <div class="quick-view__specs">
                        ${product.specs ? Object.entries(product.specs).map(([key, value]) => `
                            <div class="quick-view__spec">
                                <span class="quick-view__spec-label">${key}:</span>
                                <span class="quick-view__spec-value">${value}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                    
                    <div class="quick-view__actions">
                        <button class="btn btn--primary btn--large" data-action="add-inquiry-quick" data-product-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                            ${!product.inStock ? 'Нет в наличии' : 'Добавить в запрос'}
                        </button>
                        <a href="product.html?id=${product.id}" class="btn btn--secondary btn--large">Подробнее</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close handlers
    const closeModal = () => {
        modal.classList.remove('is-open');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    };

    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
    
    modal.querySelector('[data-action="add-inquiry-quick"]')?.addEventListener('click', () => {
        handleAddToInquiry(product.id);
        closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    }, { once: true });
};

// ==========================================
// Initialize Catalog
// ==========================================
const initCatalog = async () => {
    // Check if we're on a catalog page
    if (!document.querySelector('.catalog-page')) return;

    // Load products
    catalogState.isLoading = true;
    
    try {
        // In real app, fetch from API
        // const response = await fetch('/api/products');
        // catalogState.products = await response.json();
        
        // For demo, products would be loaded via data.js
        const { getProducts } = await import('./data.js');
        catalogState.products = await getProducts();
        catalogState.filteredProducts = [...catalogState.products];
        
        catalogState.isLoading = false;
        
        // Initialize components
        initPriceRangeSlider();
        initSortDropdown();
        initLoadMore();
        initSearch();
        initCategoryFilters();
        initQuickView();
        
        // Initial render
        renderProducts();
        updateResultsCount();
        updateInquiryCount();

        // Handle inquiry buttons
        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('[data-action^="add-inquiry"]');
            if (addBtn && !addBtn.disabled) {
                const card = addBtn.closest('[data-product-id]');
                if (card) {
                    handleAddToInquiry(card.dataset.productId);
                }
            }
        });

    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Ошибка загрузки товаров', 'error');
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalog);
} else {
    initCatalog();
}

export { initCatalog, applyFilters, resetFilters, catalogState };
