// Ждем, пока страница полностью загрузится
window.onload = function () {
	// Находим место, куда вставить футер
	const footerContainer = document.getElementById("footer-place");

	// Загружаем файл footer.html
	fetch("../components/footer.html")
		.then((response) => response.text())
		.then((data) => {
			footerContainer.innerHTML = data; // Вставляем текст внутрь блока
		});
};
