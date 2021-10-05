export default class ColumnChart {
  constructor(options) {
    this.options = options || {};
    this.data = this.options.data || [];
    this.label = this.options.label || '';
    this.link = this.options.link || '';
    this.value = this.options.value || '';
    this.formatHeading = this.options.formatHeading || ((data) => data);
    this.chartHeight = 50;
    this.render();
  }

  getTemplate() {
    return `
    <div class="column-chart">
      <div class="column-chart__title"></div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
    `;
  }

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate;
    this.element = div.firstElementChild;
    div.querySelector('.column-chart').style.setProperty('--chart-height', this.chartHeight);

    div.innerHTML = `<a href="/${this.label}" class="column-chart__link">View all</a>`;

    const titleSelector = this.element.querySelector('.column-chart__title');
    titleSelector.append(`Total ${this.label}`);
    titleSelector.append(div.firstElementChild);

    this.element.querySelector('[data-element="header"]').append(`${this.formatHeading(this.value.toLocaleString("en"))}`);

    const chartSelector = this.element.querySelector('[data-element="body"]');
    if (this.data.length == 0) {
      chartSelector.parentNode.parentNode.classList.add('column-chart_loading');
    }
    else {
      const columnProps = getColumnProps(this.data);
      for (const item of columnProps) {
        div.innerHTML = `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
        chartSelector.append(div.firstElementChild);
      }
    }

    function getColumnProps(data) {
      const maxValue = Math.max(...data);
      const scale = 50 / maxValue;

      return data.map(item => {
        return {
          percent: (item / maxValue * 100).toFixed(0) + '%',
          value: String(Math.floor(item * scale))
        };
      });
    }
  }

  update() {
    this.render();
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

}

