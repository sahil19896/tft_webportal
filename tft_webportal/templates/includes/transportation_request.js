frappe.ready(() => {
	const rows = document.getElementById("vehicle-rows");
	const addBtn = document.querySelector("[data-add-vehicle-row]");
	if (!rows || !addBtn) {
		return;
	}

	let rowIndex = rows.children.length;

	function buildCell(name, type = "text", placeholder = "") {
		const td = document.createElement("td");
		const input = document.createElement("input");
		input.name = name;
		input.type = type;
		if (placeholder) {
			input.placeholder = placeholder;
		}
		if (type === "number") {
			input.min = "1";
			input.placeholder = placeholder || "1";
		}
		td.appendChild(input);
		return td;
	}

	function buildSelectCell(name, options, defaultValue = null) {
		const td = document.createElement("td");
		const select = document.createElement("select");

		select.name = name;

		options.forEach(opt => {
			const option = document.createElement("option");
			option.value = opt.value;
			option.textContent = opt.label;

			if (defaultValue !== null && opt.value === defaultValue) {
				option.selected = true;
			}

			select.appendChild(option);
		});

		td.appendChild(select);
		return td;
	}

	function buildRemoveCell() {
		const td = document.createElement("td");
		td.className = "row-actions";
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "row-remove";
		btn.setAttribute("aria-label", "Remove row");
		btn.textContent = "✕";
		td.appendChild(btn);
		return td;
	}

	addBtn.addEventListener("click", () => {
		rowIndex += 1;
		const tr = document.createElement("tr");
		tr.appendChild(buildCell(`vin_${rowIndex}`, "text", "1C3CCBAB5EN125414"));
		tr.appendChild(buildCell(`vehicle_number_${rowIndex}`, "text", "4521909"));
		tr.appendChild(buildCell(`make_model_${rowIndex}`, "text", "2014 Chrysler 200"));
		tr.appendChild(buildCell(`description_${rowIndex}`, "text", "Car"));
		tr.appendChild(buildCell(`plate_${rowIndex}`, "text", "CTET844"));
		tr.appendChild(buildSelectCell(`hitch_${rowIndex}`, [{ label: "No", value: "No" }, { label: "Yes", value: "Yes" }], "No"));
		tr.appendChild(buildRemoveCell());
		rows.appendChild(tr);
	});

	rows.addEventListener("click", (event) => {
		const btn = event.target.closest(".row-remove");
		if (!btn) {
			return;
		}
		const row = btn.closest("tr");
		if (!row) {
			return;
		}
		if (rows.children.length <= 1) {
			row.querySelectorAll("input").forEach((input) => {
				input.value = "";
			});
			return;
		}
		row.remove();
	});
});
