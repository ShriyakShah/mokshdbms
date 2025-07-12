// Supabase config
  const SUPABASE_URL = 'https://idzzufagowkpnfmsnwfn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkenp1ZmFnb3drcG5mbXNud2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjc4NjcsImV4cCI6MjA2MzkwMzg2N30.UGmclAbiYW94kXQwilsjbgaKdGmsTqoL2004PNwT2IU';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Example table names, update if needed
  const TABLES = ['Orders', 'PO Process', 'Dispatch', 'Payment'];
  const TABLE_FIELDS = {
    Payment: [
      'GeM Contract Number', 'Amount', 'Payment Date', 'Remarks', 'Is Recieved', 'Amt Recieved', 'Amt Pending', 'Company'
    ],
    Dispatch: [
      'GeM Contract No.', 'Dispatch Date', 'Courier Name', 'Tracking ID', 'Delivery Date', 'DDU', 'CRAC', 'Invoice No.', 'Invoice Date', 'Delivery Charges', 'Product DImension', 'Billed Weight', 'Transport Cost', 'Company'
    ],
    Orders: [
      'id', 'Company', 'gem contract no', 'order date', 'is bid', 'bid no', 'customer dept', 'customer name', 'phone', 'email', 'state', 'consignee email', 'remark', 'city', 'pincode', 'product', 'brand', 'model', 'rate', 'qty', 'amount', 'due date', 'dispatch address', 'gem catalog', 'supplied model', 'process to oem', 'po no', 'contract', 'created at', 'created by'
    ],
    'PO Process': [
      'GeM Contract No.', 'PO Processed ?', 'Recieved', 'Installed', 'Damaged', 'Remarks'
    ]
  };
  let selectedTable = null;

  const tablesList = document.getElementById('tablesList');
  const tableHeading = document.getElementById('tableHeading');
  const addNewBtn = document.getElementById('addNewBtn');
  const signoutBtn = document.getElementById('signoutBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'refreshBtn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.style.marginLeft = '12px';
  refreshBtn.style.display = 'none';
  document.querySelector('.search-container').appendChild(refreshBtn);

  // Render table names
  function renderTables() {
    tablesList.innerHTML = '';
    TABLES.forEach(table => {
      const btn = document.createElement('button');
      btn.textContent = table;
      btn.className = 'table-btn';
      btn.onclick = () => selectTable(table);
      tablesList.appendChild(btn);
    });
  }

  // Select table and fetch fields
  async function selectTable(table) {
    selectedTable = table;
    tableHeading.textContent = table;
    addNewBtn.style.display = 'inline-block';
    await renderTableFields(table);
  }

  // Fetch table fields and rows
  async function renderTableFields(table) {
    tableContainer.innerHTML = '<div class="loading">Loading...</div>';
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      tableContainer.innerHTML = `<div class='error'>Error: ${error.message}</div>`;
      return;
    }
    const fields = TABLE_FIELDS[table];
    let currentPage = 1;
    const pageSize = 50;
    const totalPages = Math.ceil(data.length / pageSize);

    function renderPage(page) {
      let html = `<table class='db-table'><thead><tr>`;
      html += `<th>ID</th>`;
      fields.forEach(f => {
        html += `<th>${f}</th>`;
      });
      html += `<th>Edit</th></tr></thead><tbody>`;
      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      for (let i = start; i < end; i++) {
        const row = data[i];
        html += `<tr>`;
        html += `<td>${row.id}</td>`;
        fields.forEach(f => {
          let key = f;
          // Show Yes/No for all boolean fields
          if (typeof row[key] === 'boolean') {
            html += `<td>${row[key] ? 'Yes' : 'No'}</td>`;
          } else if (key.toLowerCase().startsWith('is ') || key.toLowerCase().endsWith('ed') || key.toLowerCase().endsWith('received') || key.toLowerCase().endsWith('installed') || key.toLowerCase().endsWith('damaged')) {
            if (row[key] === true) {
              html += `<td>Yes</td>`;
            } else if (row[key] === false) {
              html += `<td>No</td>`;
            } else {
              html += `<td></td>`;
            }
          } else {
            html += `<td>${row[key] !== undefined ? row[key] : ''}</td>`;
          }
        });
        html += `<td><button class='edit-btn' data-id='${row.id}'>Edit</button></td></tr>`;
      }
      html += `</tbody></table>`;
      // Pagination controls
      html += `<div class='pagination' style='margin-top:16px;text-align:center;'>`;
      for (let p = 1; p <= totalPages; p++) {
        html += `<button class='page-btn' data-page='${p}' style='margin:0 4px;padding:6px 12px;border-radius:6px;border:none;background:${p===page?'#00c6ff':'#e0f7fa'};color:${p===page?'#fff':'#185a9d'};font-weight:600;cursor:pointer;'>${p}</button>`;
      }
      html += `</div>`;
      tableContainer.innerHTML = html;
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => showEditForm(table, btn.getAttribute('data-id'));
      });
      document.querySelectorAll('.page-btn').forEach(btn => {
        btn.onclick = () => {
          currentPage = parseInt(btn.getAttribute('data-page'));
          renderPage(currentPage);
        };
      });
    }
    renderPage(currentPage);
  }

  // Show add new form
  addNewBtn.onclick = () => {
    showAddForm(selectedTable);
  };
  function showAddForm(table) {
    const fields = TABLE_FIELDS[table];
    let html = `<form id='addForm'><h3>Add New ${table}</h3><div class='form-row'>`;
    fields.forEach((f, i) => {
      let key = f;
      if (key === 'Company') {
        html += `<label>Company: <select name='Company'><option value='Moksh Enterprise'>Moksh Enterprise</option><option value='Khushbu Tradelink'>Khushbu Tradelink</option></select></label>`;
      } else if (key === 'id' || key === 'qty' || key === 'created by') {
        html += `<label>${key}: <input name='${key}' type='number'></label>`;
      } else if (key === 'rate') {
        html += `<label>rate: <input name='rate' type='number' step='any'></label>`;
      } else if (key === 'amount') {
        html += `<label>amount: <input name='amount' type='number' step='any' readonly></label>`;
      } else if (key.includes('date') || key === 'created at') {
        html += `<label>${key}: <input name='${key}' type='date'></label>`;
      } else if (key.toLowerCase().startsWith('is ') || key.toLowerCase().endsWith('ed') || key.toLowerCase().endsWith('received') || key.toLowerCase().endsWith('installed') || key.toLowerCase().endsWith('damaged')) {
        html += `<label>${key}: <input name='${key}' type='checkbox'></label>`;
      } else {
        html += `<label>${key}: <input name='${key}' type='text'></label>`;
      }
      if ((i + 1) % 5 === 0 && i !== fields.length - 1) {
        html += `</div><div class='form-row'>`;
      }
    });
    html += `</div><button type='submit'>Add</button></form>`;
    tableContainer.innerHTML = html;
    // Automation for qty, rate, amount
    const qtyInput = document.querySelector("[name='qty']");
    const rateInput = document.querySelector("[name='rate']");
    const amountInput = document.querySelector("[name='amount']");
    function updateAmount() {
      const qty = parseFloat(qtyInput.value) || 0;
      const rate = parseFloat(rateInput.value) || 0;
      amountInput.value = (qty * rate).toFixed(2);
    }
    if (qtyInput && rateInput && amountInput) {
      qtyInput.addEventListener('input', updateAmount);
      rateInput.addEventListener('input', updateAmount);
    }
    document.getElementById('addForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const values = Object.fromEntries(formData.entries());
      fields.forEach(f => {
        let key = f; // Use field name directly
        if (table === 'Recieved/Install/Damaged' && (key === 'Is Recieved' || key === 'Is Installed' || key === 'Is Damaged')) {
          const input = e.target.querySelector(`[name='${key}']`);
          values[key] = input && input.checked ? true : false;
        } else if ((f.includes('Is') || f.includes('?')) || (key.toLowerCase().startsWith('is ') || key.toLowerCase().endsWith('ed') || key.toLowerCase().endsWith('received') || key.toLowerCase().endsWith('installed') || key.toLowerCase().endsWith('damaged'))) {
          const input = e.target.querySelector(`[name='${key}']`);
          values[key] = input ? input.checked : false;
        }
      });
      // Ensure amount is calculated
      if (qtyInput && rateInput && amountInput) {
        values['amount'] = amountInput.value;
      }
      try {
        const { error } = await supabase.from(table).insert([values]);
        if (error) {
          tableContainer.innerHTML += `<div class='error'>${error.message}</div>`;
        } else {
          selectTable(table);
        }
      } catch (err) {
        tableContainer.innerHTML += `<div class='error'>${err.message}</div>`;
      }
    };
  }
  function showEditForm(table, id) {
    supabase.from(table).select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) {
        tableContainer.innerHTML = `<div class='error'>Error: ${error.message}</div>`;
        return;
      }
      const fields = TABLE_FIELDS[table];
      let html = `<form id='editForm'><h3>Edit ${table}</h3>`;
      fields.forEach(f => {
        let key = f; // Use field name directly
        if (key === 'Company') {
          html += `<label>Company: <select name='Company'><option value='Moksh Enterprise' ${data[key]==='Moksh Enterprise'?'selected':''}>Moksh Enterprise</option><option value='Khushbu Tradelink' ${data[key]==='Khushbu Tradelink'?'selected':''}>Khushbu Tradelink</option></select></label><br>`;
        } else if (key === 'id' || key === 'qty' || key === 'created by') {
          html += `<label>${key}: <input name='${key}' type='number' value='${data[key] !== undefined ? data[key] : ''}'></label><br>`;
        } else if (key === 'rate') {
          html += `<label>rate: <input name='rate' type='number' step='any' value='${data[key] !== undefined ? data[key] : ''}'></label><br>`;
        } else if (key === 'amount') {
          html += `<label>amount: <input name='amount' type='number' step='any' value='${data[key] !== undefined ? data[key] : ''}' readonly></label><br>`;
        } else if (key.includes('date') || key === 'created at') {
          html += `<label>${key}: <input name='${key}' type='date' value='${data[key] ? data[key].split('T')[0] : ''}'></label><br>`;
        } else if (key.toLowerCase().startsWith('is ') || key.toLowerCase().endsWith('ed') || key.toLowerCase().endsWith('received') || key.toLowerCase().endsWith('installed') || key.toLowerCase().endsWith('damaged')) {
          html += `<label>${key}: <input name='${key}' type='checkbox' ${data[key] ? 'checked' : ''}></label><br>`;
        } else {
          html += `<label>${key}: <input name='${key}' type='text' value='${data[key] !== undefined ? data[key] : ''}'></label><br>`;
        }
      });
      html += `<button type='submit'>Save</button></form>`;
      tableContainer.innerHTML = html;
      // Automation for qty, rate, amount in edit form
      const qtyInput = document.querySelector("[name='qty']");
      const rateInput = document.querySelector("[name='rate']");
      const amountInput = document.querySelector("[name='amount']");
      function updateAmount() {
        const qty = parseFloat(qtyInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        amountInput.value = (qty * rate).toFixed(2);
      }
      if (qtyInput && rateInput && amountInput) {
        qtyInput.addEventListener('input', updateAmount);
        rateInput.addEventListener('input', updateAmount);
      }
      document.getElementById('editForm').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        fields.forEach(f => {
          let key = f; // Use field name directly
          if (table === 'Recieved/Install/Damaged' && (key === 'Is Recieved' || key === 'Is Installed' || key === 'Is Damaged')) {
            const input = e.target.querySelector(`[name='${key}']`);
            values[key] = input && input.checked ? true : false;
          } else if ((f.includes('Is') || f.includes('?')) || (key.toLowerCase().startsWith('is ') || key.toLowerCase().endsWith('ed') || key.toLowerCase().endsWith('received') || key.toLowerCase().endsWith('installed') || key.toLowerCase().endsWith('damaged'))) {
            const input = e.target.querySelector(`[name='${key}']`);
            values[key] = input ? input.checked : false;
          }
        });
        // Ensure amount is calculated
        if (qtyInput && rateInput && amountInput) {
          values['amount'] = amountInput.value;
        }
        const { error } = await supabase.from(table).update(values).eq('id', id);
        if (error) {
          alert('Error: ' + error.message);
        } else {
          selectTable(table);
        }
      };
    });
  }

  // Search functionality
  searchBtn.onclick = () => {
    performSearch();
    refreshBtn.style.display = 'inline-block';
  };
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      performSearch();
      refreshBtn.style.display = 'inline-block';
    }
  });

  refreshBtn.onclick = () => {
    searchInput.value = '';
    refreshBtn.style.display = 'none';
    if (selectedTable) {
      renderTableFields(selectedTable);
    }
  };

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!selectedTable || !query) return;
    supabase.from(selectedTable).select('*').then(({ data, error }) => {
      const tableContainer = document.getElementById('tableContainer');
      if (error) {
        if (tableContainer) {
          const msg = error.message ? error.message : JSON.stringify(error) || 'Unknown error';
          tableContainer.innerHTML = `<div class='error'>Error: ${msg}</div>`;
        }
        return;
      }
      const fields = TABLE_FIELDS[selectedTable];
      const filtered = data.filter(row =>
        fields.some(f => {
          let key = f; // Use field name directly
          // Fix: allow boolean false and 0 values to be searchable
          if (row[key] === null || row[key] === undefined) {
            // For boolean columns, treat null/undefined as blank
            if (selectedTable === 'Recieved/Install/Damaged' && (key === 'Is Recieved' || key === 'Is Installed' || key === 'Is Damaged')) {
              return ''.includes(query);
            }
            return false;
          }
          // For boolean columns, convert to 'Yes'/'No' for search
          if (selectedTable === 'Recieved/Install/Damaged' && (key === 'Is Recieved' || key === 'Is Installed' || key === 'Is Damaged')) {
            return (row[key] ? 'yes' : 'no').includes(query);
          }
          return row[key].toString().toLowerCase().includes(query);
        })
      );
      let html = `<table class='db-table'><thead><tr>`;
      html += `<th>ID</th>`;
      fields.forEach(f => {
        html += `<th>${f}</th>`;
      });
      html += `<th>Edit</th></tr></thead><tbody>`;
      // Highlight function
      const highlight = (text) => {
        if (!query) return text;
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(safeQuery, 'gi'), match => `<span class='search-highlight' style='background:yellow;color:#222;border-radius:3px;padding:0 2px;'>${match}</span>`);
      };
      filtered.forEach(row => {
        html += `<tr>`;
        html += `<td>${highlight(row.id ? row.id.toString() : '')}</td>`;
        fields.forEach(f => {
          let key = f; // Use field name directly
          let cellValue = row[key] !== undefined && row[key] !== null ? row[key].toString() : '';
          if (selectedTable === 'Recieved/Install/Damaged' && (key === 'Is Recieved' || key === 'Is Installed' || key === 'Is Damaged')) {
            if (row[key] === true) {
              cellValue = 'Yes';
            } else if (row[key] === false) {
              cellValue = 'No';
            } else {
              cellValue = '';
            }
          }
          html += `<td>${highlight(cellValue)}</td>`;
        });
        html += `<td><button class='edit-btn' data-id='${row.id}'>Edit</button></td></tr>`;
      });
      html += `</tbody></table>`;
      // No pagination for search results
      if (tableContainer) tableContainer.innerHTML = html;
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => showEditForm(selectedTable, btn.getAttribute('data-id'));
      });
    });
  }

  // Sign out functionality
  signoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  };

  // Initial render
  renderTables();

  document.addEventListener('keydown', function(e) {
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      if (e.key === 'ArrowRight') {
        tableContainer.scrollLeft += 50;
      } else if (e.key === 'ArrowLeft') {
        tableContainer.scrollLeft -= 50;
      }
      e.preventDefault();
    }
  });
