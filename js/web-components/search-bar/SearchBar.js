class SearchBar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="search-bar">
        <input type="text" placeholder="Search">
        <button class="filters-btn">Filters</button>
      </div>
    `;

    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', './js/web-components/search-bar/style.css');

    this.shadowRoot.prepend(linkElem);
  } 

}

customElements.define('search-bar', SearchBar);