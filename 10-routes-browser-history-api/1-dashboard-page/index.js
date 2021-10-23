import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};

  constructor() {
    this.header = header;
    //this.progressBar = document.querySelector('.progress-bar');
    this.initComponents();
    //this.progressBar.setAttribute('style', 'display: none');
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    //init rangePicker
    const rangePicker = new RangePicker({
      from,
      to
    });
    this.rangePicker = rangePicker;

    // init sortableTable component
    const sortableTable = new SortableTable(this.header, {
      url: `/api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`
    });
    this.sortableTable = sortableTable;

    // init ordersChart component
    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to,
      },
      label: 'orders',
      link: '#',
    });
    this.ordersChart = ordersChart;

    // init salesChart component
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to,
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });
    this.salesChart = salesChart;

    // init customersChart component
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to,
      },
      label: 'customers',
    });
    this.customersChart = customersChart;

  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);

    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);
    this.subElements.sortableTable.append(this.sortableTable.element);

    this.subElements = this.getSubElements(element);

    this.initEventListeners();

    return this.element;
  }

  getTemplate () {
    return `
    <div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
      <div data-element="sortableTable" class="sortable-table"></div>
    </div>
    `;
  }

  initEventListeners () {
    this.rangePicker.element.addEventListener('date-select', event => {
      const { detail } = event;
      const { from, to } = detail;
      //this.progressBar.setAttribute('style', 'display: block');
      this.update(from, to);
      //this.progressBar.setAttribute('style', 'display: none');
    });
  }

  async update(from, to) {
    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`);
    this.subElements.body.innerHTML = '';
    this.sortableTable.update(data);
    this.ordersChart.update(from, to);
    this.salesChart.update(from, to);
    this.customersChart.update(from, to);

  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
    this.rangePicker.element.removeEventListener('date-select', event => {});
  }
}

