import DataService from '../../DataService.js';
import { addElem } from '../../utils.js';

class RootComponent extends HTMLElement {
  constructor() {
    super();
    this.data = [];

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.addEventListener('svg-render', (e) => {
      const map = this.shadowRoot.querySelector('map-component');
      const data = e.detail;
      map.update(data);
    })

    this.shadowRoot.addEventListener('svg-update', (e) =>{
      const map = this.shadowRoot.querySelector('map-component');
      const data = e.detail;
      map.updateDots(data);
    })

    this.shadowRoot.addEventListener('crime-bar', (e) =>{
      const type = e.detail;
      const filterBox = this.shadowRoot.querySelector('side-bar').filterBox;
      console.log(filterBox);
      filterBox.filterByCrimeType(type);
    })

    this.shadowRoot.addEventListener('change-view', async ({detail}) => {
      const map = this.shadowRoot.querySelector('map-component')
      map.setAttribute('view', detail);
      if(detail === 'map') return;

      const state = this.shadowRoot.querySelector('side-bar').filterBox.state;
      await map.renderList(state);
    })

    this.addEventListener('list-update', ({detail}) => {
      console.log(detail);
      const map = this.shadowRoot.querySelector('map-component');
      map.renderList(detail);
    })
  }

  async connectedCallback() {
    try {
      const data = await DataService.fetchData();
      this.data = data;
      this.render();
    } catch(err) {
      console.error(err);
    }
  }

  render() {

    const wrapper = addElem('div', 'wrapper');
    const sideNavigation = addElem('side-navigation', 'side-navigation');
    const map = addElem('map-component', 'map');
    const sideBar = addElem('side-bar');

    map.setAttribute('view', 'map');

    sideBar.data = this.data;

    wrapper.append(sideNavigation, map, sideBar);


    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', './js/web-components/root-component/style.css');

    this.shadowRoot.append(linkElem, wrapper);

  }

}

customElements.define('root-component', RootComponent);