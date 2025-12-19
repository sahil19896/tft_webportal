import frappe
from frappe import _

import random

def context():
	pass


@frappe.whitelist(allow_guest=True)
def send_email_otp(email):
	try:
		if not email:
			frappe.throw(_("Email is required."))
			
		otp = f"{random.randint(100000, 999999)}"
		cache_key = f"tft_webportal:email_otp:{email.lower().strip()}"
		frappe.cache.set_value(cache_key, otp, expires_in_sec=5 * 60, shared=True)
		try:
			frappe.sendmail(recipients=[email], subject=_("Your verification code"), message=_("Your verification code is {0}. It will expire in 5 minutes.").format(otp), now=True,)
		except:
			pass
		return {"status": "sent"}
	except Exception as e:
		frappe.log_error("Email OTP Error", f'{e}')
		frappe.throw(_("We are facing some technical issuees, please try after sometime."))


@frappe.whitelist(allow_guest=True)
def verify_email_otp(email, otp, data=None):
	try:
		if not email or not otp:
			frappe.throw(_("Email and verification code are required."))

		cache_key = f"tft_webportal:email_otp:{email.lower().strip()}"
		cached_otp = frappe.cache.get_value(cache_key, shared=True)
		if not cached_otp or str(cached_otp) != str(otp).strip():
			frappe.throw(_("Invalid or expired verification code."))

		payload = frappe.parse_json(data) if data else {}
		required_fields = ["first_name", "last_name", "email", "phone", "company", "language", "company"]
		missing = [field for field in required_fields if not payload.get(field)]
		if missing:
			frappe.throw(_("Missing required fields: {0}.").format(", ".join(missing)))

		payload_email = str(payload.get("email", "")).lower().strip()
		if payload_email and payload_email != email.lower().strip():
			frappe.throw(_("Email does not match the verification request."))

		if frappe.db.exists("User", email):
			frappe.throw(_("User already exists."))

		user = frappe.get_doc(
			{
				"doctype": "User", "email": email, "send_welcome_email": 0,
				"first_name": payload.get("first_name"), "last_name": payload.get("last_name"),
				"user_type": "Website User", "language": payload.get("language"),
				"enabled": 1, 'phone': payload.get("phone"), "company": payload.get("company")
			}
		)
		user.flags.ignore_permissions = True
		user.insert(ignore_permissions=True)

		frappe.cache.delete_value(cache_key, shared=True)
		return {"status": "verified", "user": user.name}
	except Exception as e:
		frappe.log_error("Email OTP Verify Error", f'{e}')
		frappe.throw(_("We are facing some technical issuees, please try after sometime."))


@frappe.whitelist(allow_guest=True)
def check_user_exists(email):
	if not email:
		return {"exists": False}
	return {"exists": bool(frappe.db.exists("User", email.strip().lower()))}
