/**
 * Plato-Intel v2 - Data Management JavaScript
 * Data loading, storage, and state management
 */

// ==========================================
// LocalStorage Keys
// ==========================================
const STORAGE_KEYS = {
    INQUIRY: 'plato_intel_inquiry',
    CART: 'plato_intel_cart',
    FILTERS: 'plato_intel_filters',
    SEARCH_HISTORY: 'plato_intel_search_history',
    USER_PREFERENCES: 'plato_intel_preferences'
};

// ==========================================
// Load Products from JSON
// ==========================================
const getProducts = async () => {
    try {
        // Try to load from JSON file
        const response = await fetch('./data/products.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Failed to load products.json, using demo data');
    }

    // Fallback demo data
    return getDemoProducts();
};

// Demo products data
const getDemoProducts = () => [
    {
        id: '1',
        name: 'Сервер Dell PowerEdge R740',
        sku: 'R740-001',
        category: 'servers',
        categoryName: 'Серверы',
        price: 12500,
        oldPrice: 14900,
        image: './images/products/server-dell-r740.jpg',
        inStock: true,
        isNew: true,
        discount: 16,
        description: 'Мощный сервер для виртуализации и облачных вычислений',
        specs: {
            'Процессор': 'Intel Xeon Silver 4214R',
            'Память': '64 GB DDR4',
            'Накопители': '2x 480 GB SSD',
            'Гарантия': '3 года'
        }
    },
    {
        id: '2',
        name: 'Сервер HP ProLiant DL380 Gen10',
        sku: 'DL380-G10',
        category: 'servers',
        categoryName: 'Серверы',
        price: 15800,
        image: './images/products/server-hp-dl380.jpg',
        inStock: true,
        isNew: false,
        description: 'Надёжный сервер для критически важных приложений',
        specs: {
            'Процессор': 'Intel Xeon Gold 5218',
            'Память': '128 GB DDR4',
            'Накопители': '4x 1.2 TB SAS',
            'Гарантия': '3 года'
        }
    },
    {
        id: '3',
        name: 'Коммутатор Cisco Catalyst 9300',
        sku: 'C9300-24P',
        category: 'network',
        categoryName: 'Сетевое оборудование',
        price: 8900,
        image: './images/products/switch-cisco-9300.jpg',
        inStock: true,
        isNew: true,
        description: 'Управляемый коммутатор 24 порта PoE+',
        specs: {
            'Порты': '24x 1GbE PoE+',
            'Uplink': '4x 10GbE SFP+',
            'PoE бюджет': '740W',
            'Управление': 'StackWise'
        }
    },
    {
        id: '4',
        name: 'Маршрутизатор MikroTik CCR1036',
        sku: 'CCR1036-8G-2S+',
        category: 'network',
        categoryName: 'Сетевое оборудование',
        price: 3200,
        image: './images/products/router-mikrotik-ccr.jpg',
        inStock: false,
        isNew: false,
        description: 'Мощный маршрутизатор для провайдеров',
        specs: {
            'Процессор': 'Tile-Gx36 1.2GHz',
            'Порты': '8x 1GbE, 2x 10GbE SFP+',
            'Производительность': '36Gbps',
            'OS': 'RouterOS Level 6'
        }
    },
    {
        id: '5',
        name: 'Система хранения Synology RS1221+',
        sku: 'RS1221+',
        category: 'storage',
        categoryName: 'СХД',
        price: 4500,
        image: './images/products/nas-synology-rs1221.jpg',
        inStock: true,
        isNew: true,
        description: 'Рэковое NAS хранилище для бизнеса',
        specs: {
            'Отсеки': '8x 3.5"/2.5"',
            'Процессор': 'AMD Ryzen V1500B',
            'Память': '4 GB DDR4',
            'Расширение': 'до 12 отсеков'
        }
    },
    {
        id: '6',
        name: 'СХД Dell PowerVault ME4024',
        sku: 'ME4024',
        category: 'storage',
        categoryName: 'СХД',
        price: 28700,
        oldPrice: 32000,
        image: './images/products/storage-dell-me4024.jpg',
        inStock: true,
        isNew: false,
        discount: 10,
        description: 'Система хранения данных с двумя контроллерами',
        specs: {
            'Отсеки': '24x 2.5" SAS/SSD',
            'Контроллеры': '2x Active-Active',
            'Протоколы': 'FC, iSCSI, SAS',
            'Гарантия': '3 года'
        }
    },
    {
        id: '7',
        name: 'ИБП APC Smart-UPS 3000VA',
        sku: 'SRT3000XLI',
        category: 'power',
        categoryName: 'Источники питания',
        price: 5600,
        image: './images/products/ups-apc-3000.jpg',
        inStock: true,
        isNew: false,
        description: 'Интерактивный ИБП для серверов',
        specs: {
            'Мощность': '3000VA / 2700W',
            'Время работы': 'до 30 мин',
            'Форма': '2U rackmount',
            'Управление': 'SmartConnect'
        }
    },
    {
        id: '8',
        name: 'Серверная стойка APC NetShelter SX',
        sku: 'AR3100',
        category: 'infrastructure',
        categoryName: 'Инфраструктура',
        price: 1800,
        image: './images/products/rack-apc-42u.jpg',
        inStock: true,
        isNew: false,
        description: '42U серверная стойка 600x1070mm',
        specs: {
            'Высота': '42U',
            'Габариты': '600x1070mm',
            'Нагрузка': '1500 кг',
            'Оснащение': 'Боковые панели, колёса'
        }
    }
];

