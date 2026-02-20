/* ==========================================================================
   VoiceMaster Pro - Main JavaScript File
   Version: 1.0.0
   Author: VoiceMaster Pro
   Description: Core functionality, navigation, animations, and utilities
   ========================================================================== */

(function() {
    "use strict";

    /* ----------------------------------------------------------------------
       1. GLOBAL VARIABLES & CONSTANTS
    ---------------------------------------------------------------------- */

    // DOM Elements
    const body = document.body;
    const html = document.documentElement;
    const header = document.querySelector('.header');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const closeMenuBtn = document.querySelector('.close-menu');
    const backToTopBtn = document.getElementById('backToTop');
    const preloader = document.querySelector('.preloader');
    
    // Breakpoints
    const BREAKPOINTS = {
        mobile: 640,
        tablet: 768,
        laptop: 1024,
        desktop: 1280,
        wide: 1536
    };

    // State
    let isMenuOpen = false;
    let scrollPosition = 0;
    let resizeTimer;

    /* ----------------------------------------------------------------------
       2. UTILITY FUNCTIONS
    ---------------------------------------------------------------------- */

    /**
     * Debounce function to limit execution rate
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Throttle function to limit execution rate
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Check if element is in viewport
     */
    const isInViewport = (element, offset = 0) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset || document.documentElement.clientHeight - offset) &&
            rect.bottom >= 0
        );
    };

    /**
     * Smooth scroll to element
     */
    const smoothScroll = (target, duration = 800) => {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    };

    /**
     * Format time for audio player
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    /* ----------------------------------------------------------------------
       3. PRELOADER
    ---------------------------------------------------------------------- */

    const initPreloader = () => {
        if (!preloader) return;

        // Hide preloader when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 800); // Show preloader for at least 800ms
        });

        // Fallback: hide preloader after 3 seconds if load event doesn't fire
        setTimeout(() => {
            if (preloader && !preloader.classList.contains('hidden')) {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 3000);
    };

    /* ----------------------------------------------------------------------
       4. HEADER & NAVIGATION
    ---------------------------------------------------------------------- */

    const initHeader = () => {
        if (!header) return;

        // Change header style on scroll
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('header-sticky');
            } else {
                header.classList.remove('header-sticky');
            }
        };

        window.addEventListener('scroll', throttle(handleScroll, 100));
        handleScroll(); // Initial check
    };

    /* ----------------------------------------------------------------------
       5. HAMBURGER MENU (MOBILE NAVIGATION)
    ---------------------------------------------------------------------- */

    const initMobileMenu = () => {
        if (!hamburgerBtn || !mobileNav) return;

        // Open menu
        const openMenu = () => {
            hamburgerBtn.classList.add('active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            scrollPosition = window.pageYOffset;
            document.body.style.top = `-${scrollPosition}px`;
        };

        // Close menu
        const closeMenu = () => {
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition);
        };

        // Toggle menu
        const toggleMenu = () => {
            if (mobileNav.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        // Event listeners
        hamburgerBtn.addEventListener('click', toggleMenu);

        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', closeMenu);
        }

        // Close menu when clicking outside
        mobileNav.addEventListener('click', (e) => {
            if (e.target === mobileNav) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close menu on window resize (if desktop)
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth >= BREAKPOINTS.laptop && mobileNav.classList.contains('active')) {
                closeMenu();
            }
        }, 250));

        // Prevent body scroll when menu is open
        window.addEventListener('scroll', () => {
            if (mobileNav.classList.contains('active')) {
                e.preventDefault();
            }
        }, { passive: false });
    };

    /* ----------------------------------------------------------------------
       6. MOBILE DROPDOWN TOGGLE
    ---------------------------------------------------------------------- */

    const initMobileDropdowns = () => {
        const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = this.closest('.mobile-dropdown');
                const isActive = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                document.querySelectorAll('.mobile-dropdown.active').forEach(activeDropdown => {
                    if (activeDropdown !== dropdown) {
                        activeDropdown.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
                
                // Update ARIA attributes
                const expanded = dropdown.classList.contains('active');
                this.setAttribute('aria-expanded', expanded);
            });
        });
    };

    /* ----------------------------------------------------------------------
       7. DROPDOWN MENUS (DESKTOP)
    ---------------------------------------------------------------------- */

    const initDropdowns = () => {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (!link || !menu) return;
            
            // Handle keyboard navigation
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const firstItem = menu.querySelector('.dropdown-item a');
                    if (firstItem) firstItem.focus();
                }
            });
            
            // Handle focus management
            menu.addEventListener('keydown', (e) => {
                const items = Array.from(menu.querySelectorAll('.dropdown-item a'));
                const currentIndex = items.indexOf(document.activeElement);
                
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % items.length;
                        items[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = (currentIndex - 1 + items.length) % items.length;
                        items[prevIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        items[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        items[items.length - 1].focus();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        link.focus();
                        dropdown.classList.remove('hover');
                        break;
                }
            });
            
            // Handle hover intent (delay for better UX)
            let hoverTimeout;
            
            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    dropdown.classList.add('hover');
                    link.setAttribute('aria-expanded', 'true');
                }, 100);
            });
            
            dropdown.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    dropdown.classList.remove('hover');
                    link.setAttribute('aria-expanded', 'false');
                }, 200);
            });
        });
    };

    /* ----------------------------------------------------------------------
       8. BACK TO TOP BUTTON
    ---------------------------------------------------------------------- */

    const initBackToTop = () => {
        if (!backToTopBtn) return;

        const toggleBackToTop = () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', throttle(toggleBackToTop, 100));
        toggleBackToTop(); // Initial check

        // Smooth scroll to top
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    /* ----------------------------------------------------------------------
       9. ACTIVE LINK HIGHLIGHTING
    ---------------------------------------------------------------------- */

    const initActiveLinks = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
                
                // Also activate parent dropdown if in mobile
                const mobileDropdown = link.closest('.mobile-dropdown');
                if (mobileDropdown) {
                    mobileDropdown.classList.add('active');
                }
            }
        });
    };

    /* ----------------------------------------------------------------------
       10. SCROLL ANIMATIONS (AOS FALLBACK)
    ---------------------------------------------------------------------- */

    const initScrollAnimations = () => {
        // If AOS is loaded, don't run fallback
        if (typeof AOS !== 'undefined') return;
        
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        const checkAnimations = () => {
            animatedElements.forEach(el => {
                if (isInViewport(el, 100) && !el.classList.contains('aos-animate')) {
                    el.classList.add('aos-animate');
                }
            });
        };
        
        window.addEventListener('scroll', throttle(checkAnimations, 100));
        window.addEventListener('load', checkAnimations);
        checkAnimations(); // Initial check
    };

    /* ----------------------------------------------------------------------
       11. COUNTER ANIMATION
    ---------------------------------------------------------------------- */

    const initCounters = () => {
        const counters = document.querySelectorAll('.stat-number, .counter-number');
        
        if (!counters.length) return;
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.innerText.replace(/[^0-9]/g, ''));
            if (isNaN(target)) return;
            
            let current = 0;
            const increment = target / 50; // Divide animation into 50 steps
            const duration = 2000; // 2 seconds
            const stepTime = duration / 50;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current) + (counter.innerText.includes('+') ? '+' : '');
                    setTimeout(updateCounter, stepTime);
                } else {
                    counter.innerText = target + (counter.innerText.includes('+') ? '+' : '');
                }
            };
            
            updateCounter();
        };
        
        // Intersection Observer for counters
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    animateCounter(counter);
                    observer.unobserve(counter); // Only animate once
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    };

    /* ----------------------------------------------------------------------
       12. HEADER SCROLL EFFECT
    ---------------------------------------------------------------------- */

    const initHeaderScroll = () => {
        if (!header) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', throttle(() => {
            const currentScroll = window.pageYOffset;
            
            // Hide/show header on scroll
            if (currentScroll > lastScroll && currentScroll > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        }, 100));
    };

    /* ----------------------------------------------------------------------
       13. TOUCH DEVICE DETECTION
    ---------------------------------------------------------------------- */

    const initTouchDetection = () => {
        const isTouchDevice = ('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0) || 
            (navigator.msMaxTouchPoints > 0);
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
            
            // Disable hover dropdowns on touch devices
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                dropdown.addEventListener('click', function(e) {
                    if (e.target.closest('.dropdown-menu')) return;
                    
                    const menu = this.querySelector('.dropdown-menu');
                    if (menu) {
                        e.preventDefault();
                        const isActive = this.classList.contains('active');
                        
                        // Close all other dropdowns
                        document.querySelectorAll('.dropdown.active').forEach(active => {
                            if (active !== this) active.classList.remove('active');
                        });
                        
                        this.classList.toggle('active');
                    }
                });
            });
        }
    };

    /* ----------------------------------------------------------------------
       14. IMAGE LAZY LOADING
    ---------------------------------------------------------------------- */

    const initLazyLoading = () => {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
        }
    };

    /* ----------------------------------------------------------------------
       15. FORM VALIDATION (BASIC)
    ---------------------------------------------------------------------- */

    const initFormValidation = () => {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let isValid = true;
                const requiredFields = form.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        
                        // Add error message
                        let errorMsg = field.parentNode.querySelector('.error-message');
                        if (!errorMsg) {
                            errorMsg = document.createElement('span');
                            errorMsg.className = 'error-message';
                            errorMsg.textContent = 'This field is required';
                            field.parentNode.appendChild(errorMsg);
                        }
                    } else {
                        field.classList.remove('error');
                        const errorMsg = field.parentNode.querySelector('.error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                });
                
                // Email validation
                const emailFields = form.querySelectorAll('input[type="email"]');
                emailFields.forEach(field => {
                    if (field.value.trim() && !isValidEmail(field.value)) {
                        isValid = false;
                        field.classList.add('error');
                        
                        let errorMsg = field.parentNode.querySelector('.error-message');
                        if (!errorMsg) {
                            errorMsg = document.createElement('span');
                            errorMsg.className = 'error-message';
                            errorMsg.textContent = 'Please enter a valid email address';
                            field.parentNode.appendChild(errorMsg);
                        }
                    }
                });
                
                if (isValid) {
                    // Simulate form submission
                    const submitBtn = form.querySelector('[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                    
                    // Simulate API call
                    setTimeout(() => {
                        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                        submitBtn.classList.add('btn-success');
                        
                        // Reset form
                        setTimeout(() => {
                            form.reset();
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalText;
                            submitBtn.classList.remove('btn-success');
                        }, 2000);
                    }, 1500);
                }
            });
        });
    };

    /**
     * Validate email format
     */
    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    /* ----------------------------------------------------------------------
       16. DETECT BROWSER FEATURES
    ---------------------------------------------------------------------- */

    const initFeatureDetection = () => {
        // Add classes for feature support
        const features = {
            webp: checkWebpSupport(),
            flexgap: checkFlexGapSupport(),
            cssgrid: CSS.supports('display', 'grid'),
            backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
            objectFit: 'objectFit' in document.documentElement.style
        };
        
        Object.keys(features).forEach(feature => {
            if (features[feature]) {
                document.documentElement.classList.add(`has-${feature}`);
            } else {
                document.documentElement.classList.add(`no-${feature}`);
            }
        });
    };

    /**
     * Check WebP support
     */
    const checkWebpSupport = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    };

    /**
     * Check flex gap support
     */
    const checkFlexGapSupport = () => {
        const flex = document.createElement('div');
        flex.style.display = 'flex';
        flex.style.gap = '1px';
        flex.appendChild(document.createElement('div'));
        flex.appendChild(document.createElement('div'));
        document.body.appendChild(flex);
        const isSupported = flex.scrollHeight === 1;
        document.body.removeChild(flex);
        return isSupported;
    };

    /* ----------------------------------------------------------------------
       17. PARALLAX EFFECT
    ---------------------------------------------------------------------- */

    const initParallax = () => {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;
        
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        }, 50));
    };

    /* ----------------------------------------------------------------------
       18. WINDOW RESIZE HANDLER
    ---------------------------------------------------------------------- */

    const initResizeHandler = () => {
        window.addEventListener('resize', debounce(() => {
            // Reset body styles when resizing from mobile to desktop
            if (window.innerWidth >= BREAKPOINTS.laptop) {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                
                // Close mobile menu if open
                if (mobileNav && mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    hamburgerBtn.classList.remove('active');
                }
            }
            
            // Set CSS custom property for viewport height (fix for mobile)
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }, 250));
    };

    /* ----------------------------------------------------------------------
       19. INITIALIZE ALL FUNCTIONS
    ---------------------------------------------------------------------- */

    const init = () => {
        // Initialize all modules
        initPreloader();
        initHeader();
        initMobileMenu();
        initMobileDropdowns();
        initDropdowns();
        initBackToTop();
        initActiveLinks();
        initScrollAnimations();
        initCounters();
        initHeaderScroll();
        initTouchDetection();
        initLazyLoading();
        initFormValidation();
        initFeatureDetection();
        initParallax();
        initResizeHandler();
        
        // Log initialization
        console.log('VoiceMaster Pro: Main JS initialized');
    };

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init(); // DOM is already loaded
    }

    /* ----------------------------------------------------------------------
       20. EXPOSE UTILITIES TO GLOBAL SCOPE (if needed)
    ---------------------------------------------------------------------- */

    window.VoiceMasterPro = {
        smoothScroll,
        formatTime,
        isInViewport,
        debounce,
        throttle,
        BREAKPOINTS
    };

})();

// RTL Toggle functionality for both desktop and mobile
(function() {
    const rtlBtn = document.getElementById('rtlToggle');
    const mobileRtlBtn = document.getElementById('mobileRtlToggle');
    
    function setRTL(isRTL) {
        if (isRTL) {
            document.documentElement.setAttribute('dir', 'rtl');
            localStorage.setItem('rtl', 'true');
        } else {
            document.documentElement.removeAttribute('dir');
            localStorage.setItem('rtl', 'false');
        }
    }
    
    // Check saved RTL preference
    const savedRTL = localStorage.getItem('rtl') === 'true';
    setRTL(savedRTL);
    
    // Add click event to desktop RTL button
    if (rtlBtn) {
        rtlBtn.addEventListener('click', function() {
            const currentRTL = document.documentElement.getAttribute('dir') === 'rtl';
            setRTL(!currentRTL);
        });
    }
    
    // Add click event to mobile RTL button
    if (mobileRtlBtn) {
        mobileRtlBtn.addEventListener('click', function() {
            const currentRTL = document.documentElement.getAttribute('dir') === 'rtl';
            setRTL(!currentRTL);
        });
    }
})();
