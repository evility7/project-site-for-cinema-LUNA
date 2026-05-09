window.onload = function () {
    const footerContainer = document.getElementById("footer-place");
    if (!footerContainer) return;

    // Определяем путь: если мы в корне (нет слешей в пути кроме домена), 
    // используем прямой путь. Если во вложенной папке — добавляем ../
    const isRoot = window.location.pathname.endsWith('/') || 
                   window.location.pathname.endsWith('index.html') ||
                   window.location.pathname.split('/').pop().indexOf('.') === -1;

    const path = isRoot ? "components/footer.html" : "../components/footer.html";

    fetch(path)
        .then((response) => {
            if (!response.ok) throw new Error('Ошибка загрузки футера');
            return response.text();
        })
        .then((data) => {
            footerContainer.innerHTML = data;
        })
        .catch(err => console.error(err));
};