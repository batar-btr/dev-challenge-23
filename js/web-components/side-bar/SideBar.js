import DataService from '../../DataService.js';
import { addElem } from '../../utils.js';

class SideBar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this.render();
  }

  get filterBox () {
    return this.shadowRoot.querySelector('filter-box');
  }

  render() {
    const shadow = this.shadowRoot;

    const wrapper = addElem('aside', 'wrapper');
    
    const searchBar = addElem('search-bar');
    const filterBox = addElem('filter-box');

    filterBox.data = this.data;

    wrapper.append(searchBar, filterBox)


    const style = addElem('style');
    style.textContent = `
      .wrapper {
        width: 490px;
      }
    `
    
    shadow.append(style, wrapper);

  }

}

customElements.define('side-bar', SideBar);