document.addEventListener('DOMContentLoaded', () => {
    // --- Smooth Scrolling (Lenis) ---
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.6, // Increased for a more 'premium' felt smoothness
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            smoothWheel: true,
            wheelMultiplier: 1.1, // Slightly more responsive
            touchMultiplier: 2,
            // Keep native mobile touch scrolling for performance and natural feel
            smoothTouch: false,
        });
        window.lenis = lenis;

        // Sync Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Add Lenis's requestAnimationFrame (raf) to GSAP's ticker
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Disable GSAP's lag smoothing, required when syncing with an external raf mechanism
        gsap.ticker.lagSmoothing(0);
    }

    // --- Burger Menu Logic ---
    const burger = document.getElementById('burger');
    const navLinks = document.querySelector('.nav-links');

    if (burger) {
        burger.addEventListener('click', () => {
            const navbar = document.querySelector('.navbar');
            navLinks.style.display = ''; // Clear inline block/none styles
            navLinks.classList.toggle('nav-active');
            burger.classList.toggle('open');
            if (navbar) navbar.classList.toggle('menu-open');
            
            // Prevent background scrolling when menu is open on mobile
            if (navLinks.classList.contains('nav-active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Hero Interactive Background Grid
    function initHeroBackground() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const spacing = 40;
        const mouse = { x: -1000, y: -1000, radius: 150 };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.size = 1.5;
                this.density = (Math.random() * 30) + 1;
            }

            draw() {
                ctx.fillStyle = 'rgba(51, 51, 51, 0.2)'; // Dark grey dots with slight transparency
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update(t) {
                // Wave movement
                let waveX = Math.sin(t + (this.baseX * 0.01)) * 5;
                let waveY = Math.cos(t + (this.baseY * 0.01)) * 5;

                let currentBaseX = this.baseX + waveX;
                let currentBaseY = this.baseY + waveY;

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== currentBaseX) {
                        let dx = this.x - currentBaseX;
                        this.x -= dx / 20;
                    }
                    if (this.y !== currentBaseY) {
                        let dy = this.y - currentBaseY;
                        this.y -= dy / 20;
                    }
                }
            }
        }

        function initParticles() {
            particles = [];
            for (let y = 0; y < height; y += spacing) {
                for (let x = 0; x < width; x += spacing) {
                    particles.push(new Particle(x, y));
                }
            }
        }

        let time = 0;

        function animate() {
            ctx.clearRect(0, 0, width, height);
            time += 0.01;
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update(time);
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    initHeroBackground();

    // --- Hero GSAP Animation ---
    function initHeroAnimation() {
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            const text = subtitle.textContent.trim();
            subtitle.innerHTML = '';
            for (let i = 0; i < text.length; i++) {
                let s = text[i];
                let span = document.createElement('span');
                span.className = 'char';
                span.innerHTML = s === ' ' ? '&nbsp;' : s;
                subtitle.appendChild(span);
            }
        }

        // Make elements visible for GSAP to animate from their hidden state
        gsap.set([".hero-image-wrapper", ".title-word", ".char", ".hero-btn"], { autoAlpha: 1 });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.from(".hero-image-wrapper", { y: 100, rotateX: 15, autoAlpha: 0, scale: 0.8, duration: 1.5 })
            .from(".hero-image", { scale: 1.4, duration: 1.5 }, "<")
            .from(".title-word", { yPercent: 120, rotateX: -80, autoAlpha: 0, duration: 1.2, stagger: 0.15, ease: "back.out(1.2)" }, "-=0.8")
            .from(".char", { autoAlpha: 0, y: 10, duration: 0.1, stagger: 0.01 }, "-=0.4")
            .from(".hero-btn", { y: 40, autoAlpha: 0, duration: 1.2, ease: "back.out(1.5)" }, "-=1.0");
    }

    initHeroAnimation();
    
    // --- About staggered text animation ---
    function initAboutAnimation() {
        const title = document.querySelector('.stagger-text');
        if (!title) return;

        const originalText = title.textContent.trim();
        const words = originalText.split(/\s+/);
        title.innerHTML = '';
        
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            
            for (let i = 0; i < word.length; i++) {
                let char = word[i];
                let charSpan = document.createElement('span');
                charSpan.className = 'stagger-char';
                charSpan.innerHTML = char;
                wordSpan.appendChild(charSpan);
            }
            
            title.appendChild(wordSpan);
            
            // Add a space after the word (except the last one)
            if (wordIndex < words.length - 1) {
                title.appendChild(document.createTextNode(' '));
            }
        });

        const chars = title.querySelectorAll('.stagger-char');
        
        gsap.from(chars, {
            scrollTrigger: {
                trigger: title,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 50,
            opacity: 0,
            stagger: 0.015, // Faster stagger for long text
            duration: 0.6,
            ease: "back.out(1.7)"
        });
    }

    initAboutAnimation();

    // --- Smooth Scroll Stacking Accordion GSAP ---
    function initStackingAccordion() {
        const section = document.querySelector('#projects');
        const container = section ? section.querySelector('.container') : null;
        const grid = document.querySelector('.stacking-accordion');
        const cards = gsap.utils.toArray('.stacking-accordion .strict-card');
        const texts = gsap.utils.toArray('.stacking-accordion .card-collapse-content');

        if (!cards.length || !grid || !texts.length || !container) return;

        // Reset previous properties
        gsap.set(cards, { clearProps: "all" });
        gsap.set(texts, { clearProps: "all" });

        // Collapse ALL cards, including the last one
        const textsToAnimate = texts;
        const cardsToAnimate = cards;

        // Use GSAP matchMedia to only stack on desktop, keeping mobile flow natural
        let mm = gsap.matchMedia();

        mm.add("(min-width: 901px)", () => {
            const totalScrollDistance = window.innerHeight * 1.5; 
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 70px",
                    end: `+=${totalScrollDistance}`,
                    pin: container,
                    pinSpacing: true,
                    scrub: 1.2,
                    invalidateOnRefresh: true
                }
            });

            // Loop through each card for granular control
            textsToAnimate.forEach((text, i) => {
                const card = cardsToAnimate[i];
                
                // Phase 1: Collapse the text
                tl.to(text, {
                    height: 0,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut"
                })
                // Phase 2: Scale card down slightly to show it's stacking underneath
                .to(card, {
                    opacity: 0.7,
                    scale: 0.98,
                    marginTop: -10,
                    duration: 0.6,
                    ease: "none"
                }, "<"); 
                
                // Add a small pause in scrub timeline between card steps
                tl.to({}, { duration: 0.2 }); 
            });
        });

        mm.add("(max-width: 900px)", () => {
            // Mobile: kill previous triggers if any and ensure blocks are visible
            gsap.set(cards, { clearProps: "all" });
            gsap.set(texts, { clearProps: "all" });
        });

        // Force refresh
        ScrollTrigger.refresh();
    }

    // Delay initialization slightly to ensure offsetHeights are ready
    setTimeout(initStackingAccordion, 300);

    // --- Smooth Scroll for anchors ---
    const navAnchors = document.querySelectorAll('.nav-btn, .dot-btn, .logo, .dot-nav a');

    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href) return;

            // --- Unified Heavy-Duty Smooth Scroll ---
            e.preventDefault();
            const isHome = href === '#' || href === '#hero';
            const targetId = isHome ? '#hero' : href;
            const targetElement = document.querySelector(targetId);

            // Handle mobile menu cleanup FIRST
            const mobileMenuWasOpen = navLinks && navLinks.classList.contains('nav-active');
            if (mobileMenuWasOpen) {
                navLinks.classList.remove('nav-active');
                navLinks.style.display = '';
                const b = document.getElementById('burger');
                if (b) b.classList.remove('open');
                const n = document.querySelector('.navbar');
                if (n) n.classList.remove('menu-open');
                document.body.style.overflow = '';
            }

            if (!targetElement) return;

            // Delay scroll so the mobile menu has time to collapse first,
            // ensuring getBoundingClientRect returns the correct position
            const delay = mobileMenuWasOpen ? 120 : 0;

            setTimeout(() => {
                if (window.ScrollTrigger) ScrollTrigger.refresh();

                let yPos = 0;
                if (!isHome) {
                    if (targetElement.navTrigger) {
                        yPos = targetElement.navTrigger.start;
                    } else {
                        const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                        yPos = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                    }
                }

                if (window.lenis) {
                    window.lenis.scrollTo(yPos, { duration: 0.9, ease: (t) => 1 - Math.pow(1 - t, 3) });
                } else if (window.gsap) {
                    gsap.to(window, { duration: 0.8, scrollTo: yPos, ease: 'power2.out', overwrite: 'auto' });
                } else {
                    window.scrollTo({ top: yPos, behavior: 'smooth' });
                }
            }, delay);
        });
    });

    // --- Counter Animation for Stats ---
    const counters = document.querySelectorAll('.counter');
    const speed = 100; // Fewer steps make it feel more deliberate and slower

    const animateCounters = () => {
        counters.forEach(counter => {
            const animate = () => {
                const target = +counter.getAttribute('data-target');
                const hasPlus = counter.getAttribute('data-plus') === 'true';
                const countString = counter.innerText.replace('%', '').replace('+', '');
                const count = +countString || 0;
                const inc = Math.max(target / speed, 1);

                if (count < target) {
                    const nextCount = Math.min(count + inc, target);
                    let displayValue = Math.ceil(nextCount);
                    if (hasPlus) {
                        counter.innerText = displayValue + '+';
                    } else {
                        counter.innerText = displayValue;
                    }
                    setTimeout(animate, 30);
                } else {
                    counter.innerText = target + (hasPlus ? '+' : '');
                }
            }
            animate();
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reset before starting animation
                counters.forEach(c => c.innerText = '0');
                animateCounters();
            }
        });
    }, { threshold: 0.2 });

    const statsStrip = document.querySelector('.stats-strip');
    if (statsStrip) {
        observer.observe(statsStrip);
    }

    // --- GSAP Zoom Scroll Animation ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        const sections = document.querySelectorAll('section');
        const dotBtns = document.querySelectorAll('.dot-btn');

        const updateDot = (index) => {
            dotBtns.forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });
        };

        sections.forEach((section, index) => {
            const container = section.querySelector('.container');

            // Pre-calculate permanent anchor trigger for pixel-perfect navigation targeting
            if (section.id !== 'hero') {
                section.navTrigger = ScrollTrigger.create({
                    trigger: section,
                    start: "top 70px" // Header offset
                });
            }

            // Stacking context
            // Give normal flow to myths, projects, contacts and director so they don't overlap incorrectly
            const isNormalStacking = section.id === 'myths' || section.id === 'projects' || section.id === 'contact' || section.id === 'director';
            
            gsap.set(section, {
                position: 'relative',
                zIndex: isNormalStacking ? 'auto' : (sections.length - index),
                opacity: 1 // Ensure section itself is visible
            });

            // Special handling for the Code (rules) section - on all devices
            if (section.id === 'code') {
                const list = section.querySelector('.code-list');
                const sidebar = section.querySelector('.code-sidebar');
                const title = section.querySelector('.code-main-title');

                if (list && sidebar) {
                    let mm = gsap.matchMedia();

                    mm.add("(min-width: 1321px)", () => {
                        let scrollDistance = 0;
                        const tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: section,
                                start: "top top",
                                end: () => `+=${scrollDistance}`,
                                pin: true,
                                scrub: 1,
                                pinSpacing: true,
                                onRefresh: () => {
                                    gsap.set(sidebar, { clearProps: "all" });
                                    gsap.set(list, { clearProps: "all" });
                                    if (title) gsap.set(title, { clearProps: "all" });
                                    const listHeight = list.offsetHeight;
                                    // Increased buffer to 250px to ensure Rule 10 is fully visible
                                    scrollDistance = Math.max(0, listHeight - window.innerHeight + 250);
                                },
                                onUpdate: (self) => {
                                    if (scrollDistance > 0) {
                                        const scrollY = scrollDistance * self.progress;
                                        gsap.set(list, { y: -scrollY });
                                    }
                                }
                            }
                        });

                        ScrollTrigger.create({
                            trigger: section,
                            start: "top 50%",
                            end: () => `+=${scrollDistance}`,
                            onEnter: () => updateDot(index),
                            onEnterBack: () => updateDot(index)
                        });
                    });

                    mm.add("(max-width: 1320px)", () => {
                        gsap.set(sidebar, { clearProps: "all" });
                        gsap.set(list, { clearProps: "all" });
                        if (title) gsap.set(title, { clearProps: "all" });
                        
                        ScrollTrigger.create({
                            trigger: section,
                            start: "top 50%",
                            end: "bottom 50%",
                            onEnter: () => updateDot(index),
                            onEnterBack: () => updateDot(index)
                        });
                    });

                    return; // Skip default logic for this section
                }
            }

            // Мифы и руководство не должны фиксироваться и исчезать мгновенно
            const isLongSection = section.offsetHeight > window.innerHeight * 1.2 || section.id === 'myths' || section.id === 'director' || section.id === 'code' || section.id === 'hero' || section.id === 'projects';

            if (!isLongSection) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "+=100%",
                        pin: true,
                        scrub: 1,
                        pinSpacing: true
                    }
                });

                // Animate container scale and opacity instead of the section
                if (container) {
                    tl.to(container, {
                        opacity: 0,
                        scale: 0.85,
                        ease: "power1.inOut"
                    });
                }
            } else {
                // Только для обычных длинных секций делаем fade-out, мифы и руководство не трогаем
                if (container && section.id !== 'myths' && section.id !== 'director' && section.id !== 'code' && section.id !== 'projects') {
                    gsap.to(container, {
                        opacity: 0,
                        scale: 0.9,
                        scrollTrigger: {
                            trigger: section,
                            start: "bottom 80%",
                            end: "bottom top",
                            scrub: 1
                        }
                    });
                }
            }

            // Dot tracking
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => updateDot(index),
                onEnterBack: () => updateDot(index)
            });
        });

        // Ensure footer visibility
        const footer = document.querySelector('footer');
        if (footer) {
            gsap.set(footer, { position: 'relative', zIndex: 100 });
            ScrollTrigger.create({
                trigger: footer,
                start: "top 90%",
                onEnter: () => updateDot(sections.length),
                onEnterBack: () => updateDot(sections.length)
            });
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                ScrollTrigger.refresh();
                
                // --- Manual Robust Snapping for Lenis ---
                ScrollTrigger.create({
                    start: 0,
                    end: "max",
                    onScrollEnd: (self) => {
                        const scrollY = window.scrollY || window.pageYOffset;
                        const threshold = 250;
                        let targetY = -1;
                        let minDiff = threshold;

                        sections.forEach(s => {
                            const sectionTop = (s.id === 'hero') ? 0 : (s.navTrigger ? s.navTrigger.start : 0);
                            const diff = Math.abs(scrollY - sectionTop);
                            
                            if (diff < minDiff) {
                                minDiff = diff;
                                targetY = sectionTop;
                            }
                        });

                        // If we found a close section and it's not the current position
                        if (targetY !== -1 && Math.abs(scrollY - targetY) > 5) {
                            if (window.lenis) {
                                window.lenis.scrollTo(targetY, {
                                    duration: 0.8,
                                    easing: (t) => Math.min(1, 1.001 * Math.pow(2, -10 * t)),
                                    lock: false
                                });
                            }
                        }
                    }
                });
            }, 500);
        });
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Simulation of sending
            console.log('Sending data:', data);

            // Response to user
            const btn = this.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'ОТПРАВЛЕНО';
            btn.style.backgroundColor = '#28a745';
            btn.disabled = true;

            alert('Спасибо! Ваш запрос успешно отправлен. Мы свяжемся с вами в ближайшее время.');

            // Reset form
            this.reset();

            // Restore button after 3 seconds
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }, 3000);
        });
    }

    // --- Modal Logic ---
    const modal = document.getElementById('policyModal');
    const policyLink = document.getElementById('policyLink');
    const closeBtn = document.querySelector('.close-modal');

    if (modal && policyLink && closeBtn) {
        policyLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scroll
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Unlock scroll
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Unlock scroll
            }
        });
    }

    // --- FAQ (Myths) Refresh ScrollTrigger on toggle ---
    const faqDetails = document.querySelectorAll('#myths details');
    faqDetails.forEach(detail => {
        detail.addEventListener('toggle', () => {
            // Give it a tiny moment for the browser to calculate the new height
            setTimeout(() => {
                if (window.ScrollTrigger) {
                    ScrollTrigger.refresh();
                }
            }, 50);
        });
    });

    // --- Navbar Scroll Logic ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
});
