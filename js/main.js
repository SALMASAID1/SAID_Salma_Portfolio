/* ==================== LOADER ==================== */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        initAOS();
    }, 800);
});
document.body.style.overflow = 'hidden';

/* ==================== STARS CANVAS ==================== */
(function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = 220;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.8 + 0.3,
                alpha: Math.random(),
                dAlpha: (Math.random() - 0.5) * 0.008,
                speed: Math.random() * 0.15 + 0.02
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            s.alpha += s.dAlpha;
            if (s.alpha <= 0.1 || s.alpha >= 1) s.dAlpha *= -1;
            s.alpha = Math.max(0.1, Math.min(1, s.alpha));
            s.y += s.speed;
            if (s.y > canvas.height + 5) {
                s.y = -5;
                s.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 200, 255, ${s.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(drawStars);
    }

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        resize();
        createStars();
        // Draw once, no animation
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 200, 255, ${s.alpha})`;
            ctx.fill();
        });
    } else {
        resize();
        createStars();
        drawStars();
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });
})();

/* ==================== CUSTOM CURSOR ==================== */
(function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    if (!dot || !outline) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.opacity = '1';
        outline.style.opacity = '1';
        dot.style.left = mouseX - 4 + 'px';
        dot.style.top = mouseY - 4 + 'px';
    });

    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        outline.style.left = outlineX - 18 + 'px';
        outline.style.top = outlineY - 18 + 'px';
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-tag, .filter-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => outline.classList.add('hover'));
        el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
    });
})();

/* ==================== NAVBAR ==================== */
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hamburger toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Close on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('.section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
})();

/* ==================== THEME TOGGLE ==================== */
(function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('theme');

    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }
})();

/* ==================== TYPEWRITER ==================== */
(function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    // Kill any previous typewriter instance (bfcache / duplicate load)
    if (window._typewriterTimer) {
        clearTimeout(window._typewriterTimer);
        window._typewriterTimer = null;
    }

    const lang = document.documentElement.lang || 'en';
    const phrases = lang === 'fr' ? [
        'Étudiant en Ingénierie des Données',
        'Passionné de Machine Learning',
        'Développeur Big Data',
        'Explorateur IA & NLP',
        'Apprenant Cloud Computing'
    ] : [
        'Data Engineering Student',
        'Machine Learning Enthusiast',
        'Big Data Developer',
        'AI & NLP Explorer',
        'Cloud Computing Learner'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    // Clear element to avoid stale text
    el.textContent = '';

    function type() {
        const current = phrases[phraseIndex];
        let delay;

        if (isDeleting) {
            charIndex--;
            el.textContent = current.substring(0, charIndex);
            delay = 35;

            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = 500;
            }
        } else {
            charIndex++;
            el.textContent = current.substring(0, charIndex);
            delay = 70;

            if (charIndex === current.length) {
                isDeleting = true;
                delay = 2200;
            }
        }

        window._typewriterTimer = setTimeout(type, delay);
    }

    window._typewriterTimer = setTimeout(type, 1200);
})();

// Re-initialize typewriter on bfcache restore
window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        // Page was restored from bfcache — restart typewriter
        if (window._typewriterTimer) {
            clearTimeout(window._typewriterTimer);
            window._typewriterTimer = null;
        }
        const el = document.getElementById('typewriter');
        if (!el) return;

        const lang = document.documentElement.lang || 'en';
        const phrases = lang === 'fr' ? [
            'Étudiant en Ingénierie des Données',
            'Passionné de Machine Learning',
            'Développeur Big Data',
            'Explorateur IA & NLP',
            'Apprenant Cloud Computing'
        ] : [
            'Data Engineering Student',
            'Machine Learning Enthusiast',
            'Big Data Developer',
            'AI & NLP Explorer',
            'Cloud Computing Learner'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        el.textContent = '';

        function type() {
            const current = phrases[phraseIndex];
            let delay;
            if (isDeleting) {
                charIndex--;
                el.textContent = current.substring(0, charIndex);
                delay = 35;
                if (charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 500; }
            } else {
                charIndex++;
                el.textContent = current.substring(0, charIndex);
                delay = 70;
                if (charIndex === current.length) { isDeleting = true; delay = 2200; }
            }
            window._typewriterTimer = setTimeout(type, delay);
        }
        window._typewriterTimer = setTimeout(type, 500);
    }
});

/* ==================== PROJECT FILTER ==================== */
(function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
})();

/* ==================== COUNTER ANIMATION ==================== */
(function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasRun = false;

    function animateCount(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasRun) {
                hasRun = true;
                counters.forEach(c => animateCount(c));
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
})();

/* ==================== AOS (Animate on Scroll) ==================== */
function initAOS() {
    const aosElements = document.querySelectorAll('[data-aos]');
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        aosElements.forEach(el => el.classList.add('aos-animate'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    aosElements.forEach(el => observer.observe(el));
}

/* ==================== CONTACT FORM ==================== */
(function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const subject = form.querySelector('#subject').value;
        const message = form.querySelector('#message').value;

        const mailtoLink = `mailto:salma2003said@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
        window.location.href = mailtoLink;
    });
})();

/* ==================== BACK TO TOP ==================== */
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* ==================== SMOOTH SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/* ==================== PARALLAX ORBS ==================== */
(function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const orbs = document.querySelectorAll('.gradient-orb');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        orbs.forEach((orb, i) => {
            const speed = (i + 1) * 0.04;
            orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
})();

/* ==================== KEYBOARD NAV ==================== */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('open');
        }
    }
});

/* ==================== FADE-IN-UP KEYFRAME (for project filter) ==================== */
const style = document.createElement('style');
style.textContent = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
