// Функция для создания кнопок пагинации
function createPageBtn(page, classes=[]) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

// Отрисовка элемента пагинации
function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    // Кнопка "Первая страница"
    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    // Создание кнопок для страниц (по 5 страниц)
    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(createPageBtn(i, i == info.current_page ? ['active'] : []));
    }

    // Кнопка "Последняя страница"
    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

// Обработчик кнопки выбора количества записей на странице
function perPageBtnHandler(event) {
    downloadData(1);
}

// Установка информации о пагинации
function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count > 0 ? (info.current_page - 1) * info.per_page + 1 : 0;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
}

// Обработчик кнопок для перехода между страницами
function pageBtnHandler(event) {
    if (event.target.dataset.page) { //хранит номер страницы
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0); // Прокручиваем к началу страницы
    }
}

// Создание элемента автора
function createAuthorElement(record) {
    let user = record.user || {'name': {'first': '', 'last': ''}};
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

// Создание элемента количества лайков
function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

// Создание элемента нижнего колонтитула (footer)
function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

// Создание элемента контента
function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

// Создание элемента списка фактов
function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

// Отображение записей (фактов)
function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';  // Очищаем предыдущие записи
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

// Загрузка данных с сервера
function downloadData(page = 1) {
    let factsList = document.querySelector('.facts-list');
    let url = new URL(factsList.dataset.url);
    let perPage = document.querySelector('.per-page-btn').value;
    url.searchParams.append('page', page);  //добавление к адресу параметров поиска
    url.searchParams.append('per-page', perPage);

    // Получаем значение из поля поиска
    let searchQuery = document.querySelector('.search-field').value;
    if (searchQuery) {
        url.searchParams.append('q', searchQuery);  // Добавляем параметр поиска
    }

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        renderRecords(this.response.records);
        setPaginationInfo(this.response['_pagination']);
        renderPaginationElement(this.response['_pagination']);
    };
    xhr.send();
}

// Обработчик кнопки поиска
function searchBtnHandler(event) {
    event.preventDefault();  // Предотвращаем перезагрузку страницы
    downloadData(1);  // Загружаем данные для первой страницы при поисковом запросе
}

// Получение автодополнений для ввода
function getAutocompleteSuggestions(query) {
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete');
    url.searchParams.append('q', query);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        displayAutocompleteSuggestions(this.response);
    };
    xhr.send();
}

// Отображение предложений автодополнения
function displayAutocompleteSuggestions(suggestions) {
    let suggestionsContainer = document.querySelector('.autocomplete-suggestions');
    suggestionsContainer.innerHTML = '';  // Очищаем старые предложения

    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestions.forEach(suggestion => {
        let suggestionElement = document.createElement('div');
        suggestionElement.classList.add('autocomplete-suggestion');
        suggestionElement.innerHTML = suggestion;
        suggestionElement.onclick = function () {
            document.querySelector('.search-field').value = suggestion;
            suggestionsContainer.style.display = 'none';  // Скрываем контейнер после выбора
        };
        suggestionsContainer.appendChild(suggestionElement);
    });
    suggestionsContainer.style.display = 'block';
}

// Обработчик для автодополнения при вводе текста в поле
document.querySelector('.search-field').oninput = function () {
    let query = this.value;
    if (query.length > 0) {
        getAutocompleteSuggestions(query);  // Получаем предложения автодополнения
    } else {
        document.querySelector('.autocomplete-suggestions').style.display = 'none';  // Скрываем контейнер при пустом вводе
    }
};

// Инициализация данных и привязка событий при загрузке страницы
window.onload = function () {
    downloadData();  // Загрузка данных при первой загрузке страницы
    document.querySelector('.pagination').onclick = pageBtnHandler;
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler;

    // Привязываем обработчик кнопки поиска
    document.querySelector('.search-btn').onclick = searchBtnHandler;
};