// ==========================================
// LocalStorage for Inquiry/Cart
// ==========================================
const getInquiry = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.INQUIRY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to get inquiry:', error);
        return [];
    }
};

const saveInquiry = (inquiry) => {
    try {
        localStorage.setItem(STORAGE_KEYS.INQUIRY, JSON.stringify(inquiry));
        window.dispatchEvent(new CustomEvent('inquiryUpdated', { detail: inquiry }));
        return true;
    } catch (error) {
        console.error('Failed to save inquiry:', error);
        return false;
    }
};

const addToInquiry = (product) => {
    const inquiry = getInquiry();
    
    // Check if already exists
    if (inquiry.some(item => item.id === product.id)) {
        return false;
    }
    
    inquiry.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        image: product.image,
        quantity: 1,
        addedAt: new Date().toISOString()
    });
    
    return saveInquiry(inquiry);
};

const removeFromInquiry = (productId) => {
    const inquiry = getInquiry().filter(item => item.id !== productId);
    return saveInquiry(inquiry);
};

const updateInquiryQuantity = (productId, quantity) => {
    const inquiry = getInquiry();
    const item = inquiry.find(i => i.id === productId);
    
    if (item) {
        item.quantity = Math.max(1, parseInt(quantity) || 1);
        return saveInquiry(inquiry);
    }
    
    return false;
};

const clearInquiry = () => {
    return saveInquiry([]);
};

const getInquiryCount = () => {
    return getInquiry().reduce((total, item) => total + item.quantity, 0);
};

const getInquiryTotal = () => {
    return getInquiry().reduce((total, item) => total + (item.price * item.quantity), 0);
};

// ==========================================
// Cart Functions (if separate from inquiry)
// ==========================================
const getCart = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CART);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to get cart:', error);
        return [];
    }
};

const saveCart = (cart) => {
    try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        return true;
    } catch (error) {
        console.error('Failed to save cart:', error);
        return false;
    }
};

// ==========================================
// Filter State Management
// ==========================================
const getFilters = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.FILTERS);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        return {};
    }
};

const saveFilters = (filters) => {
    try {
        localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
        return true;
    } catch (error) {
        return false;
    }
};

const clearFilters = () => {
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
};

// ==========================================
// Search History
// ==========================================
const MAX_SEARCH_HISTORY = 10;

const getSearchHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
};

const addToSearchHistory = (query) => {
    if (!query.trim()) return false;
    
    try {
        let history = getSearchHistory();
        
        // Remove duplicates
        history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
        
        // Add to beginning
        history.unshift(query.trim());
        
        // Limit size
        if (history.length > MAX_SEARCH_HISTORY) {
            history = history.slice(0, MAX_SEARCH_HISTORY);
        }
        
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        return true;
    } catch (error) {
        return false;
    }
};

const clearSearchHistory = () => {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
};

const removeFromSearchHistory = (query) => {
    try {
        let history = getSearchHistory().filter(item => item !== query);
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        return true;
    } catch (error) {
        return false;
    }
};

// ==========================================
// User Preferences
// ==========================================
const getUserPreferences = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        return data ? JSON.parse(data) : {
            currency: 'BYN',
            itemsPerPage: 12,
            theme: 'light',
            notifications: true
        };
    } catch (error) {
        return {
            currency: 'BYN',
            itemsPerPage: 12,
            theme: 'light',
            notifications: true
        };
    }
};

const saveUserPreferences = (preferences) => {
    try {
        const current = getUserPreferences();
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify({
            ...current,
            ...preferences
        }));
        return true;
    } catch (error) {
        return false;
    }
};

// ==========================================
// Session Storage for Temporary Data
// ==========================================
const setSessionData = (key, data) => {
    try {
        sessionStorage.setItem(`plato_intel_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
};

const getSessionData = (key) => {
    try {
        const data = sessionStorage.getItem(`plato_intel_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

const removeSessionData = (key) => {
    sessionStorage.removeItem(`plato_intel_${key}`);
};

// ==========================================
// API Helpers
// ==========================================
const fetchWithCache = async (url, options = {}, cacheDuration = 300000) => {
    const cacheKey = `cache_${url}`;
    const cached = getSessionData(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    setSessionData(cacheKey, {
        data,
        timestamp: Date.now()
    });
    
    return data;
};

// ==========================================
// Export Functions
// ==========================================
export {
    // Products
    getProducts,
    getDemoProducts,
    
    // Inquiry
    getInquiry,
    saveInquiry,
    addToInquiry,
    removeFromInquiry,
    updateInquiryQuantity,
    clearInquiry,
    getInquiryCount,
    getInquiryTotal,
    
    // Cart
    getCart,
    saveCart,
    
    // Filters
    getFilters,
    saveFilters,
    clearFilters,
    
    // Search History
    getSearchHistory,
    addToSearchHistory,
    clearSearchHistory,
    removeFromSearchHistory,
    
    // Preferences
    getUserPreferences,
    saveUserPreferences,
    
    // Session
    setSessionData,
    getSessionData,
    removeSessionData,
    
    // API
    fetchWithCache,
    
    // Constants
    STORAGE_KEYS
};
