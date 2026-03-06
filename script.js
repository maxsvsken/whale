document.addEventListener('DOMContentLoaded', () => {

    // --- Burger Menu Logic ---
    const burger = document.getElementById('burger');
    const navLinks = document.querySelector('.nav-links');

    if (burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            burger.classList.toggle('open');
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

    // --- Smooth Scroll for anchors ---
    const navAnchors = document.querySelectorAll('.nav-btn, .dot-btn, .logo, .dot-nav a');

    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent normal jump

            const href = this.getAttribute('href');
            if (!href) return;

            const targetId = (href === '#' || !href) ? '#hero' : href;
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // If GSAP and ScrollTrigger are ready
                if (window.gsap && window.ScrollTrigger) {
                    let triggers = ScrollTrigger.getAll();
                    let st = triggers.find(t => t.trigger === targetElement && t.vars.pin);

                    if (st) {
                        // For pinned sections, use st.start
                        gsap.to(window, {
                            duration: 0,
                            scrollTo: st.start,
                            ease: "none"
                        });
                    } else {
                        // For other elements, use offsetTop
                        gsap.to(window, {
                            duration: 0,
                            scrollTo: { y: targetElement.offsetTop, autoKill: false },
                            ease: "none"
                        });
                    }
                } else {
                    // Hard fallback if GSAP not loaded
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                if (window.innerWidth <= 900 && navLinks) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    // --- Counter Animation for Stats ---
    const counters = document.querySelectorAll('.counter');
    const speed = 100; // Fewer steps make it feel more deliberate and slower

    const animateCounters = () => {
        counters.forEach(counter => {
            const animate = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText.replace('%', '') || 0;
                const inc = target / speed;

                if (count < target) {
                    const nextCount = count + inc;
                    counter.innerText = Math.ceil(nextCount) + '%';
                    setTimeout(animate, 30); // Increased delay for slower, more visible updates
                } else {
                    counter.innerText = target + '%';
                }
            }
            animate();
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reset to 0 before starting animation to make it visible every time
                counters.forEach(c => c.innerText = '0%');
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

            // Stacking context
            gsap.set(section, {
                position: 'relative',
                zIndex: sections.length - index,
                opacity: 1 // Ensure section itself is visible
            });

            // Special handling for the Code (rules) section
            if (section.id === 'code') {
                const list = section.querySelector('.code-list');
                const intro = section.querySelector('.code-intro');

                if (list && intro) {
                    // Force the section to pin and the list to scroll
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: section,
                            start: "top top",
                            end: () => `+=${list.offsetHeight}`,
                            pin: true,
                            scrub: 1,
                            pinSpacing: true,
                            onUpdate: (self) => {
                                // Scroll the list through its height
                                const scrollDistance = list.offsetHeight - window.innerHeight + 120;
                                if (scrollDistance > 0) {
                                    gsap.set(list, { y: -scrollDistance * self.progress });
                                }
                            }
                        }
                    });

                    // Add dot tracking
                    ScrollTrigger.create({
                        trigger: section,
                        start: "top 50%",
                        end: () => `+=${list.offsetHeight}`,
                        onEnter: () => updateDot(index),
                        onEnterBack: () => updateDot(index)
                    });

                    return; // Skip default logic for this section
                }
            }

            const isLongSection = section.offsetHeight > window.innerHeight * 1.2;

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
                // Long sections fade out container at the end
                if (container) {
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

        window.addEventListener('load', () => ScrollTrigger.refresh());
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
});
