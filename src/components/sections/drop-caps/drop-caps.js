import './drop-caps.scss';

class DropCaps extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('.drop-content');
    this.caps = this.querySelector('.drop-caps');
    this.toggleButton = this.querySelector('.toggle-button');
    this.toggleButton.addEventListener('click', this.toggle.bind(this));
  }

  toggle() {
    if(this.caps.getAttribute('style')) {
      this.caps.removeAttribute('style');
      this.content.classList.remove('active');
      this.toggleButton.textContent = this.toggleButton.dataset.more;
    } else {
      this.caps.style.maxHeight = this.caps.scrollHeight + 'px';
      this.content.classList.add('active');
      this.toggleButton.textContent = this.toggleButton.dataset.less;
      if(this.closest('.details')) {
        this.closest('.details').style.maxHeight = '100%'
      }
    }
  }
}

customElements.define('drop-caps', DropCaps);