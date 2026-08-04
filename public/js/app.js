/**
 * Digital Open Card — Main Application
 * Vanilla JS (ES6+) | Glassmorphism + Neon Theme
 */

// ============================================
// STATE
// ============================================
const state = {
    profile: null,
    technologies: [],
    projects: [],
    isLoaded: false
};

// ============================================
// UTILS
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (fn, delay = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

// ============================================
// PRELOADER
// ============================================
const initPreloader = () => {
    const preloader = $('#preloader');
    const progressBar = $('#progressBar');
    
    if (!preloader) return;

    let progress = 0;
    const steps = [
        { p: 15, d: 200 },
        { p: 35, d: 400 },
        { p: 60, d: 300 },
        { p: 80, d: 500 },
        { p: 95, d: 400 },
        { p: 100, d: 300 }
    ];

    const animateProgress = async () => {
        for (const step of steps) {
            await new Promise(r => setTimeout(r, step.d));
            progress = step.p;
            if (progressBar) progressBar.style.width = `${progress}%`;
        }

        // Hide preloader
        await new Promise(r => setTimeout(r, 300));
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Trigger initial animations
        initScrollAnimations();
        animateCounters();
    };

    document.body.style.overflow = 'hidden';
    animateProgress();
};

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
const initScrollAnimations = () => {
    const animatedElements = $$('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
};

// ============================================
// NAVBAR
// ============================================
const initNavbar = () => {
    const navbar = $('#navbar');
    const navToggle = $('#navToggle');
    const navMenu = $('#navMenu');
    const navLinks = $$('.nav-link');

    // Scroll behavior
    const handleScroll = debounce(() => {
        const scrolled = window.scrollY > 50;
        navbar?.classList.toggle('scrolled', scrolled);

        // Active link
        const sections = $$('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }, 50);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile toggle
    navToggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        });
    });
};

// ============================================
// AVATAR UPLOAD & LOCALSTORAGE
// ============================================
const initAvatar = () => {
    const avatarInput = $('#avatarInput');
    const avatarImage = $('#avatarImage');
    const avatarPlaceholder = $('#avatarPlaceholder');
    const STORAGE_KEY = 'doc_avatar';

    // Load from LocalStorage
    const savedAvatar = localStorage.getItem(STORAGE_KEY);
    if (savedAvatar) {
        avatarImage.src = savedAvatar;
        avatarImage.classList.add('loaded');
    }

    // Handle upload
    avatarInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Пожалуйста, выберите изображение', 'error');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Save to LocalStorage
            try {
                localStorage.setItem(STORAGE_KEY, dataUrl);
                avatarImage.src = dataUrl;
                avatarImage.classList.add('loaded');
                showToast('Фото успешно загружено!', 'success');
            } catch (err) {
                // Handle quota exceeded
                showToast('Файл слишком большой для хранилища', 'error');
            }
        };

        reader.onerror = () => {
            showToast('Ошибка загрузки файла', 'error');
        };

        reader.readAsDataURL(file);
    });
};

// ============================================
// DATA LOADING (JSON / API)
// ============================================
const loadData = async () => {
    try {
        // Try API first, fallback to local JSON
        const response = await fetch('/api/profile');
        if (response.ok) {
            const result = await response.json();
            state.profile = result.data;
        } else {
            throw new Error('API unavailable');
        }
    } catch (error) {
        console.log('[INFO] Using local JSON fallback');
        // Fallback to local JSON file
        try {
            const response = await fetch('/assets/data.json');
            state.profile = await response.json();
        } catch (e) {
            console.error('[ERROR] Failed to load data:', e);
            showToast('Ошибка загрузки данных', 'error');
        }
    }

    if (state.profile) {
        state.technologies = state.profile.technologies || [];
        state.projects = state.profile.projects || [];
        renderTechnologies();
        renderProjects();
    }
};

// ============================================
// RENDER TECHNOLOGIES
// ============================================
const renderTechnologies = (filter = 'all') => {
    const grid = $('#techGrid');
    if (!grid) return;

    const filtered = filter === 'all' 
        ? state.technologies 
        : state.technologies.filter(t => t.category === filter);

    grid.innerHTML = filtered.map((tech, index) => `
        <div class="tech-card" data-animate="fade-up" data-delay="${index * 50}">
            <div class="tech-card-header">
                <span class="tech-card-icon">${tech.icon}</span>
                <span class="tech-card-name">${tech.name}</span>
            </div>
            <div class="tech-card-category">${tech.category}</div>
            <p class="tech-card-description">${tech.description}</p>
            <div class="tech-card-bar">
                <div class="tech-card-progress" style="width: 0%" data-width="${tech.level}"></div>
            </div>
        </div>
    `).join('');

    // Animate progress bars
    requestAnimationFrame(() => {
        const bars = $$('.tech-card-progress');
        bars.forEach(bar => {
            const width = bar.dataset.width;
            setTimeout(() => {
                bar.style.width = `${width}%`;
            }, 100);
        });
    });

    // Re-observe new elements
    initScrollAnimations();
};

// ============================================
// TECH FILTER
// ============================================
const initTechFilter = () => {
    const filterBtns = $$('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTechnologies(btn.dataset.filter);
        });
    });
};

