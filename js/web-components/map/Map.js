import DataService from '../../DataService.js';
import { addElem, fetchCityData, getEndpoint, mapCrimeNames } from '../../utils.js';
import renderSVG from './render-svg.js';

class Map extends HTMLElement {
  static observedAttributes = ["view"];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.addEventListener('click', ({ target }) => {
      if (!target.classList.contains('crime-type')) return;
      const type = target.dataset.type;
      this.dispatchCrimeBar(type);
    });
  }

  async connectedCallback() {
    await this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const main = this.shadowRoot.querySelector('main');
    if (!main) return;
    main.setAttribute('data-view', newValue);
  }

  async render() {
    this.shadowRoot.innerHTML = `<main data-view="map">
        <div class="map">
          ${await renderSVG()}
          <div class="crime-bar" data-test="test">
            ${await this.renderCrimeBar()}
          </div>
        </div>
        <div class="list"></div>
      </main>`;

    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', './js/web-components/map/style.css');
    this.shadowRoot.prepend(linkElem);
    await this.renderCrimeBar();
  }

  async update(data) {
    const elem = this.shadowRoot.querySelector('.map');
    elem.innerHTML = await renderSVG(data);
    const crimeBar = addElem('div', 'crime-bar');
    crimeBar.setAttribute('data-test', 'test');
    crimeBar.innerHTML = await this.renderCrimeBar();
    elem.append(crimeBar);
  }

  async renderList(state) {
    const listWrapper = this.shadowRoot.querySelector('.list');
    const { selectedCrimeTypes, selectedRegion } = state;

    if (selectedRegion === 'All States') {
      listWrapper.classList.add('centered');
      listWrapper.innerHTML = '<h2>Please select region</h2>';
      return;
    }
    console.log(selectedCrimeTypes);
    const data = await DataService.getRegionData(selectedRegion);
    const filteredData = data.filter(({ affected_type }) => selectedCrimeTypes.some(type => +type === affected_type)).slice(0, 10);
    console.log(filteredData);
    listWrapper.classList.remove('centered');

    const html = await Promise.all(filteredData.map(async ({ lat, lon, event, affected_type }) => {

      const url = getEndpoint(lat, lon);

      const data = await fetchCityData(url);

      const crimeTypes = await DataService.getCrimeType();
      
      const crime = crimeTypes[affected_type];
      const cityName = data['name'];
      console.log(cityName)
      
      return `
        <div>
          <h4>${crime}</h4>
          <div>
            <p class="title">Status:</p>
            <p class="value">In captivity</p>
          </div>
          <div>
            <p class="title">Region:</p>
            <p class="value">${selectedRegion}</p>
          </div>
          <div>
            <p class="title">City:</p>
            <p class="value">${cityName}</p>
          </div>
          <button class="details"></button>
        </div>
      `;

    }));

    console.log(DataService.names);

    listWrapper.innerHTML = `
      ${html.join('')}
    `;
    listWrapper.classList.add('full');
  }

  updateDots(data) {
    const types = data.selectedCrimeTypes;
    const svg = this.shadowRoot.querySelector('svg');
    const textsNodes = this.shadowRoot.querySelectorAll('text');
    textsNodes.forEach(node => {
      const type = [...node.classList].find(item => item.startsWith('type')).slice(-2); //crimetype: '30' || '31' etc.
      if (types.some(item => item === type)) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    const activeDots = [...textsNodes].filter(node => node.classList.contains('active')).map(node => node.parentElement);
    svg.append(...activeDots);
  }

  async renderCrimeBar() {
    const crimeTypes = await DataService.getCrimeType(); // {30: 'Death of an individual', 31: 'Tho
    return Object.entries(crimeTypes).map(([key, value]) => {
      return `<button class="crime-type type-${key}" data-type="${key}">
        <span class="marker"></span>
        <span>${mapCrimeNames(value)}</span>
      </button>`;
    }).join('');
  }

  dispatchCrimeBar(crimetype) {
    const event = new CustomEvent('crime-bar', {
      bubbles: true,
      composed: true,
      detail: crimetype
    });
    this.dispatchEvent(event);
  }

}

customElements.define('map-component', Map);