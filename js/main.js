/**
 * Plato-Intel v2 - Main JavaScript
 * Core functionality for the website
 */

// ==========================================
// Mobile Menu Toggle
// ==========================================
const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (!menuToggle || !mobileMenu) return;

    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        menuToggle.classList.toggle('is-active', isOpen);
        body.classList.toggle('menu-open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target) && mobileMenu.classList.contains('is-open')) {
            toggleMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
            toggleMenu();
        }
    });

    // Close menu when clicking on mobile nav links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('is-open')) {
                toggleMenu();
            }
        });
    });
};

// ==========================================
// Sticky Header on Scroll
// ==========================================
const initStickyHeader = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    const stickyOffset = 100;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        // Add/remove sticky class
        if (currentScrollY > stickyOffset) {
            header.classList.add('is-sticky');
        } else {
            header.classList.remove('is-sticky');
        }

        // Hide/show header on scroll direction (optional)
        if (currentScrollY > lastScrollY && currentScrollY > 300) {
            header.classList.add('is-hidden');
        } else {
            header.classList.remove('is-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
};

// ==========================================
// Smooth Scroll to Sections
// ==========================================
const initSmoothScroll = () => {
    // Handle anchor links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Update URL hash without jumping
        history.pushState(null, '', targetId);
    });

    // Handle scroll on page load with hash
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            setTimeout(() => {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
};

// ==========================================
// Current Year in Footer
// ==========================================
const initCurrentYear = () => {
    const yearElements = document.querySelectorAll('.current-year, [data-year]');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
};

// ==========================================
// Phone Number Formatter
// ==========================================
const initPhoneFormatter = () => {
    const formatPhoneNumber = (phone) => {
        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Format based on length
        if (cleaned.length === 12 && cleaned.startsWith('375')) {
            // Belarus format: +375 XX XXX XX XX
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
        } else if (cleaned.length === 11 && cleaned.startsWith('7')) {
            // Russia format: +7 XXX XXX XX XX
            return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
        }
        
        return phone;
    };

    // Format phone elements
    document.querySelectorAll('[data-phone]').forEach(el => {
        const rawPhone = el.dataset.phone || el.textContent;
        const formatted = formatPhoneNumber(rawPhone);
        
        if (!el.dataset.phone) {
            el.dataset.phone = rawPhone.replace(/\D/g, '');
        }
        
        // Only format if not an input
        if (el.tagName !== 'INPUT') {
            el.textContent = formatted;
        }
    });

    // Format tel: links
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        const rawPhone = link.getAttribute('href').replace('tel:', '');
        link.dataset.phone = rawPhone.replace(/\D/g, '');
    });
};

// ==========================================
// Active Nav Link Highlighting
// ==========================================
const initActiveNavLinks = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link, .mobile-menu__link');
    
    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    const linkHref = link.getAttribute('href');
                    if (linkHref === `#${id}`) {
                        link.classList.add('is-active');
                    } else {
                        link.classList.remove('is-active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));

    // Also highlight on scroll for edge cases
    let ticking = false;
    
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollPos = window.scrollY + (window.innerHeight / 3);
                
                sections.forEach(section => {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;
                    const id = section.getAttribute('id');
                    
                    if (scrollPos >= top && scrollPos < top + height) {
                        navLinks.forEach(link => {
                            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
                        });
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
};

// ==========================================
// Back to Top Button
// ==========================================
const initBackToTop = () => {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;

    const toggleVisibility = () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

// ==========================================
// External Links Handler
// ==========================================
const initExternalLinks = () => {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.hostname.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
};

// ==========================================
// Initialize Everything
// ==========================================
const initMain = () => {
    initMobileMenu();
    initStickyHeader();
    initSmoothScroll();
    initCurrentYear();
    initPhoneFormatter();
    initActiveNavLinks();
    initBackToTop();
    initExternalLinks();
};

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
} else {
    initMain();
}

// Export for use in other modules
export {
    initMain,
    initMobileMenu,
    initStickyHeader,
    initSmoothScroll,
    initCurrentYear,
    initPhoneFormatter,
    initActiveNavLinks
};
