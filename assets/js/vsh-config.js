/*
 * ═══════════════════════════════════════════════════════════
 * VSH PLATFORM - CONFIG
 * Cấu hình kết nối Supabase
 * ═══════════════════════════════════════════════════════════
 */

const VSH_CONFIG = {
    // ⚠️ THAY THẾ BẰNG THÔNG TIN SUPABASE CỦA BẠN
    SUPABASE_URL: 'https://nnjdtlljieyhmskzlyzw.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_IXt69Gm_UEez891BptgjXQ_BoO9ru9n',
    
    // Cấu hình khác
    APP_NAME: 'UngDung360',
    APP_VERSION: '1.0.0',
    
    // Roles
    ROLES: {
        SUPER_ADMIN: 'SUPER_ADMIN',
        CUSTOMER_ADMIN: 'CUSTOMER_ADMIN',
        END_USER: 'END_USER'
    },
    
    // Plans
    PLANS: {
        STARTER: { name: 'Khởi nghiệp', maxUsers: 10, maxApps: 5 },
        PROFESSIONAL: { name: 'Chuyên nghiệp', maxUsers: 50, maxApps: 20 },
        ENTERPRISE: { name: 'Doanh nghiệp', maxUsers: -1, maxApps: -1 }
    }
};

// Xuất config để sử dụng ở các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VSH_CONFIG;
}
