document.addEventListener("DOMContentLoaded", () => {
	const params = new URLSearchParams(window.location.search);
	const movieName = (params.get("movie") || params.get("title"))
		?.trim()
		.toLowerCase();

	let currentPrice = 0;
	let selectedSeats = [];

	// 1. Загрузка данных
	fetch("../main_page/movies.xml")
		.then((res) => res.text())
		.then((data) => {
			const xml = new DOMParser().parseFromString(data, "text/xml");
			const all = [
				...xml.getElementsByTagName("movie"),
				...xml.getElementsByTagName("banner"),
			];
			const movie = all.find(
				(m) =>
					m.querySelector("title").textContent.trim().toLowerCase() ===
					movieName,
			);

			// ИСПРАВЛЕНО: Вместо тернарного оператора используем if/else
			if (movie) {
				init(movie);
			} else {
				const titleEl = document.getElementById("movie-title");
				if (titleEl) titleEl.innerText = "Фильм не найден";
			}
		});

	// 2. Инициализация
	function init(node) {
		document.getElementById("movie-title").innerText =
			node.querySelector("title").textContent;
		document.getElementById("movie-age").innerText =
			node.querySelector("age").textContent;
		currentPrice = parseFloat(node.querySelector("price").textContent);
		document.getElementById("price-per-ticket").innerText =
			`${currentPrice.toFixed(2)} BYN`;

		renderGroup(
			"dates-container",
			node.querySelectorAll("date"),
			(date) => {
				renderGroup(
					"times-container",
					date.querySelectorAll("time"),
					(time) => {
						renderSeats(time.getAttribute("seats")?.split(",") || []);
					},
				);
			},
			"value",
		);
	}

	// Универсальная функция для кнопок (Дата/Время)
	function renderGroup(containerId, nodes, onClick, attr = null) {
		const container = document.getElementById(containerId);
		if (!container) return;

		container.innerHTML = "";
		nodes.forEach((node, i) => {
			const btn = document.createElement("button");
			btn.className = "chip";
			btn.innerText = attr ? node.getAttribute(attr) : node.textContent;
			btn.onclick = () => {
				container.querySelectorAll(".chip").forEach((c) => {
					c.classList.remove("active");
				});
				btn.classList.add("active");
				onClick(node);
			};
			container.appendChild(btn);
			if (i === 0) btn.click();
		});
	}

	// 3. Рендер мест
	function renderSeats(seatsArr) {
		const grid = document.getElementById("seats-grid");
		if (!grid) return;

		grid.innerHTML = "";
		selectedSeats = [];
		updateTotal();

		seatsArr.forEach((status, i) => {
			const seat = document.createElement("div");
			const isBusy = status.trim() === "1";
			seat.className = `seat ${isBusy ? "busy" : "free"}`;

			if (!isBusy) {
				seat.onclick = () => {
					seat.classList.toggle("selected");
					const id = i + 1;

					if (seat.classList.contains("selected")) {
						selectedSeats.push(id);
					} else {
						selectedSeats = selectedSeats.filter((s) => s !== id);
					}
					updateTotal();
				};
			}
			grid.appendChild(seat);
		});
	}

	function updateTotal() {
		const total = `${(selectedSeats.length * currentPrice).toFixed(2)} BYN`;
		["total-price", "btn-total", "summary-price"].forEach((id) => {
			const el = document.getElementById(id);
			if (el) el.innerText = total;
		});

		const summaryLabel = document.getElementById("summary-label");
		if (summaryLabel) {
			summaryLabel.innerText = selectedSeats.length
				? `Билеты (×${selectedSeats.length})`
				: "Выберите места";
		}
	}

	// 4. Оплата (без перенаправления)
	const paymentForm = document.getElementById("payment-form");
	if (paymentForm) {
		paymentForm.onsubmit = function (e) {
			e.preventDefault();
			if (!selectedSeats.length) return alert("Выберите места!");

			const btn = this.querySelector(".pay-button");
			if (btn) {
				btn.innerText = "Оплачено";
				btn.style.cssText = "background-color: #4ade80; color: #1a1a1a;";
				btn.disabled = true;
			}

			// Блокируем всё взаимодействие
			const grid = document.getElementById("seats-grid");
			if (grid) grid.style.pointerEvents = "none";

			document.querySelectorAll(".chip").forEach((c) => {
				c.style.pointerEvents = "none";
			});
			this.querySelectorAll("input").forEach((i) => {
				i.disabled = true;
			});
		};
	}
});
