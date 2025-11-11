const LS_USER_KEY = 'vt_users';
const LS_SESSION_KEY = 'vt_session';
const LS_CHILDREN_KEY = 'vt_children';
const LS_VACCINES_KEY = 'vt_vaccines';
const LS_PARENTS_KEY = 'vt_parents';

const DEFAULT_VACCINES = [
	{ code: 'BCG', name: 'BCG', age: 'Birth' },
	{ code: 'OPV0', name: 'Oral Polio (0)', age: 'Birth' },
	{ code: 'HEP_B1', name: 'Hep B (1)', age: 'Birth' },
	{ code: 'PENTA1', name: 'Pentavalent (1)', age: '6 Weeks' },
	{ code: 'OPV1', name: 'Oral Polio (1)', age: '6 Weeks' },
	{ code: 'PCV1', name: 'PCV (1)', age: '6 Weeks' },
	{ code: 'ROTA1', name: 'Rotavirus (1)', age: '6 Weeks' },
	{ code: 'PENTA2', name: 'Pentavalent (2)', age: '10 Weeks' },
	{ code: 'OPV2', name: 'Oral Polio (2)', age: '10 Weeks' },
	{ code: 'PCV2', name: 'PCV (2)', age: '10 Weeks' },
	{ code: 'ROTA2', name: 'Rotavirus (2)', age: '10 Weeks' },
	{ code: 'PENTA3', name: 'Pentavalent (3)', age: '14 Weeks' },
	{ code: 'OPV3', name: 'Oral Polio (3)', age: '14 Weeks' },
	{ code: 'PCV3', name: 'PCV (3)', age: '14 Weeks' },
	{ code: 'MEASLES1', name: 'Measles (1)', age: '9 Months' },
	{ code: 'YF', name: 'Yellow Fever', age: '9 Months' },
	{ code: 'MEASLES2', name: 'Measles (2)', age: '15 Months' }
];

function read(key, def) {
	try {
		return JSON.parse(localStorage.getItem(key)) ?? def;
	} catch (e) {
		return def;
	}
}

function write(key, val) {
	localStorage.setItem(key, JSON.stringify(val));
}

function users() {
	return read(LS_USER_KEY, []);
}

function setUsers(list) {
	write(LS_USER_KEY, list);
}

function session() {
	return read(LS_SESSION_KEY, null);
}

function setSession(u) {
	write(LS_SESSION_KEY, u);
}

function children() {
	return read(LS_CHILDREN_KEY, []);
}

function setChildren(c) {
	write(LS_CHILDREN_KEY, c);
}

function parents() {
	return read(LS_PARENTS_KEY, []);
}

function setParents(p) {
	write(LS_PARENTS_KEY, p);
}

function vaccines() {
	let v = read(LS_VACCINES_KEY, null);
	if (!v) {
		write(LS_VACCINES_KEY, DEFAULT_VACCINES);
		return DEFAULT_VACCINES;
	}
	return v;
}

function byId(id) {
	return document.getElementById(id);
}

function requireAuth() {
	if (!session()) {
		window.location = 'login.html';
	}
}

function redirectIfAuthed() {
	if (session()) {
		window.location = 'dashboard.html';
	}
}

function currentUserChildren() {
	let s = session();
	return children().filter(c => c.user === s.username);
}

function currentUserParents() {
	let s = session();
	return parents().filter(p => p.user === s.username);
}

function upsertChild(data) {
	let list = children();
	if (!data.id) {
		data.id = 'c_' + Date.now();
	}
	let i = list.findIndex(x => x.id === data.id);
	if (i > -1) {
		list[i] = data;
	} else {
		list.push(data);
	}
	setChildren(list);
	return data;
}

function upsertParent(data) {
	let list = parents();
	if (!data.id) {
		data.id = 'p_' + Date.now();
	}
	let i = list.findIndex(x => x.id === data.id);
	if (i > -1) {
		list[i] = data;
	} else {
		list.push(data);
	}
	setParents(list);
	return data;
}

