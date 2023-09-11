class MenuHoverEffect extends HTMLElement {
  constructor() {
    super();
    this.menu = this?.querySelectorAll('.menu-effect');
    if (this.querySelectorAll('.parent-menu-effect').length) {
      this.menu = this.querySelectorAll('.parent-menu-effect');
    }
    this.menu.forEach(menuchild => {
      menuchild?.addEventListener('mouseover', () => {
        this.menu.forEach(item => {
          item.classList.add('opacity-50');
        });
      });

      menuchild?.addEventListener('mouseout', () => {
        this.menu.forEach(item => {
          item.classList.remove('opacity-50');
        });
      });
    });
  }
}

customElements.define('menu-hover-effect', MenuHoverEffect);

class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.menu = this.querySelector('.megamenu');
    this.summaries = this.querySelectorAll('.summary');
    this.back = this.querySelectorAll('.back');
    this.close = this.querySelector('.close-menu');
    this.addEventListener('click', event => {
      if (event.target.nodeName === 'MENU-DRAWER') this.hide();
    });
    this.close?.addEventListener('click', this.hide.bind(this));
    this.summaries.forEach(summary => {
      summary.addEventListener('click', () => {
        summary.nextElementSibling.classList.add('!visible', '!opacity-100');
        summary.nextElementSibling.classList.remove('-translate-x-full');
      });
    });
    this.back.forEach(prev => {
      prev.addEventListener('click', () => {
        prev.closest('.details').classList.remove('!visible', '!opacity-100');
        summary.nextElementSibling.classList.add('-translate-x-full');
      });
    });
  }
  
  open() {
    this.classList.remove('invisible');
    this.menu.classList.add('translate-x-0');
    document.body.classList.add('overflow-hidden');
  }

  hide() {
    this.classList.add('invisible');
    this.menu.classList.remove('translate-x-0');
    document.body.classList.remove('overflow-hidden');
  }
}

customElements.define('menu-drawer', MenuDrawer);

let headerBounds = {}
let currentScrollTop = 0;

let observerHeader = new IntersectionObserver((entries, observer) => {
  headerBounds = entries[0].intersectionRect;
  observer.disconnect();
});

observerHeader.observe(document.querySelector('header'));

document.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > currentScrollTop && scrollTop > headerBounds.bottom) {
    document.body.classList.remove('sticky-header');
  } else if (scrollTop < currentScrollTop && scrollTop > headerBounds.bottom) {
    document.body.classList.add('sticky-header');
  } else if (scrollTop <= headerBounds.top) {
    document.body.classList.remove('sticky-header');
  }

  currentScrollTop = scrollTop;
})