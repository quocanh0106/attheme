import './theme.scss';
import 'swiper/css';
import Swiper, { Navigation, Pagination, Scrollbar, Autoplay,  Thumbs } from 'swiper';

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

class ModalOpener extends HTMLElement {
  constructor() {
    super();
    this.id = this?.dataset?.id;
    this.addEventListener('click', () => {
      document.querySelector(this.id).open();
    });
  }
}

customElements.define('modal-opener', ModalOpener);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('.close').forEach(button => {
      button.addEventListener('click', this.hide.bind(this, !1));
    });
    this.addEventListener('keyup', blur => {
      'ESCAPE' === blur.code.toUpperCase() && this.hide();
    });
    this.addEventListener('click', event => {
      if (event.target === this) this.hide();
    });
  }

  open() {
    document.body.classList.add('overflow-hidden');
    this.classList.remove('hidden');
  }
  hide() {
    document.body.classList.remove('overflow-hidden');
    this.classList.add('hidden');
  }
}

customElements.define('modal-dialog', ModalDialog);

class Accordion extends HTMLElement {
  constructor() {
    super();
    this.summary = this.querySelector('.summary');
    this.details = this.querySelector('.details');
    this.summary.addEventListener('click', this.toggle.bind(this));
  }

  toggle() {
    if (this.classList.contains('active')) {
      this.details.style.maxHeight = 0;
    } else {
      this.details.style.maxHeight = this.details.scrollHeight + 'px';
      if (this.classList.contains('sort-by-accordion')) {
        document.addEventListener(
          'click',
          e => {
            if (!this.contains(e.target)) {
              this.details.style.maxHeight = 0;
              this.classList.remove('active');
            }
          },
          false,
        );
      }
    }
    this.classList.toggle('active');
  }
}

customElements.define('accordion-toggle', Accordion);

class SpanLink extends HTMLElement {
  constructor() {
    super();
    this.href = this.getAttribute('href');
    this.addEventListener('click', () => {
      window.location.href = this.href;
    });
  }
}

customElements.define('span-link', SpanLink);

class SwiperComponent extends HTMLElement {
  constructor() {
    super();
    this.infor = JSON.parse(this.dataset.inforSwiper);

    if (this.infor.modules) {
      this.infor.modules = this.infor.modules.map(item => {
        if (item == 'Navigation') {
          return Navigation;
        } else if (item == 'Pagination') {
          return Pagination;
        } else if (item == 'Autoplay') {
          return Autoplay;
        } else {
          return Scrollbar;
        }
      });
    }
    new Swiper(this, this.infor);
  }
}

customElements.define('swiper-component', SwiperComponent);

class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.form = this.querySelector('form');
    this.resetButton = this.querySelector('button[type="reset"]');
    this.openSearch = this.querySelector('#open-search');
    if (this.input) {
      this.input.form.addEventListener('reset', this.onFormReset.bind(this));
      this.openSearch.addEventListener(
        'click',
        this.openSearchMobile.bind(this),
      );
      this.resetButton.addEventListener(
        'click',
        this.closeSearchMobile.bind(this),
      );
      this.input.addEventListener(
        'input',
        debounce(event => {
          this.onChange(event);
        }, 300).bind(this),
      );
    }
  }

  openSearchMobile() {
    this.form.classList.remove('opacity-0', 'invisible');
    document.body.classList.add('overflow-hidden');
  }
  closeSearchMobile() {
    this.form.classList.add('opacity-0', 'invisible');
    document.body.classList.remove('overflow-hidden');
  }
  onChange() {}

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm()) {
      this.input.value = '';
      this.input.focus();
    }
  }
}

customElements.define('search-form', SearchForm);

