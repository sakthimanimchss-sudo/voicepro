/* ==========================================================================
   VoiceMaster Pro - Homepage Specific JavaScript
   Version: 1.0.0
   Author: VoiceMaster Pro
   Description: Homepage animations, counters, and interactive elements
   ========================================================================== */

(function() {
    "use strict";

    /* ----------------------------------------------------------------------
       1. HOMEPAGE INITIALIZATION
    ---------------------------------------------------------------------- */

    const initHomepage = () => {
        // Only run on homepage
        if (!document.body.classList.contains('home-page') && 
            !window.location.pathname.includes('index.html') && 
            window.location.pathname !== '/' && 
            window.location.pathname !== '') {
            return;
        }
        
        initHeroAnimations();
        initStatCounters();
        initTestimonialSlider();
        initServiceHoverEffects();
        initAudioPreviews();
        initParallaxEffects();
        initTypewriter();
        
        console.log('Homepage initialized');
    };

    /* ----------------------------------------------------------------------
       2. HERO ANIMATIONS
    ---------------------------------------------------------------------- */

    const initHeroAnimations = () => {
        const heroTitle = document.querySelector('.hero-title');
        const heroTag = document.querySelector('.hero-tag');
        const heroButtons = document.querySelector('.hero-buttons');
        const heroStats = document.querySelector('.hero-stats');
        const heroImage = document.querySelector('.hero-image-wrapper');
        
        if (heroTag) {
            heroTag.classList.add('animate-fade-in-down');
        }
        
        if (heroTitle) {
            heroTitle.classList.add('animate-fade-in-left');
        }
        
        if (heroButtons) {
            heroButtons.classList.add('animate-fade-in-up');
        }
        
        if (heroStats) {
            heroStats.classList.add('animate-fade-in-up');
        }
        
        if (heroImage) {
            heroImage.classList.add('animate-float');
        }
        
        // Animate hero badge
        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
            setTimeout(() => {
                heroBadge.classList.add('animate-scale-in');
            }, 500);
        }
    };

    /* ----------------------------------------------------------------------
       3. STAT COUNTERS
    ---------------------------------------------------------------------- */

    const initStatCounters = () => {
        const statNumbers = document.querySelectorAll('.hero-stats .stat-number, .stats-section .stat-number');
        
        if (!statNumbers.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    animateCounter(counter);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(counter => observer.observe(counter));
    };

    const animateCounter = (counter) => {
        const target = parseInt(counter.innerText.replace(/[^0-9]/g, ''));
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current) + (counter.innerText.includes('+') ? '+' : '');
                setTimeout(updateCounter, stepTime);
            } else {
                counter.innerText = target + (counter.innerText.includes('+') ? '+' : '');
                
                // Add animation class
                counter.classList.add('counter-animate');
                setTimeout(() => {
                    counter.classList.remove('counter-animate');
                }, 500);
            }
        };
        
        updateCounter();
    };

    /* ----------------------------------------------------------------------
       4. TESTIMONIAL SLIDER
    ---------------------------------------------------------------------- */

    const initTestimonialSlider = () => {
        const slider = document.querySelector('.testimonials-slider');
        if (!slider) return;
        
        let currentIndex = 0;
        const testimonials = slider.querySelectorAll('.testimonial-card');
        
        if (testimonials.length <= 2) return;
        
        // Create navigation dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        
        for (let i = 0; i < testimonials.length; i++) {
            const dot = document.createElement('button');
            dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        
        slider.parentNode.appendChild(dotsContainer);
        
        // Create navigation arrows
        const prevArrow = document.createElement('button');
        prevArrow.className = 'slider-arrow prev';
        prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevArrow.setAttribute('aria-label', 'Previous testimonial');
        prevArrow.addEventListener('click', prevSlide);
        
        const nextArrow = document.createElement('button');
        nextArrow.className = 'slider-arrow next';
        nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextArrow.setAttribute('aria-label', 'Next testimonial');
        nextArrow.addEventListener('click', nextSlide);
        
        slider.parentNode.appendChild(prevArrow);
        slider.parentNode.appendChild(nextArrow);
        
        // Auto play
        let autoPlayInterval = setInterval(nextSlide, 5000);
        
        // Pause on hover
        slider.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(nextSlide, 5000);
        });
        
        function goToSlide(index) {
            currentIndex = index;
            
            // Update slider position
            testimonials.forEach((testimonial, i) => {
                testimonial.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
            });
            
            // Update dots
            document.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % testimonials.length;
            goToSlide(currentIndex);
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            goToSlide(currentIndex);
        }
        
        // Initialize
        goToSlide(0);
    };

    /* ----------------------------------------------------------------------
       5. SERVICE HOVER EFFECTS
    ---------------------------------------------------------------------- */

    const initServiceHoverEffects = () => {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.service-icon i');
                if (icon) {
                    icon.style.animation = 'iconSpin 0.5s ease-in-out';
                    
                    setTimeout(() => {
                        icon.style.animation = '';
                    }, 500);
                }
            });
        });
    };

    /* ----------------------------------------------------------------------
       6. AUDIO PREVIEWS
    ---------------------------------------------------------------------- */

    const initAudioPreviews = () => {
        const previewButtons = document.querySelectorAll('.audio-preview-btn, .service-audio-preview .btn');
        
        previewButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const audioSrc = this.dataset.audio || 
                                this.closest('.service-card')?.querySelector('[data-audio]')?.dataset.audio ||
                                'assets/audio/demo.mp3';
                
                const icon = this.querySelector('i');
                const isPlaying = icon?.classList.contains('fa-pause');
                
                // Stop all other audio
                document.querySelectorAll('audio').forEach(audio => {
                    audio.pause();
                    audio.currentTime = 0;
                });
                
                // Reset all icons
                document.querySelectorAll('.fa-pause').forEach(pauseIcon => {
                    pauseIcon.classList.remove('fa-pause');
                    pauseIcon.classList.add('fa-play');
                });
                
                if (!isPlaying) {
                    const audio = new Audio(audioSrc);
                    audio.play();
                    
                    if (icon) {
                        icon.classList.remove('fa-play');
                        icon.classList.add('fa-pause');
                    }
                    
                    audio.addEventListener('ended', () => {
                        if (icon) {
                            icon.classList.remove('fa-pause');
                            icon.classList.add('fa-play');
                        }
                    });
                    
                    // Store audio in dataset
                    this.dataset.audioInstance = audio;
                } else {
                    const audio = this.dataset.audioInstance;
                    if (audio) {
                        audio.pause();
                        if (icon) {
                            icon.classList.remove('fa-pause');
                            icon.classList.add('fa-play');
                        }
                    }
                }
            });
        });
    };

    /* ----------------------------------------------------------------------
       7. PARALLAX EFFECTS
    ---------------------------------------------------------------------- */

    const initParallaxEffects = () => {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBg = heroSection.querySelector('.hero-bg-elements');
            
            if (heroBg) {
                heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
            
            const heroImage = heroSection.querySelector('.hero-image-wrapper');
            if (heroImage) {
                heroImage.style.transform = `perspective(1000px) rotateY(-5deg) rotateX(${5 + scrolled * 0.02}deg) translateY(${scrolled * 0.1}px)`;
            }
        });
    };

    /* ----------------------------------------------------------------------
       8. TYPEWRITER EFFECT
    ---------------------------------------------------------------------- */

    const initTypewriter = () => {
        const typewriterElement = document.querySelector('.hero-subtitle');
        if (!typewriterElement) return;
        
        const originalText = typewriterElement.textContent;
        typewriterElement.textContent = '';
        typewriterElement.style.visibility = 'visible';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < originalText.length) {
                typewriterElement.textContent += originalText.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 50);
    };

    /* ----------------------------------------------------------------------
       9. SCROLL REVEAL
    ---------------------------------------------------------------------- */

    const initScrollReveal = () => {
        const revealElements = document.querySelectorAll('.service-card, .step, .testimonial-card, .studio-content, .studio-images');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    if (entry.target.classList.contains('service-card')) {
                        const delay = parseInt(entry.target.dataset.aosDelay) || 0;
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, delay);
                    }
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
        
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    };

    /* ----------------------------------------------------------------------
       10. LAZY LOAD HERO IMAGE
    ---------------------------------------------------------------------- */

    const initLazyHeroImage = () => {
        const heroImage = document.querySelector('.hero-image img');
        if (!heroImage) return;
        
        const imgSrc = heroImage.dataset.src || heroImage.src;
        
        // Create a new image to preload
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            heroImage.src = imgSrc;
            heroImage.classList.add('loaded');
        };
    };

    /* ----------------------------------------------------------------------
       11. ANIMATE ON SCROLL (AOS CUSTOM)
    ---------------------------------------------------------------------- */

    const initCustomAOS = () => {
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animation = el.dataset.aos;
                    const delay = el.dataset.aosDelay || 0;
                    const duration = el.dataset.aosDuration || 800;
                    
                    setTimeout(() => {
                        el.classList.add(`animate-${animation}`);
                        el.classList.add('aos-animate');
                    }, delay);
                    
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        animatedElements.forEach(el => observer.observe(el));
    };

    /* ----------------------------------------------------------------------
       12. INITIALIZE ALL HOMEPAGE FUNCTIONS
    ---------------------------------------------------------------------- */

    const init = () => {
        initHomepage();
        initScrollReveal();
        initLazyHeroImage();
        initCustomAOS();
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add home-page class to body
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname === '') {
        document.body.classList.add('home-page');
    }

})();