function markDose(childId, code) {
	let list = children();
	let c = list.find(x => x.id === childId);
	if (!c) return;
	c.doses = c.doses || {};
	if (!c.doses[code]) {
		c.doses[code] = (new Date()).toISOString().slice(0, 10);
		setChildren(list);
	}
}

function logout() {
	localStorage.removeItem(LS_SESSION_KEY);
	window.location = 'login.html';
}

function fmtDate(d) {
	return new Date(d).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

function ageFromDob(dob) {
	let d = new Date(dob);
	let diff = Date.now() - d.getTime();
	let a = new Date(diff);
	let years = a.getUTCFullYear() - 1970;
	let months = a.getUTCMonth();
	return years > 0 ? years + 'y ' + months + 'm' : months + 'm';
}

function renderNav() {
	let s = session();
	let nav = document.querySelector('nav ul');
	if (!nav) return;
	nav.innerHTML = '';
	let links = [
		['Dashboard', 'dashboard.html'],
		['Children', 'childdata.html'],
		['Parents', 'parents.html'],
		['Tracker', 'vaccinetrack.html'],
		['Certificate', 'certificate.html']
	];
	links.forEach(l => {
		let li = document.createElement('li');
		let a = document.createElement('a');
		a.href = l[1];
		a.textContent = l[0];
		if (location.pathname.endsWith(l[1])) a.classList.add('active');
		li.appendChild(a);
		nav.appendChild(li);
	});
	if (s) {
		let li = document.createElement('li');
		let a = document.createElement('a');
		a.href = '#';
		a.textContent = 'Logout';
		a.onclick = e => {
			e.preventDefault();
			logout();
		};
		li.appendChild(a);
		nav.appendChild(li);
	}
}

function page_landing() {
	let s = session();
	let btn = document.querySelector('#goDash');
	if (btn) {
		btn.addEventListener('click', () => {
			if (s) {
				window.location = 'dashboard.html';
			} else {
				window.location = 'register.html';
			}
		});
	}
}

function page_login() {
	redirectIfAuthed();
	let f = byId('loginForm');
	if (f) {
		f.addEventListener('submit', e => {
			e.preventDefault();
			let u = f.username.value.trim().toLowerCase();
			let p = f.password.value;
			let list = users();
			let found = list.find(x => x.username === u && x.password === p);
			if (!found) {
				alert('Invalid login');
				return;
			}
			setSession({ username: found.username });
			window.location = 'dashboard.html';
		});
	}
}

function page_register() {
	redirectIfAuthed();
	let f = byId('registerForm');
	if (f) {
		f.addEventListener('submit', e => {
			e.preventDefault();
			let u = f.username.value.trim().toLowerCase();
			let p = f.password.value;
			let list = users();
			if (list.find(x => x.username === u)) {
				alert('User exists');
				return;
			}
			list.push({ username: u, password: p });
			setUsers(list);
			setSession({ username: u });
			window.location = 'dashboard.html';
		});
	}
}

function page_dashboard() {
	requireAuth();
	renderNav();
	let wrap = byId('childSummary');
	if (!wrap) return;
	let list = currentUserChildren();
	if (!list.length) {
		wrap.innerHTML = '<div class="empty">No children yet. Add your first child record.</div>';
		return;
	}
	wrap.innerHTML = '';
	list.forEach(c => {
		let done = Object.keys(c.doses || {}).length;
		let total = vaccines().length;
		let div = document.createElement('div');
		div.className = 'card fade';
		div.innerHTML = '<h3>' + c.name + '</h3>' +
			'<div class="muted">DOB ' + c.dob + ' • ' + ageFromDob(c.dob) + '</div>' +
			'<div class="muted">' + done + ' / ' + total + ' doses</div>' +
			'<div class="wrap"><a class="pill" href="vaccinetrack.html?child=' + c.id + '">Track</a><a class="pill" href="certificate.html?child=' + c.id + '">Certificate</a></div>';
		wrap.appendChild(div);
	});
}

function page_children() {
	requireAuth();
	renderNav();
	let form = byId('childForm');
	let listEl = byId('childList');

	function render() {
		let list = currentUserChildren();
		if (!list.length) {
			listEl.innerHTML = '<div class="empty">No children added.</div>';
			return;
		}
		listEl.innerHTML = '';
		list.forEach(c => {
			let d = document.createElement('div');
			d.className = 'card fade';
			d.innerHTML = '<h3>' + c.name + '</h3>' +
				'<div class="muted">DOB ' + c.dob + ' • ' + ageFromDob(c.dob) + '</div>' +
				'<div class="muted">Gender ' + c.gender + ' • Blood Group ' + c.bloodGroup + '</div>' +
				'<div class="wrap"><button data-edit="' + c.id + '" class="secondary">Edit</button></div>';
			listEl.appendChild(d);
		});
		listEl.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
			let id = b.getAttribute('data-edit');
			let child = currentUserChildren().find(x => x.id === id);
			if (!child) return;
			form.childId.value = child.id;
			form.name.value = child.name;
			form.dob.value = child.dob;
			form.gender.value = child.gender;
			form.bloodGroup.value = child.bloodGroup;
			form.scrollIntoView({ behavior: 'smooth' });
		}));
	}

	if (form) {
		form.addEventListener('submit', e => {
			e.preventDefault();
			let data = {
				id: form.childId.value || null,
				user: session().username,
				name: form.name.value.trim(),
				dob: form.dob.value,
				gender: form.gender.value,
				bloodGroup: form.bloodGroup.value,
				doses: currentUserChildren().find(x => x.id === form.childId.value)?.doses || {}
			};
			if (!data.name || !data.dob) {
				alert('Missing');
				return;
			}
			upsertChild(data);
			form.reset();
			render();
		});
	}
	render();
}

