// Babar Ali Law Associates — admin dashboard logic

(function () {
  var configWarning = document.getElementById('config-warning');
  var loginShell = document.getElementById('login-shell');
  var appShell = document.getElementById('app-shell');
  var adminUserDisplay = document.getElementById('admin-user-display');

  if (!window.BALA_DB || !window.BALA_DB.isConfigured) {
    if (configWarning) configWarning.style.display = 'block';
    if (loginShell) loginShell.style.display = 'none';
    return;
  }

  var supabase = window.BALA_DB.client;
  var allRows = [];
  var currentSessionUser = null;

  // ---------- Auth ----------
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var logoutBtn = document.getElementById('logout-btn');

  function showDashboard(user) {
    currentSessionUser = user;
    if (loginShell) loginShell.classList.add('is-hidden');
    if (appShell) {
      appShell.classList.remove('is-hidden');
      appShell.classList.add('is-shown');
    }
    if (adminUserDisplay && user && user.email) {
      adminUserDisplay.textContent = 'Logged in as: ' + user.email;
    }
    loadAppointments();
  }

  function showLogin() {
    currentSessionUser = null;
    if (loginShell) loginShell.classList.remove('is-hidden');
    if (appShell) {
      appShell.classList.add('is-hidden');
      appShell.classList.remove('is-shown');
    }
  }

  supabase.auth.getSession().then(function (res) {
    if (res.data && res.data.session) {
      showDashboard(res.data.session.user);
    } else {
      showLogin();
    }
  });

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (loginError) {
        loginError.textContent = '';
        loginError.classList.remove('is-shown');
      }
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      var btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      supabase.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) throw res.error;
          showDashboard(res.data.session.user);
        })
        .catch(function (err) {
          if (loginError) {
            loginError.textContent = (err && err.message) || 'Sign-in failed. Check your email and password.';
            loginError.classList.add('is-shown');
          }
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = 'Sign In';
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      supabase.auth.signOut().then(showLogin);
    });
  }

  // ---------- Account Security / Change Credentials Modal ----------
  var settingsModal = document.getElementById('settings-modal');
  var openSettingsBtn = document.getElementById('open-settings-btn');
  var closeSettingsBtn = document.getElementById('close-settings-btn');
  var settingsForm = document.getElementById('settings-form');
  var settingsError = document.getElementById('settings-error');
  var settingsSuccess = document.getElementById('settings-success');

  function openSettings() {
    if (!settingsModal) return;
    settingsModal.classList.add('is-active');
    if (settingsError) settingsError.classList.remove('is-shown');
    if (settingsSuccess) settingsSuccess.style.display = 'none';

    var emailInput = document.getElementById('set-email');
    if (emailInput) {
      if (currentSessionUser && currentSessionUser.email) {
        emailInput.value = currentSessionUser.email;
      } else if (window.BALA_DB.getAdminCredentials) {
        emailInput.value = window.BALA_DB.getAdminCredentials().email;
      }
    }
  }

  function closeSettings() {
    if (!settingsModal) return;
    settingsModal.classList.remove('is-active');
    if (settingsForm) settingsForm.reset();
  }

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);

  if (settingsModal) {
    settingsModal.addEventListener('click', function (e) {
      if (e.target === settingsModal) closeSettings();
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (settingsError) {
        settingsError.textContent = '';
        settingsError.classList.remove('is-shown');
      }
      if (settingsSuccess) settingsSuccess.style.display = 'none';

      var newEmail = document.getElementById('set-email').value.trim();
      var currentPass = document.getElementById('set-current-pass').value;
      var newPass = document.getElementById('set-new-pass').value;
      var confirmPass = document.getElementById('set-confirm-pass').value;
      var submitBtn = settingsForm.querySelector('button[type="submit"]');

      if (!currentPass) {
        settingsError.textContent = 'Please enter your current password to authorize changes.';
        settingsError.classList.add('is-shown');
        return;
      }

      if (newPass && newPass !== confirmPass) {
        settingsError.textContent = 'New passwords do not match.';
        settingsError.classList.add('is-shown');
        return;
      }

      if (newPass && newPass.length < 6) {
        settingsError.textContent = 'New password must be at least 6 characters long.';
        settingsError.classList.add('is-shown');
        return;
      }

      // Check current password if local DB
      if (window.BALA_DB.getAdminCredentials) {
        var creds = window.BALA_DB.getAdminCredentials();
        if (currentPass !== creds.password) {
          settingsError.textContent = 'Current password is incorrect.';
          settingsError.classList.add('is-shown');
          return;
        }
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating…';

      var updates = { email: newEmail };
      if (newPass) updates.password = newPass;

      supabase.auth.updateUser(updates)
        .then(function (res) {
          if (res.error) throw res.error;
          if (settingsSuccess) settingsSuccess.style.display = 'block';
          if (adminUserDisplay) adminUserDisplay.textContent = 'Logged in as: ' + newEmail;
          currentSessionUser = { email: newEmail };
          
          // Update login form value too
          var loginEmailInput = document.getElementById('login-email');
          var loginPassInput = document.getElementById('login-password');
          if (loginEmailInput) loginEmailInput.value = newEmail;
          if (loginPassInput && newPass) loginPassInput.value = newPass;

          setTimeout(function () {
            closeSettings();
          }, 1500);
        })
        .catch(function (err) {
          if (settingsError) {
            settingsError.textContent = (err && err.message) || 'Failed to update credentials.';
            settingsError.classList.add('is-shown');
          }
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Update Credentials';
        });
    });
  }

  // ---------- Data & Tabs (Inquiries & Feedback) ----------
  var tbody = document.getElementById('admin-table-body');
  var thead = document.getElementById('admin-table-head');
  var searchInput = document.getElementById('admin-search');
  var refreshBtn = document.getElementById('refresh-btn');
  var tabInquiries = document.getElementById('tab-inquiries');
  var tabFeedback = document.getElementById('tab-feedback');

  var currentTab = 'inquiries';
  var allFeedbackRows = [];

  function setTab(tab) {
    currentTab = tab;
    if (tabInquiries && tabFeedback) {
      if (tab === 'inquiries') {
        tabInquiries.className = 'btn btn-primary';
        tabFeedback.className = 'btn btn-outline';
      } else {
        tabInquiries.className = 'btn btn-outline';
        tabFeedback.className = 'btn btn-primary';
      }
    }
    if (searchInput) searchInput.value = '';
    if (tab === 'inquiries') {
      loadAppointments();
    } else {
      loadFeedback();
    }
  }

  if (tabInquiries) tabInquiries.addEventListener('click', function () { setTab('inquiries'); });
  if (tabFeedback) tabFeedback.addEventListener('click', function () { setTab('feedback'); });

  function loadAppointments() {
    if (!tbody) return;
    if (thead) {
      thead.innerHTML = '<tr>' +
        '<th>Date &amp; Time</th>' +
        '<th>Client Name</th>' +
        '<th>Phone</th>' +
        '<th>Matter Category</th>' +
        '<th>Summary / Details</th>' +
        '<th>Source</th>' +
        '<th>File Status</th>' +
        '</tr>';
    }
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--ink-soft);">Loading records…</td></tr>';
    supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        allRows = res.data || [];
        renderStats(allRows);
        renderTable(allRows);
      })
      .catch(function (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#c53030; padding: 2rem;">' +
          'Could not load records: ' + ((err && err.message) || 'unknown error') + '</td></tr>';
      });
  }

  function loadFeedback() {
    if (!tbody) return;
    if (thead) {
      thead.innerHTML = '<tr>' +
        '<th>Date &amp; Time</th>' +
        '<th>Suggestion Category</th>' +
        '<th>Feedback / Suggestion</th>' +
        '<th>Contact Info (Optional)</th>' +
        '<th>Source</th>' +
        '</tr>';
    }
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--ink-soft);">Loading feedback…</td></tr>';
    supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        allFeedbackRows = res.data || [];
        renderFeedbackTable(allFeedbackRows);
      })
      .catch(function (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#c53030; padding: 2rem;">' +
          'Could not load feedback: ' + ((err && err.message) || 'unknown error') + '</td></tr>';
      });
  }

  function renderStats(rows) {
    var now = new Date();
    var startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    var weekCount = 0, monthCount = 0;
    var matterCounts = {};

    rows.forEach(function (r) {
      var created = new Date(r.created_at);
      if (created >= startOfWeek) weekCount++;
      if (created >= startOfMonth) monthCount++;
      var m = (r.matter_type || 'Unspecified').trim();
      if (m) matterCounts[m] = (matterCounts[m] || 0) + 1;
    });

    var topMatter = '—';
    var topCount = 0;
    Object.keys(matterCounts).forEach(function (m) {
      if (matterCounts[m] > topCount) { topCount = matterCounts[m]; topMatter = m; }
    });

    var statTotal = document.getElementById('stat-total');
    var statWeek = document.getElementById('stat-week');
    var statMonth = document.getElementById('stat-month');
    var statTop = document.getElementById('stat-top');

    if (statTotal) statTotal.textContent = rows.length;
    if (statWeek) statWeek.textContent = weekCount;
    if (statMonth) statMonth.textContent = monthCount;
    if (statTop) statTop.textContent = topMatter;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  var STATUSES = ['new', 'contacted', 'scheduled', 'closed'];

  function renderTable(rows) {
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--ink-soft);">No consultations or bookings recorded yet.</td></tr>';
      return;
    }
    var html = rows.map(function (r) {
      var options = STATUSES.map(function (s) {
        return '<option value="' + s + '"' + (r.status === s ? ' selected' : '') + '>' + s.toUpperCase() + '</option>';
      }).join('');
      return '<tr data-id="' + r.id + '">' +
        '<td style="color: var(--ink-soft); font-size: 0.85rem;">' + formatDate(r.created_at) + '</td>' +
        '<td><strong>' + escapeHtml(r.full_name) + '</strong></td>' +
        '<td><a href="tel:' + escapeHtml(r.phone) + '" style="color: var(--gold-dark);">' + escapeHtml(r.phone) + '</a></td>' +
        '<td><span class="tag">' + escapeHtml(r.matter_type || '—') + '</span></td>' +
        '<td style="color: var(--ink-secondary); max-width: 260px;">' + escapeHtml(r.details || '—') + '</td>' +
        '<td style="color: var(--ink-soft); font-size: 0.85rem;">' + escapeHtml(r.source || '—') + '</td>' +
        '<td><select class="status-select" data-id="' + r.id + '">' + options + '</select></td>' +
        '</tr>';
    }).join('');
    tbody.innerHTML = html;

    tbody.querySelectorAll('.status-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var id = sel.getAttribute('data-id');
        var newStatus = sel.value;
        sel.disabled = true;
        supabase.from('appointments').update({ status: newStatus }).eq('id', id)
          .then(function (res) {
            if (res.error) throw res.error;
            var row = allRows.find(function (r) { return r.id === id; });
            if (row) row.status = newStatus;
          })
          .catch(function (err) {
            alert('Could not update status: ' + ((err && err.message) || 'unknown error'));
          })
          .finally(function () {
            sel.disabled = false;
          });
      });
    });
  }

  function renderFeedbackTable(rows) {
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2.5rem; color: var(--ink-soft);">No visitor feedback submitted yet.</td></tr>';
      return;
    }
    var html = rows.map(function (r) {
      return '<tr>' +
        '<td style="color: var(--ink-soft); font-size: 0.85rem;">' + formatDate(r.created_at) + '</td>' +
        '<td><span class="tag" style="background: var(--gold-100);">' + escapeHtml(r.category || 'General') + '</span></td>' +
        '<td style="color: var(--ink-primary); max-width: 340px; line-height: 1.5;">' + escapeHtml(r.message || '—') + '</td>' +
        '<td>' + (r.contact_info ? escapeHtml(r.contact_info) : '<span style="color: var(--ink-soft);">Anonymous</span>') + '</td>' +
        '<td style="color: var(--ink-soft); font-size: 0.85rem;">' + escapeHtml(r.source || 'Website') + '</td>' +
        '</tr>';
    }).join('');
    tbody.innerHTML = html;
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      if (currentTab === 'inquiries') {
        if (!q) { renderTable(allRows); return; }
        var filtered = allRows.filter(function (r) {
          return (r.full_name || '').toLowerCase().indexOf(q) !== -1 ||
            (r.phone || '').toLowerCase().indexOf(q) !== -1 ||
            (r.matter_type || '').toLowerCase().indexOf(q) !== -1;
        });
        renderTable(filtered);
      } else {
        if (!q) { renderFeedbackTable(allFeedbackRows); return; }
        var filteredFb = allFeedbackRows.filter(function (r) {
          return (r.category || '').toLowerCase().indexOf(q) !== -1 ||
            (r.message || '').toLowerCase().indexOf(q) !== -1 ||
            (r.contact_info || '').toLowerCase().indexOf(q) !== -1;
        });
        renderFeedbackTable(filteredFb);
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      if (currentTab === 'inquiries') loadAppointments();
      else loadFeedback();
    });
  }
})();
