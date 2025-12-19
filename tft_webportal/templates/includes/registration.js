frappe.ready(function () {
	const form = document.querySelector(".tft-register form");
	if (!form) {
		return;
	}

	const registrationFields = form.querySelector(".registration-fields");
	const otpFields = form.querySelector(".otp-fields");
	const otpInput = form.querySelector("#otp_code");
	const verifyBtn = form.querySelector('[data-action="verify-otp"]');
	const resendBtn = form.querySelector('[data-action="resend-otp"]');
	const resendNote = form.querySelector("[data-resend-ready]");
	const resendTimerText = form.querySelector("[data-resend-timer]");
	const resendSecondsEl = form.querySelector("[data-resend-seconds]");
	const editBtn = form.querySelector('[data-action="edit-details"]');
	const statusBlock = form.querySelector("[data-verification-status]");
	const statusSuccess = form.querySelector("[data-status-success]");
	const statusError = form.querySelector("[data-status-error]");
	const emailInput = form.querySelector("#email");
	const emailStatus = form.querySelector("[data-email-status]");
	let resendTimer = null;
	let resendCountdown = null;
	let emailCheckTimer = null;
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function setEmailStatus(message, isError) {
		if (!emailStatus) {
			return;
		}
		emailStatus.textContent = message || "";
		const field = emailStatus.closest(".field");
		if (field) {
			field.classList.toggle("has-error", Boolean(message && isError));
		}
	}

	function showOtpStep() {
		if (registrationFields) {
			registrationFields.classList.add("is-hidden");
			registrationFields.querySelectorAll("input, select, textarea").forEach((el) => {
				el.disabled = true;
			});
		}
		if (otpFields) {
			otpFields.classList.remove("is-hidden");
		}
		if (otpInput) {
			otpInput.disabled = false;
			otpInput.focus();
		}
		if (statusBlock) {
			statusBlock.classList.add("is-hidden");
		}
		if (statusSuccess) {
			statusSuccess.classList.add("is-hidden");
		}
		if (statusError) {
			statusError.classList.add("is-hidden");
		}
		if (resendBtn) {
			resendBtn.classList.add("is-hidden");
		}
		if (resendNote) {
			resendNote.classList.add("is-hidden");
		}
		if (resendTimerText) {
			resendTimerText.classList.remove("is-hidden");
		}

		if (resendTimer) {
			window.clearTimeout(resendTimer);
		}
		if (resendCountdown) {
			window.clearInterval(resendCountdown);
		}

		let secondsLeft = 60;
		if (resendSecondsEl) {
			resendSecondsEl.textContent = String(secondsLeft);
		}
		resendCountdown = window.setInterval(() => {
			secondsLeft -= 1;
			if (resendSecondsEl) {
				resendSecondsEl.textContent = String(Math.max(0, secondsLeft));
			}
			if (secondsLeft <= 0) {
				window.clearInterval(resendCountdown);
			}
		}, 1000);

		resendTimer = window.setTimeout(() => {
			if (resendBtn) {
				resendBtn.classList.remove("is-hidden");
			}
			if (resendNote) {
				resendNote.classList.remove("is-hidden");
			}
			if (resendTimerText) {
				resendTimerText.classList.add("is-hidden");
			}
		}, 60 * 1000);
	}

	function showRegistrationStep() {
		if (otpFields) {
			otpFields.classList.add("is-hidden");
		}
		if (otpInput) {
			otpInput.disabled = true;
			otpInput.value = "";
		}
		if (registrationFields) {
			registrationFields.classList.remove("is-hidden");
			registrationFields.querySelectorAll("input, select, textarea").forEach((el) => {
				el.disabled = false;
			});
		}
		if (resendTimer) {
			window.clearTimeout(resendTimer);
			resendTimer = null;
		}
		if (resendCountdown) {
			window.clearInterval(resendCountdown);
			resendCountdown = null;
		}
		if (resendTimerText) {
			resendTimerText.classList.add("is-hidden");
		}
		if (statusBlock) {
			statusBlock.classList.add("is-hidden");
		}
		if (statusSuccess) {
			statusSuccess.classList.add("is-hidden");
		}
		if (statusError) {
			statusError.classList.add("is-hidden");
		}
	}

	form.addEventListener("submit", (event) => {
		if (!form.checkValidity()) {
			form.reportValidity();
			event.preventDefault();
			return;
		}

		event.preventDefault();
		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());
		window.tftRegistrationState = payload;

		frappe.call({
			method: "tft_webportal.www.registration.send_email_otp",
			args: { email: payload.email },
			callback: () => {
				showOtpStep();
			},
		});
	});

	if (editBtn) {
		editBtn.addEventListener("click", () => {
			showRegistrationStep();
		});
	}

	if (resendBtn) {
		resendBtn.addEventListener("click", () => {
			const email = window.tftRegistrationState?.email;
			if (!email) {
				showRegistrationStep();
				return;
			}
			resendBtn.classList.add("is-hidden");
			if (resendNote) {
				resendNote.classList.add("is-hidden");
			}
			if (resendTimerText) {
				resendTimerText.classList.remove("is-hidden");
			}
			frappe.call({
				method: "tft_webportal.www.registration.send_email_otp",
				args: { email },
				callback: () => {
					showOtpStep();
				},
			});
		});
	}

	if (verifyBtn) {
		verifyBtn.addEventListener("click", () => {
			const otp = otpInput ? otpInput.value.trim() : "";
			if (!otp) {
				if (otpInput) {
					otpInput.focus();
				}
				return;
			}
			const email = window.tftRegistrationState?.email;
			if (!email) {
				showRegistrationStep();
				return;
			}
			verifyBtn.disabled = true;
			verifyBtn.classList.add("is-loading");
			const originalText = verifyBtn.textContent;
			verifyBtn.textContent = "Verifying...";
			frappe.call({
				method: "tft_webportal.www.registration.verify_email_otp",
				args: { email, otp, data: window.tftRegistrationState },
				callback: () => {
					window.tftRegistrationState = {
						...(window.tftRegistrationState || {}),
						otp_code: otp,
					};
					if (otpFields) {
						otpFields.classList.add("is-hidden");
					}
					if (statusBlock) {
						statusBlock.classList.remove("is-hidden");
					}
					if (statusSuccess) {
						statusSuccess.classList.remove("is-hidden");
					}
					if (statusError) {
						statusError.classList.add("is-hidden");
					}
					verifyBtn.disabled = false;
					verifyBtn.classList.remove("is-loading");
					verifyBtn.textContent = originalText;
				},
				error: () => {
					if (statusBlock) {
						statusBlock.classList.remove("is-hidden");
					}
					if (statusError) {
						statusError.classList.remove("is-hidden");
					}
					if (statusSuccess) {
						statusSuccess.classList.add("is-hidden");
					}
					verifyBtn.disabled = false;
					verifyBtn.classList.remove("is-loading");
					verifyBtn.textContent = originalText;
				},
			});
		});
	}

	if (emailInput) {
		emailInput.addEventListener("input", () => {
			if (emailCheckTimer) {
				window.clearTimeout(emailCheckTimer);
			}
			const value = emailInput.value.trim();
			if (!value) {
				setEmailStatus("", false);
				return;
			}
			if (!emailPattern.test(value)) {
				setEmailStatus("Please enter a valid email address.", true);
				return;
			}
			emailCheckTimer = window.setTimeout(() => {
				frappe.call({
					method: "tft_webportal.www.registration.check_user_exists",
					args: { email: value },
					callback: (response) => {
						const exists = Boolean(response?.message?.exists);
						if (exists) {
							setEmailStatus("This email is already registered.", true);
						} else {
							setEmailStatus("", false);
						}
					},
				});
			}, 400);
		});
	}
});