function page_parents() {
	requireAuth();
	renderNav();
	let form = byId('parentForm');
	let listEl = byId('parentList');
	let childSelect = form.querySelector('[name="childId"]');

	function render() {
		let list = currentUserParents();
		let children = currentUserChildren();
		
		childSelect.innerHTML = '<option value="">Select Child</option>';
		children.forEach(c => {
			let o = document.createElement('option');
			o.value = c.id;
			o.textContent = c.name;
			childSelect.appendChild(o);
		});

		if (!list.length) {
			listEl.innerHTML = '<div class="empty">No parents added.</div>';
			return;
		}
		listEl.innerHTML = '';
		list.forEach(p => {
			let child = children.find(c => c.id === p.childId);
			let d = document.createElement('div');
			d.className = 'card fade';
			d.innerHTML = '<h3>' + p.name + '</h3>' +
				'<div class="muted">Relation: ' + p.relation + '</div>' +
				(child ? '<div class="muted">Child: ' + child.name + '</div>' : '') +
				'<div class="wrap"><button data-edit="' + p.id + '" class="secondary">Edit</button></div>';
			listEl.appendChild(d);
		});
		listEl.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
			let id = b.getAttribute('data-edit');
			let parent = currentUserParents().find(x => x.id === id);
			if (!parent) return;
			form.parentId.value = parent.id;
			form.name.value = parent.name;
			form.relation.value = parent.relation;
			form.childId.value = parent.childId;
			form.scrollIntoView({ behavior: 'smooth' });
		}));
	}

	if (form) {
		form.addEventListener('submit', e => {
			e.preventDefault();
			let data = {
				id: form.parentId.value || null,
				user: session().username,
				name: form.name.value.trim(),
				relation: form.relation.value.trim(),
				childId: form.childId.value
			};
			if (!data.name || !data.relation || !data.childId) {
				alert('Missing fields');
				return;
			}
			upsertParent(data);
			form.reset();
			render();
		});
	}
	render();
}