// ============================================
// RENDER PROJECTS
// ============================================
const renderProjects = () => {
    const grid = $('#projectsGrid');
    if (!grid) return;

    grid.innerHTML = state.projects.map((project, index) => `
        <div class="project-card glass-card" data-animate="fade-up" data-delay="${index * 100}">
            <div class="project-header">
                <div class="project-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <a href="${project.link}" class="project-link" target="_blank">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </a>
            </div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-stack">
                ${project.stack.map(s => `<span class="project-tag">${s}</span>`).join('')}
            </div>
        </div>
    `).join('');
};

// ============================================
// ANIMATED COUNTERS
// ============================================
const animateCounters = () => {
    const counters = $$('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const start = performance.now();
                
                const animate = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(easeOut * target);
                    
                    el.textContent = formatNumber(current);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        el.textContent = formatNumber(target);
                    }
                };
                
                requestAnimationFrame(animate);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
};

// ============================================
// CIRCULAR PROGRESS ANIMATION
// ============================================
const animateCircularProgress = () => {
    const circles = $$('.counter-progress');
    const circumference = 2 * Math.PI * 45; // r=45
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const target = parseInt(circle.dataset.target);
                const offset = circumference - (target / 100) * circumference;
                
                // Add SVG gradient definition if not exists
                if (!document.getElementById('counterGradient')) {
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.classList.add('svg-defs');
                    svg.innerHTML = `
                        <defs>
                            <linearGradient id="counterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:var(--neon-cyan);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:var(--neon-purple);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    `;
                    document.body.appendChild(svg);
                }
                
                // Apply gradient
                circle.style.stroke = 'url(#counterGradient)';
                circle.style.strokeDashoffset = offset;
                
                observer.unobserve(circle);
            }
        });
    }, { threshold: 0.5 });

    circles.forEach(circle => observer.observe(circle));
};

// ============================================
// CONTACT FORM
// ============================================
const initContactForm = () => {
    const form = $('#contactForm');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = $('#name').value.trim();
        const email = $('#email').value.trim();
        const message = $('#message').value.trim();
        
        if (!name || !email || !message) {
            showToast('Заполните все поля', 'error');
            return;
        }
        
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Отправка...</span>';
        btn.disabled = true;
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Сообщение отправлено!', 'success');
                form.reset();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            // Fallback: simulate success for static hosting
            console.log('[INFO] Form submission (simulated):', { name, email, message });
            showToast('Сообщение отправлено! (Demo mode)', 'success');
            form.reset();
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
const showToast = (message, type = 'info') => {
    const container = $('#toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
        toast.remove();
    }, 3500);
};

// ============================================
// DYNAMIC BACKGROUND GRID
// ============================================
const initBackgroundGrid = () => {
    const grid = $('#bgGrid');
    if (!grid) return;
    
    // Grid is CSS-based, but we can add interactive elements
    document.addEventListener('mousemove', debounce((e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        grid.style.maskImage = `radial-gradient(circle at ${x}% ${y}%, black 20%, transparent 60%)`;
        grid.style.webkitMaskImage = `radial-gradient(circle at ${x}% ${y}%, black 20%, transparent 60%)`;
    }, 16));
};

// ============================================
// PARALLAX EFFECTS
// ============================================
const initParallax = () => {
    const glows = $$('.bg-glow');
    
    window.addEventListener('mousemove', debounce((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        glows.forEach((glow, index) => {
            const factor = (index + 1) * 15;
            glow.style.transform = `translate(${x * factor}px, ${y * factor}px) scale(1)`;
        });
    }, 16));
};

// ============================================
// TYPING EFFECT FOR HERO
// ============================================
const initTypingEffect = () => {
    const subtitle = $('.hero-subtitle');
    if (!subtitle) return;
    
    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.opacity = '1';
    
    let i = 0;
    const type = () => {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    };
    
    setTimeout(type, 1000);
};

// ============================================
// KEYBOARD NAVIGATION
// ============================================
const initKeyboardNav = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const navMenu = $('#navMenu');
            const navToggle = $('#navToggle');
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    });
};

// ============================================
// PERFORMANCE: Lazy load images
// ============================================
const initLazyLoading = () => {
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imgObserver.unobserve(img);
                }
            });
        });

        $$('img[data-src]').forEach(img => imgObserver.observe(img));
    }
};

// ============================================
// INIT ALL
// ============================================
const init = () => {
    // Preloader first
    initPreloader();
    
    // Core functionality
    initNavbar();
    initAvatar();
    initTechFilter();
    initContactForm();
    initBackgroundGrid();
    initParallax();
    initTypingEffect();
    initKeyboardNav();
    initLazyLoading();
    
    // Data loading
    loadData().then(() => {
        // After data loads, init circular progress
        setTimeout(animateCircularProgress, 500);
    });
    
    console.log(`
    ╔══════════════════════════════════════════╗
    ║     Digital Open Card Loaded             ║
    ║     Stack: HTML5 | CSS3 | Vanilla JS     ║
    ║     Backend: Node.js | Express           ║
    ╚══════════════════════════════════════════╝
    `);
};

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
