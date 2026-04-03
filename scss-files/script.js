/**
 * Оптимизированный скрипт для портфолио
 * Улучшена производительность и читаемость кода
 */

(function() {
  'use strict';

  // Утилита для debounce
  function debounce(func, wait) {
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

  // Утилита для throttle
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Предотвращение копирования и выделения текста
  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('selectstart', (e) => e.preventDefault());

  // Инициализация FAQ аккордеона
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq__item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const answer = item.querySelector('.faq__answer');
      if (!answer) return;

      item.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-opened');

        if (isOpen) {
          // Закрытие
          answer.style.height = answer.scrollHeight + 'px';
          requestAnimationFrame(() => {
            answer.style.height = '0px';
          });
          item.classList.remove('faq-opened');
        } else {
          // Открытие
          answer.style.height = answer.scrollHeight + 'px';
          item.classList.add('faq-opened');

          const handler = () => {
            answer.style.height = 'auto';
            answer.removeEventListener('transitionend', handler);
            
            // Плавная прокрутка к открытому элементу
            item.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          };

          answer.addEventListener('transitionend', handler, { once: true });
        }
      });
    });
  }

  // Управление хедером при прокрутке
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    const headerMobile = document.querySelector('.header-mobile');
    
    if (!header && !headerMobile) return;

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const distanceToEnd = totalHeight - (scrollY + windowHeight);

      // Десктопный хедер
      if (header) {
        if (scrollY >= 100) {
          header.classList.add('hd-scr');
        } else {
          header.classList.remove('hd-scr');
        }

        if (distanceToEnd <= 400) {
          header.classList.add('hide');
        } else {
          header.classList.remove('hide');
        }
      }

      // Мобильный хедер
      if (headerMobile) {
        headerMobile.style.display = distanceToEnd <= 700 ? 'none' : '';
      }
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Lazy loading для изображений
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Инициализация при загрузке DOM
  function init() {
    initFAQ();
    initHeaderScroll();
    initLazyLoading();
  }

  // Запуск после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();