function page_tracker() {
	requireAuth();
	renderNav();
	let params = new URLSearchParams(location.search);
	let childId = params.get('child');
	let list = currentUserChildren();
	let select = byId('childSelect');
	list.forEach(c => {
		let o = document.createElement('option');
		o.value = c.id;
		o.textContent = c.name;
		select.appendChild(o);
	});
	if (childId) select.value = childId;
	if (select) {
		select.addEventListener('change', () => {
			let id = select.value;
			window.location = 'vaccinetrack.html?child=' + id;
		});
	}
	let tableBody = byId('vaccineRows');

	function render() {
		let id = select.value;
		let child = currentUserChildren().find(x => x.id === id);
		if (!child) {
			tableBody.innerHTML = '<tr><td colspan="5" class="empty">No child selected</td></tr>';
			return;
		}
		tableBody.innerHTML = '';
		vaccines().forEach(v => {
			let done = (child.doses || {})[v.code];
			let tr = document.createElement('tr');
			tr.innerHTML = '<td>' + v.name + '</td>' +
				'<td>' + v.age + '</td>' +
				'<td>' + (done ? '<span class="status done">Done</span>' : '<span class="status pending">Pending</span>') + '</td>' +
				'<td>' + (done ? done : '') + '</td>' +
				'<td>' + (done ? '' : '<button data-dose="' + v.code + '" class="mini">Mark</button>') + '</td>';
			tableBody.appendChild(tr);
		});
		tableBody.querySelectorAll('[data-dose]').forEach(b => b.addEventListener('click', () => {
			markDose(child.id, b.getAttribute('data-dose'));
			render();
		}));
	}
	render();
}

function page_certificate() {
	requireAuth();
	renderNav();
	let params = new URLSearchParams(location.search);
	let childId = params.get('child');
	let list = currentUserChildren();
	let select = byId('certChild');
	list.forEach(c => {
		let o = document.createElement('option');
		o.value = c.id;
		o.textContent = c.name;
		select.appendChild(o);
	});
	if (childId) select.value = childId;
	if (select) {
		select.addEventListener('change', () => {
			let id = select.value;
			window.location = 'certificate.html?child=' + id;
		});
	}
	let area = byId('certArea');

	function render() {
		let id = select.value;
		if (!id) {
			area.innerHTML = '<div class="empty">Select a child to view certificate.</div>';
			return;
		}
		let child = currentUserChildren().find(x => x.id === id);
		if (!child) {
			area.innerHTML = '<div class="empty">Child not found.</div>';
			return;
		}
		let total = vaccines().length;
		let done = Object.keys(child.doses || {}).length;
		let rows = vaccines().map(v => {
			let d = (child.doses || {})[v.code];
			return '<tr><td>' + v.name + '</td><td>' + v.age + '</td><td>' + (d ? '<span class="status done">Done</span>' : '<span class="status pending">Pending</span>') + '</td><td>' + (d || '') + '</td></tr>';
		}).join('');
		area.innerHTML = '<div class="cert print-area">' +
			'<h2>Immunization Certificate</h2>' +
			'<div class="divider"></div>' +
			'<div class="row">' +
			'<div><div class="label">Child Name</div><div class="value">' + child.name + '</div></div>' +
			'<div><div class="label">Date of Birth</div><div class="value">' + child.dob + ' (' + ageFromDob(child.dob) + ')</div></div>' +
			'<div><div class="label">Gender</div><div class="value">' + child.gender + '</div></div>' +
			'<div><div class="label">Blood Group</div><div class="value">' + child.bloodGroup + '</div></div>' +
			'<div><div class="label">Status</div><div class="value">' + done + ' / ' + total + ' Doses</div></div>' +
			'</div>' +
			'<div class="divider"></div>' +
			'<table><thead><tr><th>Vaccine</th><th>Scheduled</th><th>Status</th><th>Date</th></tr></thead><tbody>' + rows + '</tbody></table>' +
			'<div class="divider"></div>' +
			'<div class="inline"><div class="qr">QR</div><div class="muted">Generated ' + fmtDate(new Date()) + ' • Not an official record.</div></div>' +
			'<div class="actions"><button onclick="window.print()">Print</button></div>' +
			'</div>';
	}
	render();
}

document.addEventListener('DOMContentLoaded', () => {
	let page = document.body.getAttribute('data-page');
	if (page === 'landing') page_landing();
	if (page === 'login') page_login();
	if (page === 'register') page_register();
	if (page === 'dashboard') page_dashboard();
	if (page === 'children') page_children();
	if (page === 'parents') page_parents();
	if (page === 'tracker') page_tracker();
	if (page === 'certificate') page_certificate();
});
