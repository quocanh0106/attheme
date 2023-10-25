class WishlistWrapper extends HTMLElement {
  constructor() {
    super();
    this.listProduct = JSON.parse(localStorage.getItem('wishlistItems'));
    this.parser = new DOMParser();
    if(this.listProduct) {
      this.ProductGrid();
    }
  }

  async ProductGrid() {
    this.dom = '';
    this.products = await Promise.all(this.listProduct.map((value) => {return fetch(`/products/${value}`).then(response => response.text())})).then(response => {return response});
    if(this.products.length) {
      document.querySelector('[data-id="#PopupModal-ClearWishlist"]').classList.remove('hidden')
    }
    console.log(this.products)
    this.products.forEach((product) => {
      if(this.productCard(product)) {
        let newProduct = this.productCard(product).replace('<li class="swiper-slide max-w-1/2 md:max-w-1/3 lg:max-w-1/4 mr-0.5 lg:mr-2.5">', '').replace('</li>', '')
        this.dom += newProduct;
      }
    })


    this.querySelector('#whislist-wrapper').innerHTML = this.dom;
    this.querySelectorAll('wishlist-button').forEach((button) => {
      button.addEventListener('click', () => {
        button.hidden();
      })
    })
  }

  productCard(product) {
    return this.parser.parseFromString(product, 'text/html').querySelector('#product-card')?.innerText;
  }
}

customElements.define('wishlist-wrapper', WishlistWrapper);

class WishlistClear extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', () => {
      localStorage.removeItem('wishlistItems');
      document.querySelector('#whislist-wrapper').innerHTML = '';
      document.querySelector('[data-id="#PopupModal-ClearWishlist"]').classList.add('hidden')
    })
  }
}

customElements.define('wishlist-clear', WishlistClear);