class PredictiveSearch extends SearchForm {
  constructor() {
    super();
    this.cachedResults = {};
    this.predictiveSearchResults = this.querySelector(
      '[data-predictive-search]',
    );
    this.allPredictiveSearchInstances =
      document.querySelectorAll('predictive-search');
    this.isOpen = false;
    this.abortController = new AbortController();
    this.searchTerm = '';
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));
    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    super.onChange();
    const newSearchTerm = this.getQuery();
    if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
      this.querySelector('#predictive-search-results-groups-wrapper')?.remove();
    }

    // Update the term asap, don't wait for the predictive search query to finish loading
    this.updateSearchForTerm(this.searchTerm, newSearchTerm);

    this.searchTerm = newSearchTerm;

    if (!this.searchTerm.length) {
      this.close(true);
      return;
    }

    this.getSearchResults(this.searchTerm);
  }

  onFormSubmit(event) {
    if (
      !this.getQuery().length ||
      this.querySelector('[aria-selected="true"] a')
    )
      event.preventDefault();
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.searchTerm = '';
      this.abortController.abort();
      this.abortController = new AbortController();
      this.closeResults(true);
    }
  }

  onFocus() {
    const currentSearchTerm = this.getQuery();

    if (!currentSearchTerm.length) return;

    if (this.searchTerm !== currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.getSearchResults(this.searchTerm);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onKeyup(event) {
    if (!this.getQuery().length) this.close(true);
    event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up');
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault();
    }
  }

  updateSearchForTerm(previousTerm, newTerm) {
    const searchForTextElement = this.querySelector(
      '[data-predictive-search-search-for-text]',
    );
    const currentButtonText = searchForTextElement?.innerText;
    if (currentButtonText) {
      if (currentButtonText.match(new RegExp(previousTerm, 'g')).length > 1) {
        // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
        return;
      }
      const newButtonText = currentButtonText.replace(previousTerm, newTerm);
      searchForTextElement.innerText = newButtonText;
    }
  }

  switchOption(direction) {
    if (!this.getAttribute('open')) return;

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');

    // Filter out hidden elements (duplicated page and article resources) thanks
    // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    const allVisibleElements = Array.from(
      this.querySelectorAll('li, button.predictive-search__item'),
    ).filter(element => element.offsetParent !== null);
    let activeElementIndex = 0;

    if (moveUp && !selectedElement) return;

    let selectedElementIndex = -1;
    let i = 0;

    while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
      if (allVisibleElements[i] === selectedElement) {
        selectedElementIndex = i;
      }
      i++;
    }

    this.statusElement.textContent = '';

    if (!moveUp && selectedElement) {
      activeElementIndex =
        selectedElementIndex === allVisibleElements.length - 1
          ? 0
          : selectedElementIndex + 1;
    } else if (moveUp) {
      activeElementIndex =
        selectedElementIndex === 0
          ? allVisibleElements.length - 1
          : selectedElementIndex - 1;
    }

    if (activeElementIndex === selectedElementIndex) return;

    const activeElement = allVisibleElements[activeElementIndex];

    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', activeElement.id);
  }

  selectOption() {
    const selectedOption = this.querySelector(
      '[aria-selected="true"] a, button[aria-selected="true"]',
    );

    if (selectedOption) selectedOption.click();
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(' ', '-').toLowerCase();
    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm, )}&section_id=predictive-search`, {signal: this.abortController.signal})
      .then(response => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then(text => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('#shopify-section-predictive-search').innerHTML;
        // Save bandwidth keeping the cache in all instances synced
        this.allPredictiveSearchInstances.forEach(predictiveSearchInstance => {
          predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
        });
        this.renderSearchResults(resultsMarkup);
      })
      .catch(error => {
        if (error?.code === 20) {
          // Code 20 means the call was aborted
          return;
        }
        this.close();
        throw error;
      });
  }

  setLiveRegionLoadingState() {
    this.statusElement =
      this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText =
      this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute('results', true);

    this.setLiveRegionResults();
    this.open();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(
      this.querySelector('[data-predictive-search-live-region-count-value]')
        .textContent,
    );
  }

  open() {
    this.predictiveSearchResults.style.display = 'block';
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
    document.body.classList.add('overflow-hidden');
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
    this.isOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }
    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('loading');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false;
    this.predictiveSearchResults.removeAttribute('style');
  }
}

customElements.define('predictive-search', PredictiveSearch);

class TruncateParagraph extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('.toggle-truncate');
    this.button.addEventListener('click', () => {
      this.classList.toggle('active');
    });
  }
}

customElements.define('truncate-paragraph', TruncateParagraph);

class WishlistButton extends HTMLElement {
  constructor() {
    super();
    this.product = this.dataset.productHandle;
    this.listProduct = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    if (this.listProduct.includes(this.product)) {
      this.classList.add('active');
    }
    this.addEventListener('click', e => {
      e.preventDefault();
      this.pushToLocalStorage();
    });
  }

  pushToLocalStorage() {
    this.listProduct = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    if (localStorage.getItem('wishlistItems')) {
      if (this.listProduct.includes(this.product)) {
        if (this.listProduct.indexOf(this.product) != -1) {
          this.listProduct.splice(this.listProduct.indexOf(this.product), 1);
          this.classList.remove('active');
          localStorage.setItem(
            'wishlistItems',
            JSON.stringify(this.listProduct),
          );
        }
      } else {
        this.classList.add('active');
        this.listProduct.unshift(this.product);
        localStorage.setItem('wishlistItems', JSON.stringify(this.listProduct));
      }
    } else {
      this.classList.add('active');
      this.listProduct.unshift(this.product);
      localStorage.setItem('wishlistItems', JSON.stringify(this.listProduct));
    }
    document.querySelectorAll('wishlist-count').forEach(count => {
      count.update();
    });
  }

  hidden() {
    document
      .querySelector(`.product-card-wrapper[data-handle="${this.product}"]`)
      .classList.add('hidden');
    if (
      !JSON.parse(localStorage.getItem('wishlistItems')) ||
      JSON.parse(localStorage.getItem('wishlistItems')).length == 0
    ) {
      document
        .querySelector('[data-id="#PopupModal-ClearWishlist"]')
        .classList.add('hidden');
    }
  }
}

customElements.define('wishlist-button', WishlistButton);

class wishlistCount extends HTMLElement {
  constructor() {
    super();
    this.update();
  }

  update() {
    if (localStorage.getItem('wishlistItems')) {
      if (JSON.parse(localStorage.getItem('wishlistItems')).length > 0) {
        this.removeAttribute('style');
        this.querySelector('span').innerHTML = JSON.parse(
          localStorage.getItem('wishlistItems'),
        ).length;
      } else {
        this.style.display = 'none';
      }
    } else {
      this.style.display = 'none';
    }
  }
}

customElements.define('wishlist-count', wishlistCount);

class MediaGallery extends HTMLElement {
  constructor() {
    super();
    this.mainSlide = this.querySelector('.main-slider-media');
    this.subSlide = this.querySelector('.sub-slider-media');
    this.inforMain = JSON.parse(this.mainSlide.dataset.inforSwiper);
    if (this.subSlide) {
      this.inforSub = JSON.parse(this.subSlide.dataset.inforSwiper);
      if (this.inforSub.modules) {
        this.inforSub.modules = this.inforSub.modules.map(item => {
          if (item == 'Navigation') {
            return Navigation;
          } else if (item == 'Pagination') {
            return Pagination;
          } else if (item == 'Thumbs') {
            return Thumbs;
          } else {
            return Scrollbar;
          }
        });
      }
      let subSlider = new Swiper(this.subSlide, this.inforSub);
      let body = { thumbs: { swiper: subSlider } };
      this.inforMain = { ...this.inforMain, ...body };
      if (this.inforMain.modules) {
        this.inforMain.modules = this.inforMain.modules.map(item => {
          if (item == 'Navigation') {
            return Navigation;
          } else if (item == 'Pagination') {
            return Pagination;
          } else if (item == 'Thumbs') {
            return Thumbs;
          } else {
            return Scrollbar;
          }
        });
      }

      new Swiper(this.mainSlide, this.inforMain);
    } else {
      if (this.inforMain.modules) {
        this.inforMain.modules = this.inforMain.modules.map(item => {
          if (item == 'Navigation') {
            return Navigation;
          } else if (item == 'Pagination') {
            return Pagination;
          } else {
            return Scrollbar;
          }
        });
      }

      new Swiper(this.mainSlide, this.inforMain);
    }
  }
}

customElements.define('media-gallery', MediaGallery);

class TabsComponent extends HTMLElement {
  constructor() {
    super();
    this.tabs = this.querySelectorAll('.tab-heading');
    this.tabs.forEach(tab => {
      tab.addEventListener('click', this.handleTabClick.bind(this, tab));
    });
  }

  handleTabClick(clickedTab) {
    if (!clickedTab.classList.contains('active')) {
      const activeTab = this.querySelector('.tab-heading.active');
      const activeTabId = activeTab.dataset.id;
      const targetId = clickedTab.dataset.id;

      this.hideTab(activeTabId);
      this.showTab(targetId);

      activeTab.classList.remove('active');
      clickedTab.classList.add('active');
    }
  }

  hideTab(tabId) {
    this.querySelector(`.tab-detail[data-id='${tabId}']`).classList.add(
      'hidden',
    );
    if (this.querySelector(`.tab-link[data-id='${tabId}']`)) {
      this.querySelector(`.tab-link[data-id='${tabId}']`).classList.add(
        'hidden',
      );
    }
  }

  showTab(tabId) {
    this.querySelector(`.tab-detail[data-id='${tabId}']`).classList.remove(
      'hidden',
    );
    if (this.querySelector(`.tab-link[data-id='${tabId}']`)) {
      this.querySelector(`.tab-link[data-id='${tabId}']`).classList.remove(
        'hidden',
      );
    }
  }
}

if (!customElements.get('tabs-component')) {
  customElements.define('tabs-component', TabsComponent);
}
