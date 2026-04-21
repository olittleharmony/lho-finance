// ============================================================
// supabase.js — Supabase client + auth helpers
// ============================================================

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  _supabase = window.supabase.createClient(
    APP_CONFIG.SUPABASE_URL,
    APP_CONFIG.SUPABASE_ANON_KEY
  );
  return _supabase;
}

// ---- Auth ----

async function getCurrentUser() {
  const { data: { user } } = await getSupabase().auth.getUser();
  return user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

async function signIn(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  await getSupabase().auth.signOut();
  window.location.href = 'https://olittleharmony.github.io/member/index.html';
}

async function updatePassword(newPassword) {
  const { error } = await getSupabase().auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ---- Guard: redirect ke login jika belum login ----
async function requireAuth(requiredRole = null) {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = 'https://olittleharmony.github.io/member/index.html';
    return null;
  }
  if (!profile.is_active) {
    await signOut();
    return null;
  }
  if (requiredRole && profile.role !== requiredRole) {
    window.location.href = 'https://olittleharmony.github.io/member/hub.html';
    return null;
  }
  return profile;
}

// ---- Payments ----

async function getMyPayments(type = null) {
  let query = getSupabase()
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function submitPayment(payload) {
  const user = await getCurrentUser();
  const { data, error } = await getSupabase()
    .from('payments')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getKasSetting() {
  const { data } = await getSupabase()
    .from('settings')
    .select('key, value')
    .in('key', ['kas_amount', 'kas_due_day']);
  const result = {};
  (data || []).forEach(r => result[r.key] = r.value);
  return result;
}

// ---- Admin: Payments ----

async function getAllPayments(filters = {}) {
  let query = getSupabase()
    .from('payments')
    .select(`*, profiles!user_id(full_name, division, email)`)
    .order('created_at', { ascending: false });

  if (filters.type)   query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.period) query = query.eq('period', filters.period);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function reviewPayment(paymentId, status, reviewNotes = '') {
  const profile = await getCurrentProfile();
  const { data, error } = await getSupabase()
    .from('payments')
    .update({
      status,
      review_notes: reviewNotes,
      reviewed_by:  profile.id,
      reviewed_at:  new Date().toISOString(),
    })
    .eq('id', paymentId)
    .select(`*, profiles!user_id(full_name, email, division)`)
    .single();
  if (error) throw error;
  return data;
}

// ---- Admin: Transactions ----

async function getAllTransactions(filters = {}) {
  let query = getSupabase()
    .from('transactions')
    .select(`*, profiles!created_by(full_name)`)
    .order('transaction_date', { ascending: false });

  if (filters.type) query = query.eq('type', filters.type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function insertTransaction(payload) {
  const user = await getCurrentUser();
  const { data, error } = await getSupabase()
    .from('transactions')
    .insert({ ...payload, created_by: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Admin: Balance summary ----

async function getBalanceSummary() {
  const { data, error } = await getSupabase()
    .from('v_full_balance')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function getPendingCount() {
  const { data, error } = await getSupabase()
    .from('v_balance_summary')
    .select('count_pending')
    .single();
  if (error) throw error;
  return data?.count_pending || 0;
}

// ---- Admin: Members ----

async function getAllProfiles() {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .order('full_name');
  if (error) throw error;
  return data;
}

async function updateSetting(key, value) {
  const profile = await getCurrentProfile();
  const { error } = await getSupabase()
    .from('settings')
    .update({ value, updated_by: profile.id, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) throw error;
}

async function getKasStatusAll(period) {
  let query = getSupabase()
    .from('v_kas_status')
    .select('*');
  if (period) query = query.eq('period', period);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
