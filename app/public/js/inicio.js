// Delivery Organic Plant - Premium JavaScript

class DeliveryApp {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.autoSlideInterval = null;
        this.isUserInteracting = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCarousel();
        this.initializeTheme();
        this.initializeMobileMenu();
        this.initializeAccountButton();
        this.initializeSearch();
        this.addScrollEffects();
        this.addProductCardEffects();
    }

    setupEventListeners() {
        // Carousel controls
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Theme toggle
        const themeToggle = document.getElementById('toggle-dark');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        const navList = document.querySelector('.nav-list');
        
        if (mobileMenu && navList) {
            mobileMenu.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close mobile menu when clicking nav links
            const navLinks = navList.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });
        }

        // Keyboard navigation for carousel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Pause auto-slide on user interaction
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('mouseenter', () => {
                this.isUserInteracting = true;
                this.pauseAutoSlide();
            });
            
            carouselWrapper.addEventListener('mouseleave', () => {
                this.isUserInteracting = false;
                this.startAutoSlide();
            });
        }

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Smooth scrolling for internal links
        this.initializeSmoothScrolling();
    }

    initializeCarousel() {
        this.updateCarouselView();
        this.startAutoSlide();
    }

    updateCarouselView() {
        const track = document.querySelector('.carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        
        if (track && slides.length > 0) {
            // Move track
            const translateX = -this.currentSlide * (100 / this.totalSlides);
            track.style.transform = `translateX(${translateX}%)`;
            
            // Update active slide
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === this.currentSlide);
            });
        }
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarouselView();
        this.resetAutoSlide();
    }

    previousSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarouselView();
        this.resetAutoSlide();
    }

    startAutoSlide() {
        if (!this.isUserInteracting) {
            this.autoSlideInterval = setInterval(() => {
                this.nextSlide();
            }, 5000);
        }
    }

    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resetAutoSlide() {
        this.pauseAutoSlide();
        setTimeout(() => {
            if (!this.isUserInteracting) {
                this.startAutoSlide();
            }
        }, 1000);
    }

    initializeTheme() {
        let savedTheme = null;
        try {
            savedTheme = localStorage.getItem('theme');
        } catch (e) {
            console.warn('Erro ao carregar tema:', e);
        }
        
        const themeToggle = document.getElementById('toggle-dark');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            if (themeToggle) {
                themeToggle.querySelector('.theme-icon').textContent = '☀️';
                themeToggle.setAttribute('aria-pressed', 'true');
            }
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('toggle-dark');
        const isDark = body.classList.toggle('dark');
        
        if (themeToggle) {
            const icon = themeToggle.querySelector('.theme-icon');
            icon.textContent = isDark ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-pressed', isDark.toString());
        }
        
        // Save theme preference
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {
            console.warn('Erro ao salvar tema:', e);
        }
        
        // Add transition class temporarily
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }

    initializeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.setAttribute('aria-expanded', 'false');
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navList = document.querySelector('.nav-list');
        
        if (mobileMenu && navList) {
            const isOpen = navList.classList.toggle('active');
            mobileMenu.classList.toggle('active', isOpen);
            mobileMenu.setAttribute('aria-expanded', isOpen.toString());
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navList = document.querySelector('.nav-list');
        
        if (mobileMenu && navList) {
            navList.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    initializeAccountButton() {
        const btnConta = document.getElementById('btn-conta');
        
        if (btnConta) {
            // Check if user is logged in (dados do servidor)
            const userData = window.usuario || null;
            
            btnConta.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (userData) {
                    // User is logged in, go to account page
                    this.navigateToAccount();
                } else {
                    // User not logged in, go to login page
                    this.navigateToLogin();
                }
            });
        }
    }

    navigateToAccount() {
        // Add loading state
        this.showLoadingState();
        
        setTimeout(() => {
            window.location.href = '/conta';
        }, 300);
    }

    navigateToLogin() {
        // Add loading state
        this.showLoadingState();
        
        setTimeout(() => {
            window.location.href = '/cadlog';
        }, 300);
    }

    showLoadingState() {
        const btnConta = document.getElementById('btn-conta');
        if (btnConta) {
            btnConta.style.opacity = '0.7';
            btnConta.style.pointerEvents = 'none';
        }
    }

    addScrollEffects() {
        // Add scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const elementsToAnimate = document.querySelectorAll(
            '.product-card, .section-header, .view-more-btn'
        );
        
        elementsToAnimate.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add CSS for animate-in class
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    addProductCardEffects() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            // Add staggered animation delay
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Add enhanced hover effects
            card.addEventListener('mouseenter', () => {
                this.animateProductIcon(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.resetProductIcon(card);
            });
            
            // Add click ripple effect
            card.addEventListener('click', (e) => {
                this.createRippleEffect(e, card);
            });
        });
    }

    animateProductIcon(card) {
        const icon = card.querySelector('.product-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(2deg)';
            icon.style.filter = 'drop-shadow(0 8px 16px rgba(212, 175, 55, 0.3))';
        }
    }

    resetProductIcon(card) {
        const icon = card.querySelector('.product-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
            icon.style.filter = 'none';
        }
    }

    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Add ripple animation keyframes if not already added
        if (!document.getElementById('ripple-styles')) {
            const rippleStyles = document.createElement('style');
            rippleStyles.id = 'ripple-styles';
            rippleStyles.textContent = `
                @keyframes ripple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(rippleStyles);
        }
    }

    initializeSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
        
        // Recalculate carousel position if needed
        this.updateCarouselView();
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Função de busca
    initializeSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.buscarProdutos();
                }
            });
        }
    }
    
    buscarProdutos() {
        const searchInput = document.getElementById('search-input');
        const termo = searchInput.value.trim();
        
        if (termo) {
            window.location.href = `/produtos?busca=${encodeURIComponent(termo)}`;
        } else {
            window.location.href = '/produtos';
        }
    }

    // Enhanced accessibility
    setupAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-dark);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1001;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content id
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.id = 'main-content';
        }
    }

    // Performance optimization
    preloadImages() {
        const imageSources = [
            // Add your image URLs here when you replace emoji placeholders
        ];
        
        imageSources.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
}

// Função global para busca
function buscarProdutos() {
    const searchInput = document.getElementById('search-input');
    const termo = searchInput.value.trim();
    
    if (termo) {
        window.location.href = `/produtos?busca=${encodeURIComponent(termo)}`;
    } else {
        window.location.href = '/produtos';
    }
}



// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DeliveryApp();
    
    // Add performance observer for monitoring
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                }
            });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
});

