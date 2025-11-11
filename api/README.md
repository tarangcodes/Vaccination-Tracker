This folder contains simple PHP API endpoints for the Vaccination Tracker demo.

Place the `api` folder inside your XAMPP `htdocs` (or the site root) so endpoints are available at `http://localhost/api/...`.

Files:
- db.php            PDO connection helper (adjust credentials if needed)
- register.php      POST { username, password }
- login.php         POST { username, password }
- vaccines.php      GET -> returns vaccine list
- children.php      GET?username=...  -> list children for user
                   POST { username, name, dob, gender, blood_group, id? } -> create/update
- parents.php       GET?username=...  -> list parents for user
                   POST { username, name, relation, childId, id? } -> create/update
- mark_dose.php     POST { child_id, code } -> mark a dose with today's date

Migration:
- migrations/init_mysql.sql creates the schema and seeds default vaccines.

Notes & quick usage:
1. Start XAMPP (Apache + MySQL).
2. Run the SQL migration using phpMyAdmin or the MySQL client.
3. Move the project files into `C:\xampp\htdocs\your-project` or adjust accordingly.
4. Use fetch() from the frontend to call endpoints (e.g. POST /api/register.php).

Security:
- These endpoints are intended for local development/demo use only. They identify users by `username` in requests and do not implement token-based auth. For production, replace that with sessions or JWTs.
