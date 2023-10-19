class BlogLoadmore extends HTMLElement {
  constructor() {
    super();
    this.buttonLoadmore = this.querySelector('.load-more_btn');
    this.maxPage = parseInt(this.buttonLoadmore.dataset.page);
    this.buttonLoadmore.addEventListener('click', this.handleLoadMore.bind(this));
  }

  handleLoadMore() {
    this.buttonLoadmore.classList.add('spinning');
    this.url = this.buttonLoadmore.dataset.href;
    fetch(this.url)
    .then(response => response.text())
    .then(html => {
      let dom = new DOMParser().parseFromString(html, 'text/html');
      document.querySelector('.blog-wrapper').innerHTML += dom.querySelector('.blog-wrapper').innerHTML;
      this.page = this.url.split('page=')[1];
      if(parseInt(this.page) < this.maxPage) {
        this.buttonLoadmore.dataset.href = this.url.replace(`page=${parseInt(this.page)}`, `page=${parseInt(this.page) + 1}`)
      } else {
        this.classList.add('hidden')
      }
    }).finally(() => {
      this.buttonLoadmore.classList.remove('spinning');
    }) 
  }

}
customElements.define('blog-loadmore', BlogLoadmore);
