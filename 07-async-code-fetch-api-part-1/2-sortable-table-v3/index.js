import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  step = 20;
  start = 1;
  end = this.start + this.step;

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const loadedData = await this.loadData(id, order, this.start, this.end);

      const uploadItems = document.createElement('div');

      uploadItems.innerHTML = this.getTableRows(loadedData);
      for (const item of uploadItems.children) {
        this.subElements.body.append(item);
      }

      this.loading = false;
    }
  };

  constructor(headersConfig = [], {
    url = '',
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
  } = {}) {
    this.data = data;
    this.url = new URL(url, BACKEND_URL);
    this.headerConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" >
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });
    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;

    this.subElements = this.getSubElements(element);

    let field = this.sorted.id;
    let order = this.sorted.order;

    if (this.isSortLocally) {
      this.sortOnClient(field, order);

    } else {

      this.sortOnServer(field, order, this.start, this.end);

      document.addEventListener('scroll', this.onWindowScroll);
    }

    this.subElements.header.addEventListener('pointerdown', (event) => {

      const column = event.target.closest('.sortable-table__cell');

      if (column.getAttribute('data-sortable') === 'true') {
        const field = column.getAttribute('data-id');
        const dataOrder = column.getAttribute('data-order');
        let order = 'asc';
        order = dataOrder === 'desc' ? 'asc' : 'desc';
        if (this.isSortLocally) {
          this.sortOnClient(field, order);
        } else {
          this.sortOnServer(field, order, this.start, this.end);
        }
      }

    });
  }

  renderArrow(field, order) {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = order;
  }

  sortOnClient(field, order) {
    const sortedData = this.sortData(field, order);
    this.renderArrow(field, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(field, order, start, end) {
    const loadedData = await this.loadData(field, order, start, end);
    this.renderArrow(field, order);
    this.subElements.body.innerHTML = this.getTableRows(loadedData);

  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  async loadData(field, order, start, end) {
    this.url.searchParams.set('_sort', field);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener('scroll', this.onWindowScroll);
  }
}
