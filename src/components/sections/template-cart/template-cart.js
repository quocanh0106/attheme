import './template-cart.scss';

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', this.onButtonClick.bind(this))
      }
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name == 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items');
      cartItems.updateQuantity(this.dataset.key, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
    
    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 500);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }
  
  onChange(event) {
    this.updateQuantity(event.target.dataset.key, event.target.value);
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-shipping-bar',
        section: 'free-shipping',
        selector: '.js-shipping-bar',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      }
    ];
  }

  updateQuantity(key, quantity) {
    const body = JSON.stringify({
      id: key,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
      quantity
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        this.classList.toggle('hidden', parsedState.item_count == 0);
        const cartEmpty = document.getElementById('cart-empty');
        const cartFooter = document.getElementById('main-cart-footer');
        console.log(parsedState.item_count)
        if (cartEmpty) {
          if(parsedState.item_count == 0) {
            cartEmpty.classList.remove('hidden');
          }
        }
        if (cartFooter) cartFooter.classList.toggle('hidden', parsedState.item_count == 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        parsedState.items.forEach(this.updateLineItem.bind(this))
        this.updateTotalPrice(parsedState.total_price)
        const lineItem = document.querySelector(`[data-key="${key}"]`) || document.querySelector(`[data-key="${key}"]`);
        if (parseInt(quantity) === 0) {
          lineItem.remove()
        }
      }).catch(() => {
        const errors = document.getElementById('cart-errors');
        if(errors) {
          errors.textContent = window.cartStrings.error;
        }
      });
  }

  updateTotalPrice(total) {
    const totalEl = document.querySelector('.totals__subtotal-value')

    totalEl.innerHTML = Shopify.formatMoney(total, Shopify.currency_format)
  }

  updateLineItem(item) {
    const itemEl = this.querySelector(`[data-key="${item.key}"]`)
    if (itemEl) {
      const itemPrices = itemEl.querySelectorAll('.price')
      itemPrices.forEach(itemPrice => itemPrice.innerHTML = Shopify.formatMoney(item.final_line_price, Shopify.currency_format))
    }
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`);
      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;

  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, 300))
    }
  });
};

class ReloadImage extends HTMLElement {
  constructor() {
    super();
    this.reloadImage();
  }

  reloadImage() {
    setTimeout(() => {
      this.querySelector('img').src = this.dataset.src;
    }, 8000)
  }
}

if (!customElements.get('reload-image')) {
  customElements.define('reload-image', ReloadImage );
};