/* ==========================================================================
   ADDITIONAL STYLES FOR HOMEPAGE ANIMATIONS
   ========================================================================== */

const style = document.createElement('style');
style.textContent = `
    @keyframes iconSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .hero-image-wrapper {
        animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0) perspective(1000px) rotateY(-5deg) rotateX(5deg); }
        50% { transform: translateY(-10px) perspective(1000px) rotateY(-5deg) rotateX(5deg); }
    }
    
    .counter-animate {
        animation: countUp 0.5s ease-out;
    }
    
    @keyframes countUp {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); color: var(--color-primary); }
        100% { transform: scale(1); }
    }
    
    .testimonials-slider {
        position: relative;
        overflow: hidden;
    }
    
    .testimonial-card {
        transition: transform 0.5s ease;
    }
    
    .slider-dots {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 30px;
    }
    
    .slider-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--color-gray-300);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .slider-dot.active {
        background-color: var(--color-primary);
        transform: scale(1.2);
    }
    
    .slider-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: var(--color-white);
        color: var(--color-gray-700);
        border: 1px solid var(--color-gray-200);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
    }
    
    .slider-arrow:hover {
        background-color: var(--color-primary);
        color: var(--color-white);
        border-color: var(--color-primary);
    }
    
    .slider-arrow.prev {
        left: 20px;
    }
    
    .slider-arrow.next {
        right: 20px;
    }
    
    @media (max-width: 768px) {
        .slider-arrow {
            display: none;
        }
    }
    
    .service-card.revealed,
    .step.revealed,
    .testimonial-card.revealed,
    .studio-content.revealed,
    .studio-images.revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .hero-image img {
        transition: opacity 0.5s ease;
        opacity: 0;
    }
    
    .hero-image img.loaded {
        opacity: 1;
    }
`;

document.head.appendChild(style);