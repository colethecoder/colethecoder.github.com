/*!
 * Adapted from Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under MIT (https://spdx.org/licenses/MIT)
 */

(function () {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;

    // Mobile menu toggle (the CSS shows the menu when aria-expanded is true)
    var toggle = nav.querySelector('.site-nav-toggle');
    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });

    // Wide screens: hide the navbar when scrolling down, show it again on scroll up
    var wide = window.matchMedia('(min-width: 1170px)');
    var previousTop = 0;
    window.addEventListener('scroll', function () {
        var currentTop = window.scrollY;
        if (wide.matches) {
            if (currentTop < previousTop) {
                if (currentTop > 0 && nav.classList.contains('is-fixed')) {
                    nav.classList.add('is-visible');
                } else {
                    nav.classList.remove('is-visible', 'is-fixed');
                }
            } else {
                nav.classList.remove('is-visible');
                if (currentTop > nav.offsetHeight) nav.classList.add('is-fixed');
            }
        }
        previousTop = currentTop;
    }, { passive: true });
})();
