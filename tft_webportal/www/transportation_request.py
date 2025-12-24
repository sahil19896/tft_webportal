import frappe
from frappe import _
import json

def get_context(context):
	try:
		if frappe.session.user == "Guest":
			frappe.throw(_("You need to be logged in to access this page"))

		user = frappe.get_doc("User", frappe.session.user, ignore_permissions=1)
		context.user_email = user.email
		context.user_phone = user.phone
		context.business_unit = user.company
		context.contact_name = user.full_name
		context.contact_phone = user.phone
		context.contact_email = user.email

		context.addresses = []

		addresses = frappe.db.sql("""
			SELECT
				a.name, a.address_title, a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country, a.phone
			FROM `tabAddress` a
			INNER JOIN `tabDynamic Link` dl ON dl.parent = a.name
			WHERE dl.link_name = %s
		""",(frappe.session.user), as_dict=1)

		for addr in addresses:
			addr.display = ", ".join(filter(None, [addr.address_title, addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode, addr.country]))
			context.addresses.append({"name": addr.name, "display": addr.display, "phone": addr.phone})
	except Exception as e:
		frappe.log_error("Portal Error", f'{e}')