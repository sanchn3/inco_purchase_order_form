const PICKUP_FIELDS   = ['form_type','date','driver_name','phone','company','po_number','truck_temp','cleanliness','time'];
const DELIVERY_FIELDS = ['form_type','visitor_name','company','host_person','entry_time','exit_time'];

const LABELS = {
  form_type:    'Type',
  date:         'Date',
  driver_name:  'Driver Name',
  phone:        'Phone',
  company:      'Company',
  po_number:    'PO Number',
  truck_temp:   'Temp (°F)',
  cleanliness:  'Clean?',
  time:         'Time',
  visitor_name: 'Visitor Name',
  host_person:  'Visiting',
  entry_time:   'Time In',
  exit_time:    'Time Out',
};

let currentData = { pickup: [], delivery: [] };

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0) === (name === 'pickup'));
  });
  document.getElementById('panel-pickup').classList.toggle('active',   name === 'pickup');
  document.getElementById('panel-delivery').classList.toggle('active', name === 'delivery');
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show' + (isError ? ' error' : '');
  setTimeout(() => { t.className = ''; }, 2500);
}

// ── Render table ──────────────────────────────────────────────────────────────
function renderTable(rows, fieldnames, containerId, fileKey) {
  const container = document.getElementById(containerId);

  if (!rows.length) {
    container.innerHTML = '<p class="empty-msg">No entries yet.</p>';
    return;
  }

  const thead = fieldnames
    .map(f => `<th>${LABELS[f] || f}</th>`)
    .join('') + '<th>Actions</th>';

  const tbody = rows.map(row => {
    const cells = fieldnames.map(f => {
      const val = row[f] ?? '';
      return `<td data-file="${fileKey}" data-row="${row._row_index}" data-field="${f}">${escHtml(val)}</td>`;
    }).join('');
    const del = `<td><button class="btn-delete" data-file="${fileKey}" data-row="${row._row_index}">Delete</button></td>`;
    return `<tr>${cells}${del}</tr>`;
  }).join('');

  container.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Fetch & render ────────────────────────────────────────────────────────────
function loadData() {
  fetch('/admin/data')
    .then(r => r.json())
    .then(data => {
      currentData = data;
      renderTable(data.pickup,   PICKUP_FIELDS,   'table-pickup',   'pickup');
      renderTable(data.delivery, DELIVERY_FIELDS, 'table-delivery', 'delivery');
      document.getElementById('pickup-count').textContent   = data.pickup.length;
      document.getElementById('delivery-count').textContent = data.delivery.length;
    })
    .catch(() => showToast('Could not reach server.', true));
}

// ── Inline edit ───────────────────────────────────────────────────────────────
document.addEventListener('click', function (e) {
  // Cell click → make editable
  if (e.target.tagName === 'TD' && e.target.dataset.field) {
    const td = e.target;
    if (td.contentEditable === 'true') return; // already editing
    td.contentEditable = 'true';
    td.focus();

    // Place cursor at end
    const range = document.createRange();
    range.selectNodeContents(td);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Delete button
  if (e.target.classList.contains('btn-delete')) {
    const { file, row } = e.target.dataset;
    if (!confirm('Delete this entry?')) return;
    fetch('/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, row_index: parseInt(row) })
    })
    .then(r => r.json())
    .then(res => {
      if (res.status === 'success') { showToast('Entry deleted.'); loadData(); }
      else showToast('Delete failed.', true);
    })
    .catch(() => showToast('Delete failed.', true));
  }
});

// Save on blur or Enter
document.addEventListener('blur', function (e) {
  if (e.target.tagName === 'TD' && e.target.dataset.field) {
    saveCell(e.target);
  }
}, true);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.tagName === 'TD' && e.target.dataset.field) {
    e.preventDefault();
    e.target.blur();
  }
  if (e.key === 'Escape' && e.target.tagName === 'TD' && e.target.dataset.field) {
    e.target.contentEditable = 'false';
    loadData(); // revert
  }
});

function saveCell(td) {
  td.contentEditable = 'false';
  const { file, row, field } = td.dataset;
  const value = td.textContent.trim();

  fetch('/admin/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, row_index: parseInt(row), field, value })
  })
  .then(r => r.json())
  .then(res => {
    if (res.status === 'success') showToast('Saved.');
    else { showToast('Save failed.', true); loadData(); }
  })
  .catch(() => { showToast('Save failed.', true); loadData(); });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
loadData();
setInterval(loadData, 10000);
