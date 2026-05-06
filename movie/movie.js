document.addEventListener("DOMContentLoaded", () => {
	// 1. Берем название фильма из адреса (ссылки)
	const params = new URLSearchParams(window.location.search);
	const movieTitle = params.get("title");

	if (!movieTitle) {
		alert("Фильм не выбран!"); // Простое уведомление
		return;
	}

	// 2. Идем за данными в XML-файл
	fetch("../main_page/movies.xml")
		.then((res) => res.text()) // Читаем как текст
		.then((xmlData) => {
			const parser = new DOMParser();
			const xml = parser.parseFromString(xmlData, "text/xml");
			const allMovies = xml.getElementsByTagName("movie");

			// 3. Ищем нужный фильм обычным циклом (самый понятный способ)
			let foundMovie = null;
			for (let i = 0; i < allMovies.length; i++) {
				const currentTitle =
					allMovies[i].getElementsByTagName("title")[0].textContent;
				if (currentTitle.trim() === movieTitle.trim()) {
					foundMovie = allMovies[i];
					break;
				}
			}

			// 4. Отрисовываем, если нашли
			if (foundMovie) {
				renderMovie(foundMovie);
			} else {
				document.getElementById("title").textContent = "Упс! Фильм не найден";
			}
		})
		.catch((err) => console.error("Ошибка сети:", err));
});

function renderMovie(movie) {
	// Функция-помощник: достает текст из тега по названию
	const getVal = (tagName) =>
		movie.getElementsByTagName(tagName)[0].textContent;

	// Заполняем простые поля
	document.getElementById("title").textContent = getVal("title");
	document.getElementById("rating-val").textContent = getVal("rating");
	document.getElementById("description").textContent = getVal("description");

	// Меняем фон (Hero)
	const poster = getVal("poster");
	document.getElementById("movie-hero").style.backgroundImage =
		`linear-gradient(to top, #0b0b12 10%, transparent), url('../img/${poster}')`;

	// Ссылка на покупку билетов
	document.getElementById("buy-tickets-link").href =
		`../tickets/tickets.html?movie=${encodeURIComponent(getVal("title"))}`;

	// Теги (Возраст + Жанры)
	const tagsDiv = document.getElementById("tags");
	const tagsArray = [getVal("age"), ...getVal("meta").split(",")];

	tagsArray.forEach((tagText) => {
		const span = document.createElement("span");
		span.className = "movie-tag";
		span.textContent = tagText.trim();
		tagsDiv.appendChild(span);
	});

	// Актеры (Cast)
	const castGrid = document.getElementById("cast-grid");
	const persons = movie.getElementsByTagName("person");

	for (const p of persons) {
		const pName = p.getElementsByTagName("name")[0].textContent;
		const pRole = p.getElementsByTagName("role")[0].textContent;
		const pPhoto = p.getElementsByTagName("photo")[0].textContent;

		castGrid.innerHTML += `
            <div class="actor-card">
                <img src="../img/${pPhoto}" alt="${pName}">
                <span class="actor-name">${pName}</span>
                <span class="actor-role">${pRole}</span>
            </div>
        `;
	}

	// Инициализируем кнопку трейлера
	initTrailer(getVal("trailer"));
}

function initTrailer(youtubeId) {
	const modal = document.getElementById("trailer-modal");
	const iframe = document.getElementById("trailer-iframe");
	const playBtn = document.getElementById("play-trailer");
	const closeBtn = document.querySelector(".close-modal");

	if (!youtubeId) {
		playBtn.style.display = "none";
		return;
	}

	playBtn.onclick = () => {
		iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
		modal.classList.add("active");
		document.body.style.overflow = "hidden";
	};

	const close = () => {
		modal.classList.remove("active");
		iframe.src = "";
		document.body.style.overflow = "auto";
	};

	closeBtn.onclick = close;
	modal.onclick = (e) => {
		if (e.target === modal) close();
	};
}
