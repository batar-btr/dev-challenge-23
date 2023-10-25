import DataService from '../../DataService.js';
import { addElem, mapCrimeNames } from '../../utils.js';

class FilterBox extends HTMLElement {
  constructor() {
    super();
    this.state = {
      selectedCrimeTypes: ['30', '31', '32', '33', '34'],
      selectedRegion: 'All States',
      selectedCities: 'All Cities / Towns'
    };
    this.initCrimes = [];
    this.attachShadow({ mode: 'open' });
  }

  get data() {
    return this._data;
  }

  get getState() {
    return this.state;
  }

  set data(value) {
    this._data = value;
    this.render();
  }

  async render() {
    const crimeTypes = await this.data.getCrimeType();
    const regions = await this.data.getAllRegions();

    const checkbox = (id, name, label, checked) => `
      <div class='checkbox-line'>
        <label for=${id}>${label}
          <input type="checkbox" id=${id} value=${label} name=${name} ${checked ? 'checked' : ''}>
          <span class="custom-checkbox"></span>
        </label>
        <span>12345</span>
      </div>
    `;

    const option = (value) => `
      <option value=${value}>${value.toLowerCase()}</option>
    `;


    this.shadowRoot.innerHTML = `
      <form class="filter-box-wrap">
        <h2>Filters</h2>
        <h4>Crime Type</h4>
        <fieldset>
          ${Object.entries(crimeTypes).map(([id, value]) => {
      return checkbox(id, 'crime-type', mapCrimeNames(value), true);
    }).join('')}
          ${checkbox('all', 'crime-type', 'All', true)}
        </fieldset>
        <h4>Region</h4>
        <select id="regions">
          <option value="All States" selected>All States</option>
          ${regions.map(region => option(region)).join('')}
        </select>
        <h4>City / Town</h4>
        <select id="towns" disabled>
          <option selected>All Towns</option>
          ${regions.map(region => option(region)).join('')}
        </select>
        <h4 class="results">Results: 12 345</h4>
        <ul class="filter-tags"></ul>
        <button class="reset-filter">Clear All Filters</button>
      </form>
    `;
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', './js/web-components/filter-box/style.css');
    this.shadowRoot.prepend(linkElem);

    await this.addListeners();
    this.updateCrimeCounts();
    this.updateTotalResult();
    this.updateFilterTags();
    this.svgRenderEvent();
  }

  async updateCrimeCounts() {
    const counts = await this.data.getCrimesCountsByRegion(this.state.selectedRegion);
    // console.log(counts);

    this.shadowRoot.querySelectorAll('.checkbox-line').forEach(elem => {
      const id = elem.querySelector('[type=checkbox]').id;
      const span = elem.querySelector('.checkbox-line > span');
      if (id === 'all') {
        span.textContent = Object.values(counts).reduce((a, b) => a + b);
      } else {
        span.textContent = counts[id];
      }
    });
  }

  async updateTotalResult() {
    const counts = await this.data.getCrimesCountsByRegion(this.state.selectedRegion);

    const selectedIds = [...this.shadowRoot.querySelectorAll('[type=checkbox]:checked')]
      .map(elem => +elem.id)
      .filter(id => id);

    const resultCount = selectedIds.map(id => counts[id]).reduce((a, b) => a + b, 0);

    this.shadowRoot.querySelector('.results').textContent = `Results: ${resultCount.toLocaleString()}`;
  }

  async updateFilterTags() {
    const crimeTypes = await this.data.getCrimeType();
    const wrapper = this.shadowRoot.querySelector('.filter-tags');
    wrapper.innerHTML = '';
    this.state.selectedCrimeTypes.forEach(type => {
      const elem = addElem('li', `crime-tag`);
      elem.classList.add(`type-${type}`);
      elem.textContent = mapCrimeNames(crimeTypes[type]);
      wrapper.append(elem);
    });
  }

  svgRenderEvent() {
    const event = new CustomEvent('svg-render', {
      detail: this.state,
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  svgUpdateEvent() {
    const event = new CustomEvent('svg-update', {
      detail: this.state,
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  listUpdate() {
    const event = new CustomEvent('list-update', {
      detail: this.state,
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  async addListeners() {
    const crimeTypes = await this.data.getCrimeType();
    const checkboxes = this.shadowRoot.querySelectorAll('[name=crime-type]');
    const selectRegion = this.shadowRoot.querySelector('#regions');
    const reset = this.shadowRoot.querySelector('.reset-filter');

    checkboxes.forEach(elem => elem.addEventListener('click', (e) => {
      if (elem.id === 'all') {
        checkboxes.forEach(input => input.checked = elem.checked);

        elem.checked ?
          this.state.selectedCrimeTypes = Object.keys(crimeTypes) :
          this.state.selectedCrimeTypes = [];
      } else {
        const namedCrymeCheckboxes = [...checkboxes].filter(({ id }) => id !== 'all');
        const allCrymeCheckbox = [...checkboxes].filter(({ id }) => id === 'all')[0];

        namedCrymeCheckboxes.every(item => item.checked) ?
          allCrymeCheckbox.checked = true :
          allCrymeCheckbox.checked = false;

        e.target.checked ?
          this.state.selectedCrimeTypes.push(elem.id) :
          this.state.selectedCrimeTypes = this.state.selectedCrimeTypes.filter(item => item !== elem.id);
      }

      this.updateTotalResult();
      this.updateFilterTags();
      this.svgUpdateEvent();
    }));

    selectRegion.addEventListener('change', async (e) => {
      const value = e.target.value;
      this.state.selectedRegion = value;
      this.updateCrimeCounts();
      this.updateTotalResult();
      this.svgRenderEvent();
      this.listUpdate();
    });

    reset.addEventListener('click', (e) => {
      e.preventDefault();
      this.state.selectedCrimeTypes = [...this.initCrimes];
      this.state.selectedRegion = 'All States';
      const checkBoxes = this.shadowRoot.querySelectorAll('input[type=checkbox]');
      checkBoxes.forEach(elem => elem.checked = false);
      this.updateCrimeCounts();
      this.updateTotalResult();
      this.updateFilterTags();
      this.svgRenderEvent();
    });
  }

  filterByCrimeType(type) {

    const checkBoxes = this.shadowRoot.querySelectorAll('input[type=checkbox]');
    checkBoxes.forEach(elem => elem.checked = false);

    [...checkBoxes].find(({ id }) => id === type).checked = true;


    this.state.selectedCrimeTypes = [type];
    this.updateTotalResult();
    this.updateFilterTags();
    this.svgUpdateEvent();
  }

}

customElements.define('filter-box', FilterBox);