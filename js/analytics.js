/**
 * Plato-Intel Analytics
 * Яндекс.Метрика + Google Analytics + Внутренняя аналитика
 */

(function() {
    'use strict';

    // ==========================================
    // КОНФИГУРАЦИЯ - ЗАМЕНИТЕ НА СВОИ ID
    // ==========================================
    const CONFIG = {
        yandex: {
            enabled: true,
            id: 'XXXXXXXX'  // Заменить на реальный ID Яндекс.Метрики
        },
        google: {
            enabled: true,
            id: 'G-XXXXXXXXXX'  // Заменить на реальный ID Google Analytics 4
        },
        internal: {
            enabled: true,
            endpoint: '/api/analytics'  // Заглушка для будущего бэкенда
        }
    };

    // ==========================================
    // ЯНДЕКС.МЕТРИКА
    // ==========================================
    function initYandexMetrika() {
        if (!CONFIG.yandex.enabled) return;

        // Код счетчика Яндекс.Метрики
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(CONFIG.yandex.id, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            ecommerce: "dataLayer"
        });

        console.log('[Analytics] Yandex.Metrika initialized');
    }

    // ==========================================
    // GOOGLE ANALYTICS 4
    // ==========================================
    function initGoogleAnalytics() {
        if (!CONFIG.google.enabled) return;

        // Google Tag
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.google.id}`;
        document.head.appendChild(script1);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', CONFIG.google.id, {
            'send_page_view': true,
            'anonymize_ip': true,
            'allow_google_signals': true,
            'enhanced_measurement': {
                'scrolls': true,
                'outbound_clicks': true,
                'site_search': true,
                'video_engagement': true,
                'file_downloads': true
            }
        });

        console.log('[Analytics] Google Analytics initialized');
    }

    // ==========================================
    // ВНУТРЕННЯЯ АНАЛИТИКА
    // ==========================================
    const InternalAnalytics = {
        sessionId: null,
        startTime: null,
        events: [],
        
        init() {
            this.sessionId = this.generateSessionId();
            this.startTime = Date.now();
            this.loadFromStorage();
            this.trackSessionStart();
            this.setupEventListeners();
            
            // Сохранение перед закрытием
            window.addEventListener('beforeunload', () => this.saveToStorage());
            
            console.log('[Analytics] Internal analytics initialized, session:', this.sessionId);
        },

        generateSessionId() {
            return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        trackEvent(category, action, label = null, value = null) {
            const event = {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                category,
                action,
                label,
                value,
                url: window.location.href,
                referrer: document.referrer
            };
            
            this.events.push(event);
            
            // Отправка в Яндекс
            if (window.ym) {
                ym(CONFIG.yandex.id, 'reachGoal', action, { label, value });
            }
            
            // Отправка в Google
            if (window.gtag) {
                gtag('event', action, {
                    event_category: category,
                    event_label: label,
                    value: value
                });
            }
            
            console.log('[Analytics] Event tracked:', event);
        },

        trackSessionStart() {
            this.trackEvent('session', 'start', navigator.userAgent);
        },

        trackPageView(pageName) {
            this.trackEvent('pageview', 'view', pageName);
        },

        trackProductView(productId, productName, category) {
            this.trackEvent('product', 'view', productName, productId);
            
            // E-commerce data for Yandex
            if (window.dataLayer) {
                window.dataLayer.push({
                    ecommerce: {
                        detail: {
                            products: [{
                                id: productId,
                                name: productName,
                                category: category
                            }]
                        }
                    }
                });
            }
        },

        trackAddToCart(productId, productName, price, quantity = 1) {
            this.trackEvent('cart', 'add', productName, price);
            
            if (window.dataLayer) {
                window.dataLayer.push({
                    ecommerce: {
                        add: {
                            products: [{
                                id: productId,
                                name: productName,
                                price: price,
                                quantity: quantity
                            }]
                        }
                    }
                });
            }
        },

        trackFormSubmit(formName, success = true) {
            this.trackEvent('form', success ? 'submit_success' : 'submit_error', formName);
        },

        trackPhoneClick(phoneNumber) {
            this.trackEvent('contact', 'phone_click', phoneNumber);
        },

        trackEmailClick(email) {
            this.trackEvent('contact', 'email_click', email);
        },

        trackChatOpen() {
            this.trackEvent('chat', 'open');
        },

        trackChatMessage() {
            this.trackEvent('chat', 'message_sent');
        },

        trackScroll(depth) {
            this.trackEvent('scroll', 'depth_reached', null, depth);
        },

        trackTimeOnPage() {
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            this.trackEvent('engagement', 'time_on_page', null, timeSpent);
        },

        setupEventListeners() {
            // Клики по телефонам
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                link.addEventListener('click', () => {
                    this.trackPhoneClick(link.href.replace('tel:', ''));
                });
            });

            // Клики по email
            document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
                link.addEventListener('click', () => {
                    this.trackEmailClick(link.href.replace('mailto:', ''));
                });
            });

            // Отслеживание глубины скролла
            let scrollTracked = {};
            window.addEventListener('scroll', () => {
                const scrollPercent = Math.floor((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                
                [25, 50, 75, 90, 100].forEach(threshold => {
                    if (scrollPercent >= threshold && !scrollTracked[threshold]) {
                        scrollTracked[threshold] = true;
                        this.trackScroll(threshold);
                    }
                });
            });

            // Отслеживание времени на странице
            setInterval(() => this.trackTimeOnPage(), 30000); // Каждые 30 секунд

            // Отслеживание исходящих ссылок
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                if (!link.href.includes(window.location.hostname)) {
                    link.addEventListener('click', () => {
                        this.trackEvent('outbound', 'click', link.href);
                    });
                }
            });
        },

        saveToStorage() {
            const data = {
                sessionId: this.sessionId,
                events: this.events,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('plato_analytics', JSON.stringify(data));
        },

        loadFromStorage() {
            const saved = localStorage.getItem('plato_analytics');
            if (saved) {
                const data = JSON.parse(saved);
                // Восстановление событий если сессия та же
                if (data.sessionId === this.sessionId) {
                    this.events = data.events || [];
                }
            }
        },

        // Получение статистики для админки
        getStats() {
            return {
                sessionId: this.sessionId,
                eventsCount: this.events.length,
                events: this.events,
                sessionDuration: Math.floor((Date.now() - this.startTime) / 1000)
            };
        }
    };

    // ==========================================
    // ИНИЦИАЛИЗАЦИЯ
    // ==========================================
    function init() {
        initYandexMetrika();
        initGoogleAnalytics();
        
        if (CONFIG.internal.enabled) {
            InternalAnalytics.init();
        }

        // Глобальный доступ
        window.PlatoAnalytics = InternalAnalytics;
        
        console.log('[Analytics] All systems initialized');
    }

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();