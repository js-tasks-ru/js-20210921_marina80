import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  onSubmit = event => {
    event.preventDefault();
    this.save();
  };

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    });

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  constructor (productId) {
    this.productId = productId;
    this.urlProduct = new URL('/api/rest/products', BACKEND_URL);
    this.urlCategories = new URL('/api/rest/categories', BACKEND_URL);

  }

  async render () {
    // последовательные запросы на сервер
    //const data = await this.productId ? this.getData(this.productId) : [this.defaultFormData];
    //const categories = await this.getCategories();

    // параллельные запросы на сервер
    const [data, categories] = await Promise.all([this.productId ? this.getData(this.productId) : [this.defaultFormData], this.getCategories()]);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate(data, categories);
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.subElements.imageListContainer.innerHTML = this.getTemplateImages(data[0].images);
    this.initEventListeners();

  }

  getData(id) {//нужно ли тут использовать async away, если передавать это сразу в Promise.all ???
    this.urlProduct.searchParams.set('id', id);
    const data = fetchJson(this.urlProduct);
    return data;
  }

  getCategories() {//нужно ли тут использовать async away, если передавать это сразу  в Promise.all ???
    this.urlCategories.searchParams.set('_sort', 'weight');
    this.urlCategories.searchParams.set('_refs', 'subcategory');
    const categories = fetchJson(this.urlCategories);
    return categories;
  }

  getTemplate(data, categories) {
    const {
      title,
      description,
      quantity,
      subcategory,
      status,
      price,
      discount
    } = this.productId ? data[0] : this.defaultFormData;

    const dataImages = data[0].images;

    return `
      <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" value="${escapeHtml(title)}" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" value="${description}" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        <ul class="sortable-list">
        </ul>
        </div>
        <button data-element="uploadImage" type="button" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        ${this.getTemplateCategories(categories, subcategory)}
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" value="${price}" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" value="${discount}" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" value="${quantity}" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" value="${status}">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>
    `;
  }

  getTemplateImages(dataImage) {
    let listImages = `<ul class="sortable-list">`;
    for (const img of dataImage) {
      listImages += `
        <li class="products-edit__imagelist-item sortable-list__item">
          <input type="hidden" name="url" value="${escapeHtml(img.url)}">
          <input type="hidden" name="source" value="${escapeHtml(img.source)}">
          <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab" >
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(img.url)}">
          <span>${escapeHtml(img.source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`;
    }
    listImages += `</ul>`;
    return listImages;
  }

  getTemplateCategories(categories, selectedCategory) {
    let listCategories = `<select class="form-control" name="subcategory">`;
    for (const category of categories) {
      for (const subCategory of category.subcategories) {
        listCategories += `<option value="${subCategory.id}" ${subCategory.id === selectedCategory ? 'selected' : ''}>${category.title} &gt; ${subCategory.title}</option>`;
      }
    }
    listCategories += `</select>`;
    return listCategories;
  }

  async save() {
    const formData = new FormData(this.subElements.productForm);

    const productData = {};
    productData.id = this.productId;
    for (let [name, value] of formData) {
      if (!['url', 'source'].includes(name)) {
        productData[`${name}`] = ['price', 'quantity', 'discount', 'status'].includes(name) ? parseInt(value) : value;
      }
    }
    const images = [];
    const listUrls = formData.getAll('url');
    const listSources = formData.getAll('source');
    listUrls.forEach(function(item, i) {
      images.push({
        url: item,
        source: listSources[i]
      });
    });
    productData.images = images;

    try {
      const response = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      this.dispatchEvent(response);

    } catch (error) {
      console.error(error);
    }
  }

  dispatchEvent(data) {
    if (this.productId) {
      new CustomEvent('product-updated', {
        detail: data
      });
      this.element.dispatchEvent('product-updated');
    }
    else {
      new CustomEvent('product-saved', {
        detail: data
      });
      this.element.dispatchEvent('product-saved');
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
