export default class NotificationMessage {
  static notificationShow;
  element;

  constructor(message, {
    duration = 1000,
    type = 'success'
  } = {}) {
    this.message = message || '';
    this.duration = duration || 'success';
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    if (!document.getElementById('notification')) {
      element.setAttribute('id', 'notification');
      document.body.append(element);
    }
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  show(div = document.getElementById("notification")) {
    //div = document.getElementById("notification");
    if (NotificationMessage.notificationShow) {
      NotificationMessage.notificationShow.destroy();
    }
    div.append(this.element);
    NotificationMessage.notificationShow = this;
    setTimeout(() => this.destroy(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
