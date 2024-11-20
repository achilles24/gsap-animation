import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

document.addEventListener('DOMContentLoaded', function() {
    const textBoxes = document.querySelectorAll('.feature-takeover-hero-card');
    const takeoverFirstCards = textBoxes[0].getBoundingClientRect().left;
    const images = document.querySelectorAll('.feature-takeover-storytelling-scroller-section:not(:first-child) img');

    const firstImage = document.querySelector('.feature-takeover-storytelling-scroller-section img');
    
    function setDimensions() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const allImages = document.querySelectorAll('.feature-takeover-storytelling-scroller-section img');
        allImages.forEach((image, idx) => {
            if (idx != 0) {
                image.style.width = `${viewportWidth}px`;
            }
            image.style.height = `${viewportHeight}px`;
            image.style.objectFit = 'cover';
        });
    }

    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
        textBoxes.forEach((each, idx) => {
            if (idx != 0) {
                each.style.left = `${takeoverFirstCards}px`;
            }
        });
        setDimensions();
    }

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: Array.from({ length: 101 }, (_, i) => i / 100)
    };

    const observer = new IntersectionObserver((entries, observer) => {
        const windowHeight = window.innerHeight;
        entries.forEach(entry => {
            const image = entry.target;
            const index = Array.from(images).indexOf(image);
            const textBox = textBoxes[index];
            const overlay = image.nextElementSibling;
            const rect = entry.boundingClientRect;
            if (entry.isIntersecting) {
                const scrollPercent = entry.intersectionRatio;
                const scale = 1.15 - (scrollPercent * 0.15);
                image.style.transform = `scale(${Math.max(1, Math.min(1.15, scale))})`;

                if (!isMobile) {
                    const imageHeight = image.getBoundingClientRect().height;
                    const imageMidPoint = imageHeight / 4
                    const textBoxOffset = (rect.top < windowHeight - imageMidPoint) ? -10 - ((scrollPercent - 0.25) * 40) : 0;
                    textBox.style.transform = `translateY(${Math.max(-10, Math.min(0, textBoxOffset))}vh)`;
                }

                // const blurAmount = Math.min(10, (1 - scrollPercent) * 10);
                // image.style.filter = `blur(${blurAmount}px)`;

                const overlayOpacity = Math.min(0.64, (1 - scrollPercent) * 0.64);
                overlay.style.background = `rgba(0, 0, 0, ${overlayOpacity})`;

                image.style.filter = 'blur(0px)';
                overlay.style.background = 'rgba(0, 0, 0, 0)';

            } else {
                if (entry.boundingClientRect.top < 0) {
                    image.style.filter = 'blur(10px)';
                    overlay.style.background = 'rgba(0, 0, 0, 0.64)';
                    if (!isMobile) {
                        textBox.style.transform = 'translateY(-10vh)';
                    }
                } else {
                    if (!isMobile) {
                        textBox.style.transform = 'translateY(0vh)';
                    }
                    image.style.filter = 'blur(0px)';
                    overlay.style.background = 'rgba(0, 0, 0, 0)';
                }
            }
        });
    }, options);
  
    images.forEach(image => {
        observer.observe(image);
    });

    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
    const firstSection = document.querySelector('.feature-takeover-storytelling-scroller-section');
    ScrollTrigger.create({
        trigger: firstImage,
        start: 'top 50vh',
        end: 'bottom top',
        onEnter: () => {
            firstSection.classList.add('first-image');
            textBoxes[0].classList.add('visible');
            textBoxes[0].style.left = `${textBoxes[1].getBoundingClientRect().left}px`;
        },
        onLeaveBack: () => {
            firstSection.classList.remove('first-image');
            textBoxes[0].classList.remove('visible');
            textBoxes[0].style.left = isMobile ? '0' : '-64px';
        },
        // markers: true, // Remove this line in production
        scrub: 1
    });

    // Scroll to next image
    images.forEach((image, index) => {
        if (index > 0) {
            ScrollTrigger.create({
                trigger: image,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => {
                    gsap.to(window, { duration: 1, scrollTo: { y: image, autoKill: false } });
                },
                onLeaveBack: () => {
                    if (index > 0) {
                        gsap.to(window, { duration: 1, scrollTo: { y: images[index - 1], autoKill: false } });
                    }
                },
                markers: true, // Remove this line in production
                scrub: 1
            });
        }
    })
    
    // Smooth scroll to adjacent image on user scroll
    let lastScrollTop = 0;
    let isScrolling = false;

    function handleScroll(event) {
        if (isScrolling) return;

        const st = window.pageYOffset || document.documentElement.scrollTop;
        if (event.deltaY > 0 || event.type === 'scroll' && st > lastScrollTop) {
            // Scroll down
            const nextImage = Array.from(images).find(img => img.getBoundingClientRect().top > window.innerHeight / 2);
            if (nextImage && nextImage !== images[images.length - 1]) {
                isScrolling = true;
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: nextImage, autoKill: false },
                    onComplete: () => { isScrolling = false; }
                });
            }
        } else if (event.deltaY < 0 || event.type === 'scroll' && st < lastScrollTop) {
            // Scroll up
            const prevImage = Array.from(images).reverse().find(img => img.getBoundingClientRect().bottom < window.innerHeight / 2);
            if (prevImage) {
                isScrolling = true;
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: prevImage, autoKill: false },
                    onComplete: () => { isScrolling = false; }
                });
            }
        }
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    }

    window.addEventListener('wheel', handleScroll);
    window.addEventListener('scroll', handleScroll);
});
