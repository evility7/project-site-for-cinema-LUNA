document.addEventListener("DOMContentLoaded", () => {
	// 1. МЕНЮ БУРГЕР
	const burger = document.getElementById("burger");
	const nav = document.querySelector(".nav");

	if (burger) {
		burger.onclick = () => {
			burger.classList.toggle("active");
			nav.classList.toggle("nav-open");

			// Блокировка скролла при открытом меню
			document.body.style.overflow = nav.classList.contains("nav-open")
				? "hidden"
				: "auto";
		};
	}

	// Закрытие меню при клике на ссылки (важно для мобильной навигации)
	const navLinks = document.querySelectorAll(".nav-link");
	navLinks.forEach((link) => {
		link.onclick = () => {
			if (burger) burger.classList.remove("active");
			if (nav) nav.classList.remove("nav-open");
			document.body.style.overflow = "auto";
		};
	});

	// 2. ЗАГРУЗКА ДАННЫХ
	const allMovies = [];

	fetch("main_page/movies.xml")
		.then((response) => response.text())
		.then((data) => {
			const parser = new DOMParser();
			const xml = parser.parseFromString(data, "text/xml");

			// Заполнение БАННЕРА
			const banner = xml.querySelector("banner");
			if (banner) {
				const bTitle = banner.querySelector("title").textContent;
				const bImg = banner.querySelector("image").textContent;
				const bTrailer = banner.querySelector("trailer").textContent;

				const heroBanner = document.getElementById("hero-banner");
				if (heroBanner)
					heroBanner.style.backgroundImage = `url('../img/${bImg}')`;

				document.getElementById("hero-title").textContent = bTitle;
				document.getElementById("hero-desc").textContent =
					banner.querySelector("description").textContent;
				document.getElementById("hero-duration").textContent =
					banner.querySelector("duration").textContent;
				document.getElementById("hero-purchase-link").href =
					`../tickets/tickets.html?movie=${encodeURIComponent(bTitle)}`;

				document.getElementById("hero-tags").innerHTML =
					"<span>" +
					banner.querySelector("genres").textContent +
					"</span>" +
					"<span>" +
					banner.querySelector("age").textContent +
					"</span>" +
					"<span style='color: #fbbf24;'>" +
					banner.querySelector("rating").textContent +
					"</span>";

				// Модальное окно
				const modal = document.getElementById("trailer-modal");
				const iframe = document.getElementById("trailer-iframe");
				const playBtn = document.getElementById("play-trailer");

				if (playBtn) {
					playBtn.onclick = () => {
						iframe.src = `https://www.youtube.com/embed/${bTrailer}?autoplay=1`;
						modal.classList.add("active");
						document.body.style.overflow = "hidden";
					};
				}

				const closeBtn = document.querySelector(".close-modal");
				if (closeBtn) {
					closeBtn.onclick = () => {
						modal.classList.remove("active");
						iframe.src = "";
						document.body.style.overflow = "auto";
					};
				}
			}

			// Парсинг списка фильмов
			const movieNodes = xml.querySelectorAll("movie");
			movieNodes.forEach((m) => {
				allMovies.push({
					title: m.querySelector("title").textContent,
					age: m.querySelector("age").textContent,
					rating: m.querySelector("rating").textContent,
					meta: m.querySelector("meta").textContent,
					poster: m.querySelector("poster").textContent,
					genres: m
						.querySelector("meta")
						.textContent.split("•")[0]
						.toLowerCase()
						.trim(),
				});
			});

			renderMovies("all");
		});

	// 3. ФУНКЦИЯ ВЫВОДА ФИЛЬМОВ
	const moviesList = document.getElementById("movies-list");

	function renderMovies(genreFilter) {
		if (!moviesList) return;
		moviesList.innerHTML = "";

		allMovies.forEach((movie) => {
			if (
				genreFilter !== "all" &&
				!movie.genres.includes(genreFilter.toLowerCase())
			) {
				return;
			}

			const card = document.createElement("article");
			card.className = "movie";
			card.innerHTML = `
                <img src='../img/${movie.poster}' class='movie-poster'>
                <div class='movie-info'>
                    <h3 class='movie-title'>${movie.title}</h3>
                    <div class='movie-meta'>
                        <span>${movie.age}</span><span class='movie-dot'></span><span>${movie.meta}</span>
                    </div>
                    <div class='movie-bottom'>
                        <a href='../tickets/tickets.html?movie=${encodeURIComponent(movie.title)}' class='movie-btn-link'>
                            <button class='btn btn-primary'>Билеты</button>
                        </a>
                        <div class='movie-rating'>${movie.rating}</div>
                    </div>
                </div>`;

			// Клик по карточке (с проверкой, чтобы не срабатывало при нажатии на кнопку билетов)
			card.onclick = (event) => {
				if (!event.target.closest(".movie-btn-link")) {
					window.location.href = `../movie/movie.html?title=${encodeURIComponent(movie.title)}`;
				}
			};

			moviesList.appendChild(card);
		});
	}

	// 4. КНОПКИ ФИЛЬТРАЦИИ
	const genreBtns = document.querySelectorAll(".genre");
	genreBtns.forEach((btn) => {
		btn.onclick = function () {
			genreBtns.forEach((b) => {
				b.classList.remove("active");
			});
			this.classList.add("active");
			renderMovies(this.getAttribute("data-genre"));
		};
	});
});
