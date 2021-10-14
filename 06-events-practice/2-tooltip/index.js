class Tooltip {
  static activeTooltip;

  constructor() {
    if (Tooltip.activeTooltip) {
      return Tooltip.activeTooltip;
    }
    Tooltip.activeTooltip = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerover);
    document.addEventListener('pointerout', this.pointerout);
  }

  pointerover = (event) => {
    if (event.target.dataset.tooltip) {
      document.addEventListener('pointermove', this.pointermove);
      const block = event.target.closest('[data-tooltip]');
      const text = block.dataset.tooltip;
      this.render(text);
    }
  }

  pointermove = (event) => {
    const gap = 10;
    this.element.style.top = event.y + gap + 'px';
    this.element.style.left = event.x + gap + 'px';
  }

  pointerout = (event) => {
    this.remove();
    document.removeEventListener('pointermove', this.onpointermove);

  }

  render(text) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<div class="tooltip"></div>';
    const element = wrapper.firstElementChild;
    this.element = element;
    this.element.append(text);
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerover);
    document.removeEventListener('pointerout', this.pointerout);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
