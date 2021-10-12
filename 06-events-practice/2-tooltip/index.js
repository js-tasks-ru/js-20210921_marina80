class Tooltip {

  static activeTooltip;

  constructor() {
    this.initialize();
  }

  initialize() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<div class="tooltip"></div>';
    const element = wrapper.firstElementChild;
    this.element = element;

    document.addEventListener('pointerover', this.pointerover);
    document.addEventListener('pointerout', this.pointerout);
  }

  pointerover = (event) => {
    if (event.target.dataset.tooltip != undefined) {
      let message = event.target.getAttribute('data-tooltip');
      this.element.style.top = event.y + 'px';
      this.element.style.left = event.x + 'px';
      this.render(message);
    }
  }

  pointerout = (event) => {
    if (event.target.dataset.tooltip != undefined) {
      this.destroy();
    }
  }

  render(message) {
    if (!Tooltip.activeTooltip) {
      Tooltip.activeTooltip = this;
      //let tooltip = new Tooltip();
      this.initialize();
      this.element.append(message);
      document.body.append(this.element);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    Tooltip.activeTooltip = null;
  }
}

export default Tooltip;
