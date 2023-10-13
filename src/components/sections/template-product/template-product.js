import './template-product.scss';

const trapFocusHandlers = {};

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.querySelectorAll('fieldset').forEach(sector=> sector.addEventListener('change', this.onVariantChange.bind(this))) 
  }
  init() {
    this.checkOption(document.querySelector('#on-init').getAttribute('data-current-option'), document.querySelector('#on-init').getAttribute('data-current-value'))
  }

  checkOption(option_name, option_value) {
    var data = this.getVariantData();
    switch (parseInt(option_name)) {
      case 0:
        document.querySelectorAll('.data-layer-1 label, .data-layer-1 input, .data-layer-2 label, .data-layer-2 input').forEach(el => el.classList.remove('active'));
        var available_products = data.filter(variant => {return variant.option1 == option_value});
        if (available_products && available_products.length > 0) {
          this.refresh= [...new Set(available_products.map(o => o.option2))]
          this.refresh.push(...new Set(available_products.map(o => o.option3)));
          this.changeValue('input[value="'+ available_products[0].option2 +'"')
          this.changeValue('input[value="'+ available_products[0].option3 +'"',false)
          document.querySelectorAll('.data-layer-2 label, .data-layer-2 input, .data-layer-1 label, .data-layer-1 input').forEach(el => el.classList.add('hidden'))
        }
        break;
      case 1:
        document.querySelectorAll('.data-layer-1 label, .data-layer-1 input, .data-layer-2 label, .data-layer-2 input').forEach(el => el.classList.remove('active'))
        var available_products = data.filter(variant => {return variant.option2 == option_value});
        if (available_products && available_products.length > 0) {
          this.refresh = [...new Set(available_products.map(o => o.option3))];
          this.changeValue('input[value="'+ available_products[0].option3 +'"',false)
          document.querySelectorAll('.data-layer-2 label, .data-layer-2 input').forEach(el => el.classList.add('hidden'))
        }
        break;
      case 2:
        document.querySelectorAll('.data-layer-2 label, .data-layer-2 input').forEach(el => el.classList.remove('active'))
        break;
      default:         
        document.querySelectorAll('.data-layer-0 label, .data-layer-0 input').forEach(el => el.classList.remove('active'))
        var available_products = data.filter(variant => {return variant.option1 == option_value})
        if (available_products && available_products.length > 0) {
          this.refresh= [...new Set(available_products.map(o => o.option2))]
          this.refresh.push(...new Set(available_products.map(o => o.option3)));
          this.changeValue('input[value="'+ available_products[0].option2 +'"')
          this.changeValue('input[value="'+ available_products[0].option3 +'"')
          document.querySelectorAll('.data-layer-2 label, .data-layer-2 input, .data-layer-1 label, .data-layer-1 input').forEach(el => el.classList.add('hidden'))
        }
        break;
    }
    if (this.refresh) this.refresh.map(item => this.setDisable(item))
  }
  
  updateOptionsAvailable(evt) {
    this.target = evt.target;
    if(parseInt(evt.target.getAttribute('data-index')) == 0) this.querySelectorAll('.data-layer-0 label, .data-layer-0 input').forEach(el => el.classList.remove('active'));
    this.checkOption(evt.target.getAttribute('data-index'), evt.target.value)
    evt.target.classList.add('active');
    this.querySelector('label[for="'+ evt.target.id + '"]').classList.add('active');
  }
  changeValue(selector) {
    if (this.querySelector(selector)) {
      this.querySelector(selector).checked = true;
      this.querySelector('label[for="'+ this.querySelector(selector).id + '"]').classList.add('active')
    }
  }

  setDisable(item) {
    var el = this.querySelector('input[value="'+ item +'"]')
    if (el) {
      el.classList.remove('hidden');
      this.querySelector('label[for="'+ el.id + '"]').classList.remove('hidden')
    }
  }
  onVariantChange(evt) {
    
    this.updateOptionsAvailable(evt);
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.removeErrorMessage();
    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      if (evt.target.closest('input') ) {
        document.querySelector('#on-init').setAttribute('data-current-value', evt.target.closest('input').getAttribute('value'));
      }
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
    mediaGalleries.forEach(mediaGallery => mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true));

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant) return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    document.querySelector(`#product-form-${this.dataset.section} input[name="id"]`).value = this.currentVariant.id;
    document.querySelector(`#product-form-${this.dataset.section} input[name="id"]`).dispatchEvent(new Event('change', { bubbles: true }));
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.form.querySelector('[name=id]').disabled = false;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cart = document.querySelector('cart-notification');
    this.submitButton = this.querySelector('[type="submit"]');
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

    this.handleErrorMessage();

    this.submitButton.setAttribute('aria-disabled', true);
    this.submitButton.classList.add('loading');
    this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    const formData = new FormData(this.form);
    if (this.cart) {
      formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      this.cart.setActiveElement(document.activeElement);
    }
    config.body = formData;

    fetch(`${routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (this.cart) {
          this.cart.renderContents(response);
          this.cart.open();
        }
        if (response.status) {
          this.handleErrorMessage(response.description);

          const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
          if (!soldOutMessage) return;
          this.submitButton.setAttribute('aria-disabled', true);
          this.submitButton.querySelector('span').classList.add('hidden');
          soldOutMessage.classList.remove('hidden');
          this.error = true;
          return;
        } else if (!this.cart) {
          window.location = window.routes.cart_url;
          return;
        }

      })
      .catch((e) => {
        console.error(e);
      })
      
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
    if (!this.errorMessageWrapper) return;
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }
}

customElements.define('product-form', ProductForm);

class ProductInfor extends HTMLElement {
  constructor() {
    super();
    this.listProduct = JSON.parse(localStorage.getItem('recentlyViewedProducts')) || [];
    this.product = this.dataset.product;
    this.pushToLocalStorage(this.product);
  }

  pushToLocalStorage() {
    if (localStorage.getItem('recentlyViewedProducts')) {
      if(!this.listProduct.includes(this.product)) {
        this.listProduct.unshift(this.product);
        if(this.listProduct.length > 6) {
          this.listProduct.pop();
        }
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(this.listProduct));
      }
    } else {
      this.listProduct.unshift(this.product);
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(this.listProduct));
    }
  }
}

customElements.define('product-infor', ProductInfor);

class CartNotification extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
  }

  open() {
    this.classList.remove('opacity-0', 'invisible');
    setTimeout(() => {
      this.close();
    }, 1500);
  }

  close() {
    this.classList.add('opacity-0', 'invisible');
    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    this.cartItemKey = parsedState.key;
    this.getSectionsToRender().forEach((section) => {
      document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });

    if (this.header) this.header.reveal();
    this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);

class CaculatorSize extends HTMLElement {
  constructor() {
    super();
    this.options = this.querySelectorAll('.change-resize');
    this.options.forEach((item) => {
      item.addEventListener('click', () => {
        if(item.textContent != this.dataset.unit) {
          this.removeActive();
          item.classList.add('active');
          this.caculator(item);
        }
      })
    })
  }
  
  caculator(item) {
    if(this.dataset.unit != item.textContent) {
      this.dataset.unit = item.textContent;
      if(item.textContent == 'cm') {
        this.querySelectorAll('td').forEach((num) => {
          num.textContent = parseFloat(2.54 * parseFloat(num.textContent)).toFixed(0)
        })
      } else {
        this.querySelectorAll('td').forEach((num) => {
          num.textContent = num.dataset.in
        })
      }
    }
  }

  removeActive() {
    this.options.forEach((item) => {
      item.classList.remove('active')
    })
  }

}

customElements.define('caculator-size', CaculatorSize);