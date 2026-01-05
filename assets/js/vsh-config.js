/**
 * =====================================================
 * VSH PLATFORM - CONFIGURATION
 * =====================================================
 * File cấu hình chứa các thông tin kết nối Supabase
 * 
 * HƯỚNG DẪN: Thay thế YOUR_PROJECT_URL và YOUR_ANON_KEY
 * bằng thông tin từ Supabase Dashboard của bạn
 * =====================================================
 */

const VSH_CONFIG = {
    // ===== SUPABASE =====
    // Lấy từ: Supabase Dashboard > Project Settings > API
    
    SUPABASE_URL: 'https://nnjdtlljieyhmskzlyzw.supabase.co',
    // Ví dụ: 'https://abcdefghijk.supabase.co'
    
    SUPABASE_ANON_KEY: 'sb_publishable_IXt69Gm_UEez891BptgjXQ_BoO9ru9n',
    // Ví dụ: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx'
    
    // ===== APP INFO =====
    APP_NAME: 'UngDung360',
    APP_VERSION: '1.0.0',
    
    // ===== ROUTES (Đường dẫn) =====
    ROUTES: {
        HOME: '/index.html',
        LOGIN: '/login.html',
        REGISTER: '/register.html',
        DASHBOARD: '/dashboard/index.html',
        FORGOT_PASSWORD: '/forgot-password.html'
    },
    
    // ===== DEFAULT VALUES =====
    DEFAULT_PRIMARY_COLOR: '#2563eb',
    DEFAULT_PLAN: 'starter'
};

// Kiểm tra config đã được thiết lập chưa
if (VSH_CONFIG.SUPABASE_URL === 'https://nnjdtlljieyhmskzlyzw.supabase.co') {
    console.warn('⚠️ VSH_CONFIG: Chưa cấu hình SUPABASE_URL! Hãy cập nhật file vsh-config.js');
}
