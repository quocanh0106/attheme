import './account.scss';

class TogglePassword extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.eye = this.querySelector('.eye');
    this.eye.addEventListener('click', this.togglePassword.bind(this));
  }
  
  togglePassword() {
    if(this.input.type == 'password') {
      this.input.type = 'text';
      this.eye.classList.add('active');
    } else {
      this.input.type = 'password';
      this.eye.classList.remove('active');
    }
  }
}

customElements.define('toggle-password', TogglePassword)