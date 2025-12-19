(() => {
	function isSignupLink(target) {
		if (!target || target.tagName !== "A") {
			return false;
		}
		const href = target.getAttribute("href") || "";
		return href === "#signup" || href.endsWith("/login#signup") || href.endsWith("#signup");
	}

	function onClick(event) {
		const link = event.target.closest("a");
		if (!isSignupLink(link)) {
			return;
		}
		event.preventDefault();
		window.location.href = "/registration";
	}

	document.addEventListener("click", onClick);
})();