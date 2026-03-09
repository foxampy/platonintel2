/**
 * Plato-Intel v2 - Animations JavaScript
 * Animations and visual effects
 */

// ==========================================
// Scroll Reveal Animation
// ==========================================
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    if (!revealElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.revealDelay || index * 100;
                
                setTimeout(() => {
                    entry.target.classList.add('is-revealed');
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });
};

// ==========================================
// Counter Animation
// ==========================================
const initCounterAnimation = () => {
    const counters = document.querySelectorAll('[data-counter]');
    
    if (!counters.length) return;

    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const startTime = performance.now();
        
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOut(progress);
            const current = Math.floor(start + (target - start) * easedProgress);
            
            element.textContent = formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = formatNumber(target);
            }
        };
        
        requestAnimationFrame(updateCounter);
    };

    const formatNumber = (num) => {
        return num.toLocaleString('ru-RU');
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.counter);
                const duration = parseInt(entry.target.dataset.counterDuration) || 2000;
                animateCounter(entry.target, target, duration);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
};

// ==========================================
// Parallax Effect for Hero
// ==========================================
const initParallax = () => {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (!parallaxElements.length) return;

    let ticking = false;

    const updateParallax = () => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = scrollY * speed;
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
};

// ==========================================
// Card Hover Effects
// ==========================================
const initCardHoverEffects = () => {
    const cards = document.querySelectorAll('.card-hover, [data-hover-effect]');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('is-hovered');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-hovered');
        });
        
        // Touch support
        card.addEventListener('touchstart', () => {
            card.classList.add('is-hovered');
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            setTimeout(() => card.classList.remove('is-hovered'), 300);
        });
    });
};

// ==========================================
// Accordion Functionality
// ==========================================
const initAccordions = () => {
    const accordions = document.querySelectorAll('.accordion');
    
    accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.accordion__item');
        const allowMultiple = accordion.dataset.multiple === 'true';
        
        items.forEach(item => {
            const header = item.querySelector('.accordion__header');
            const content = item.querySelector('.accordion__content');
            
            if (!header || !content) return;
            
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');
                
                // Close others if not allowing multiple
                if (!allowMultiple && !isOpen) {
                    items.forEach(i => {
                        i.classList.remove('is-open');
                        const c = i.querySelector('.accordion__content');
                        if (c) c.style.maxHeight = null;
                    });
                }
                
                // Toggle current
                item.classList.toggle('is-open');
                
                if (item.classList.contains('is-open')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = null;
                }
            });
        });
    });
};

// ==========================================
// Tab Switching
// ==========================================
const initTabs = () => {
    const tabContainers = document.querySelectorAll('[data-tabs]');
    
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('[data-tab]');
        const panels = container.querySelectorAll('[data-tab-panel]');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;
                
                // Update tab states
                tabs.forEach(t => t.classList.remove('is-active'));
                tab.classList.add('is-active');
                
                // Update panel visibility with fade animation
                panels.forEach(panel => {
                    if (panel.dataset.tabPanel === targetPanel) {
                        panel.classList.add('is-active');
                        panel.style.opacity = '0';
                        requestAnimationFrame(() => {
                            panel.style.opacity = '1';
                        });
                    } else {
                        panel.classList.remove('is-active');
                    }
                });
            });
        });
    });
};

// ==========================================
// Mobile Menu Slide Animation
// ==========================================
const initMobileMenuAnimation = () => {
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!mobileMenu || !menuToggle) return;

    // Add animation classes
    mobileMenu.classList.add('mobile-menu--animated');
    
    const updateAnimation = () => {
        if (mobileMenu.classList.contains('is-open')) {
            mobileMenu.style.transform = 'translateX(0)';
            mobileMenu.style.opacity = '1';
        } else {
            mobileMenu.style.transform = 'translateX(100%)';
            mobileMenu.style.opacity = '0';
        }
    };

    // Observer to detect class changes
    const observer = new MutationObserver(updateAnimation);
    observer.observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
};

// ==========================================
// Loading Spinner
// ==========================================
const showLoading = (container, message = 'Загрузка...') => {
    const spinner = document.createElement('div');
    spinner.className = 'loading-overlay';
    spinner.innerHTML = `
        <div class="loading-spinner"></div>
        <span class="loading-message">${message}</span>
    `;
    
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
    if (container) {
        container.style.position = 'relative';
        container.appendChild(spinner);
    }
    
    return {
        hide: () => spinner.remove(),
        updateMessage: (newMessage) => {
            spinner.querySelector('.loading-message').textContent = newMessage;
        }
    };
};

// ==========================================
// Toast Notifications
// ==========================================
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

const showToast = (message, type = 'info', duration = 4000) => {
    const icons = {
        success: '<path d="M20 6 9 17l-5-5"/>',
        error: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
        warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <svg class="toast__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${icons[type]}
        </svg>
        <span class="toast__message">${message}</span>
        <button class="toast__close" aria-label="Закрыть">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });

    // Auto remove
    const removeTimeout = setTimeout(() => removeToast(toast), duration);

    // Close button
    toast.querySelector('.toast__close').addEventListener('click', () => {
        clearTimeout(removeTimeout);
        removeToast(toast);
    });

    return toast;
};

const removeToast = (toast) => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    
    // Fallback removal
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 500);
};

// ==========================================
// Page Transitions
// ==========================================
const initPageTransitions = () => {
    // Fade in page content
    document.body.classList.add('page-transition');
    
    requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
    });

    // Handle internal link clicks for smooth transitions
    document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't intercept if modifier keys are pressed
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            
            e.preventDefault();
            
            // Fade out
            document.body.classList.remove('page-loaded');
            
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        });
    });
};

// ==========================================
// Stagger Animation for Lists
// ==========================================
const initStaggerAnimations = () => {
    const staggerContainers = document.querySelectorAll('[data-stagger]');
    
    staggerContainers.forEach(container => {
        const items = container.children;
        const delay = parseInt(container.dataset.stagger) || 100;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Array.from(items).forEach((item, index) => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * delay);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(container);
    });
};

// ==========================================
// Magnetic Button Effect
// ==========================================
const initMagneticButtons = () => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const buttons = document.querySelectorAll('.btn--magnetic, [data-magnetic]');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
};

// ==========================================
// Image Lazy Loading with Fade
// ==========================================
const initLazyImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    
                    img.onload = () => {
                        img.classList.add('is-loaded');
                    };
                }
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    images.forEach(img => {
        img.classList.add('lazy-image');
        imageObserver.observe(img);
    });
};

// ==========================================
// Ripple Effect for Buttons
// ==========================================
const initRippleEffect = () => {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn--ripple, [data-ripple]');
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    });
};

// ==========================================
// Initialize All Animations
// ==========================================
const initAnimations = () => {
    initScrollReveal();
    initCounterAnimation();
    initParallax();
    initCardHoverEffects();
    initAccordions();
    initTabs();
    initMobileMenuAnimation();
    initPageTransitions();
    initStaggerAnimations();
    initMagneticButtons();
    initLazyImages();
    initRippleEffect();
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

// Export functions for use in other modules
export {
    initAnimations,
    showToast,
    showLoading,
    initScrollReveal,
    initCounterAnimation,
    initParallax,
    initAccordions,
    initTabs
};
