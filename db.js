// Babar Ali Law Associates — Database & Storage Layer

(function () {
  var config = window.BALA_CONFIG || {};
  var isConfigured = Boolean(
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.includes('xyzcompany') &&
    window.supabase
  );

  var STORAGE_KEY = 'bala_appointments_db';
  var FEEDBACK_STORAGE_KEY = 'bala_feedback_db';
  var CREDENTIALS_KEY = 'bala_admin_credentials';

  // Get Admin Credentials (defaults if not yet changed)
  function getAdminCredentials() {
    try {
      var creds = localStorage.getItem(CREDENTIALS_KEY);
      if (creds) return JSON.parse(creds);
    } catch (e) {}
    return {
      email: 'admin@babaralilaw.com',
      password: 'admin123'
    };
  }

  function saveAdminCredentials(creds) {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
    } catch (e) {}
  }

  function getLocalAppointments() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        var initial = [
          {
            id: '1',
            created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            full_name: 'Muhammad Tariq',
            phone: '+92 300 1234567',
            matter_type: 'Property & Real Estate',
            details: 'Dispute over inheritance mutation in Phalia tehsildar office.',
            source: 'Contact Page',
            status: 'new'
          },
          {
            id: '2',
            created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
            full_name: 'Zahid Mahmood',
            phone: '+92 321 9876543',
            matter_type: 'Corporate & Business Law',
            details: 'Partnership agreement drafting for agricultural machinery distributor.',
            source: 'Schedule Modal',
            status: 'contacted'
          },
          {
            id: '3',
            created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
            full_name: 'Farzana Bibi',
            phone: '+92 333 5554433',
            matter_type: 'Family Law',
            details: 'Maintenance decree enforcement in Civil Court.',
            source: 'Schedule Modal',
            status: 'scheduled'
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  function saveLocalAppointments(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function getLocalFeedback() {
    try {
      var data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (!data) {
        var initial = [
          {
            id: 'fb_1',
            created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
            category: 'Client Portal & Case Tracking',
            message: 'It would be great to have an online case causelist tracking feature where clients can enter their case number to check the next hearing date.',
            contact_info: 'tariq.legal@gmail.com',
            source: 'Contact Page Feedback'
          }
        ];
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  function saveLocalFeedback(list) {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  var mockClient = {
    auth: {
      getSession: function () {
        var auth = sessionStorage.getItem('bala_admin_auth');
        var creds = getAdminCredentials();
        return Promise.resolve({ data: { session: auth ? { user: { email: creds.email } } : null } });
      },
      signInWithPassword: function (creds) {
        var current = getAdminCredentials();
        if (creds.email === current.email && creds.password === current.password) {
          sessionStorage.setItem('bala_admin_auth', 'true');
          return Promise.resolve({ data: { session: { user: { email: current.email } } }, error: null });
        }
        return Promise.reject(new Error('Invalid email or password'));
      },
      updateUser: function (updates) {
        var current = getAdminCredentials();
        if (updates.email) current.email = updates.email.trim();
        if (updates.password) current.password = updates.password;
        saveAdminCredentials(current);
        return Promise.resolve({ data: { user: { email: current.email } }, error: null });
      },
      signOut: function () {
        sessionStorage.removeItem('bala_admin_auth');
        return Promise.resolve({ error: null });
      }
    },
    from: function (table) {
      var isFeedback = table === 'feedback';
      return {
        select: function (cols) {
          return {
            order: function (field, opts) {
              var rows = isFeedback ? getLocalFeedback() : getLocalAppointments();
              return Promise.resolve({ data: rows, error: null });
            }
          };
        },
        insert: function (records) {
          var rows = isFeedback ? getLocalFeedback() : getLocalAppointments();
          var recs = Array.isArray(records) ? records : [records];
          recs.forEach(function (r) {
            r.id = r.id || String(Date.now() + Math.random());
            r.created_at = r.created_at || new Date().toISOString();
            if (!isFeedback) {
              r.status = r.status || 'new';
            }
            rows.unshift(r);
          });
          if (isFeedback) {
            saveLocalFeedback(rows);
          } else {
            saveLocalAppointments(rows);
          }
          return Promise.resolve({ data: recs, error: null });
        },
        update: function (updates) {
          return {
            eq: function (field, val) {
              var rows = isFeedback ? getLocalFeedback() : getLocalAppointments();
              for (var i = 0; i < rows.length; i++) {
                if (rows[i][field] === val) {
                  Object.assign(rows[i], updates);
                }
              }
              if (isFeedback) {
                saveLocalFeedback(rows);
              } else {
                saveLocalAppointments(rows);
              }
              return Promise.resolve({ data: updates, error: null });
            }
          };
        }
      };
    }
  };

  var clientInstance = isConfigured
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
    : mockClient;

  window.BALA_DB = {
    isConfigured: true,
    client: clientInstance,
    getAdminCredentials: getAdminCredentials,
    submitAppointment: function (data) {
      return clientInstance.from('appointments').insert({
        full_name: data.name,
        phone: data.phone,
        matter_type: data.area || data.details || 'General Inquiry',
        details: data.details || '',
        source: data.source || 'Website'
      });
    },
    submitFeedback: function (data) {
      return clientInstance.from('feedback').insert({
        category: data.category || 'General Suggestion',
        message: data.message,
        contact_info: data.contact || '',
        source: data.source || 'Contact Page Feedback'
      });
    }
  };
})();
