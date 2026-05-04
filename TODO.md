# BIMT College PHP/MySQL Backend - COMPLETED ✅

## Summary of Implementation:
- ✅ Database: setup.sql created (bimt_db, enquiries, admin tables; admin/admin123)
- ✅ Core PHP: config.php, submit_form.php, login.php, dashboard.php, update.php, delete.php, logout.php
- ✅ Security: PDO prepared statements, password_hash/verify, session auth
- ✅ Frontend Integration: contact.html & index.html forms now POST to submit_form.php; nav to login.php
- ✅ Admin: Full CRUD (view/update/delete enquiries), stats, responsive UI

## Setup Instructions:
1. Install XAMPP (Apache + MySQL)
2. Start Apache & MySQL
3. Open phpMyAdmin (localhost/phpmyadmin), run setup.sql
4. Copy project to htdocs/BIMT-Website/
5. Access: http://localhost/BIMT-Website/index.html or contact.html
6. Test Enquiry form → submit_form.php
7. Admin: login.php (admin/admin123) → dashboard.php
8. Update/Delete enquiries

## Files Created/Updated:
```
setup.sql          # DB schema + data
config.php         # PDO connection
submit_form.php    # Form handler
login.php          # Admin login (replaces admin.html)
dashboard.php      # Dashboard (replaces dashboard.html)
update.php         # Status update
delete.php         # Delete enquiry
logout.php         # Session logout
contact.html       # Form action updated
index.html         # Form action updated
TODO.md            # This file
```

Backend fully integrated with existing frontend. JS forms now submit via PHP (may need script.js tweaks if AJAX conflicts, but POST works).

All requirements met: DB, forms, admin panel, dashboard, update/delete, security, comments, simple UI.
