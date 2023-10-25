import { addElem } from '../../utils.js';
class SideNavigation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.active = 'map'; // map || list
    this.shadowRoot.addEventListener('click', (e) => {
      const isMap = e.target.classList.contains('map');
      const isList = e.target.classList.contains('list');
  
      if (!isMap && !isList) return;
  
      if (isMap && this.active === 'map') return;
      if (isList && this.active === 'list') return;
  
      this.active === 'map' ? this.active = 'list' : this.active = 'map';
  
      this.shadowRoot.querySelectorAll('.switch-bar button').forEach(btn => btn.classList.toggle('active'));
      this.changeView(this.active);
    });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const wrapper = addElem('nav', 'side-navigation');

    wrapper.innerHTML = `
    <button class="logo-trizub"></button>
    <div class="switch-bar">
      <button class="map active"></button>
      <button class="list"></button>
    </div>
    <button class="download"></button>
   `;

    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', './js/web-components/side-navigation/style.css');

    this.shadowRoot.append(linkElem, wrapper);
  }

  changeView(view) {
    const event = new CustomEvent('change-view', {
      bubbles: true,
      detail: view
    })

    this.dispatchEvent(event);
  }
}

customElements.define('side-navigation', SideNavigation);