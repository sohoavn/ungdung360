/**
 * =====================================================
 * VSH PLATFORM - SUPABASE CLIENT
 * =====================================================
 * File này khởi tạo kết nối với Supabase
 * Cần load SAU file vsh-config.js
 * =====================================================
 */

// Import Supabase từ CDN (sẽ được load trong HTML)
// const { createClient } = supabase;

let vshSupabase = null;

/**
 * Khởi tạo Supabase Client
 */
function initSupabase() {
    if (vshSupabase) {
        return vshSupabase;
    }
    
    // Kiểm tra config
    if (!VSH_CONFIG || !VSH_CONFIG.SUPABASE_URL || !VSH_CONFIG.SUPABASE_ANON_KEY) {
        console.error('❌ Lỗi: Chưa cấu hình Supabase trong vsh-config.js');
        return null;
    }
    
    // Kiểm tra Supabase library đã load chưa
    if (typeof supabase === 'undefined') {
        console.error('❌ Lỗi: Chưa load Supabase JS library');
        return null;
    }
    
    // Khởi tạo client
    vshSupabase = supabase.createClient(
        VSH_CONFIG.SUPABASE_URL,
        VSH_CONFIG.SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase Client đã khởi tạo thành công');
    return vshSupabase;
}

/**
 * Lấy Supabase Client
 */
function getSupabase() {
    if (!vshSupabase) {
        return initSupabase();
    }
    return vshSupabase;
}

// Tự động khởi tạo khi load
document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
});