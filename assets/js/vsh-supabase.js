/*
 * ═══════════════════════════════════════════════════════════
 * VSH PLATFORM - SUPABASE CLIENT
 * Khởi tạo và quản lý kết nối Supabase
 * ═══════════════════════════════════════════════════════════
 */

// Khởi tạo Supabase Client
const supabase = window.supabase.createClient(
    VSH_CONFIG.SUPABASE_URL,
    VSH_CONFIG.SUPABASE_ANON_KEY
);

/*
 * ===== AUTHENTICATION FUNCTIONS =====
 */

const VSH_AUTH = {
    
    // Đăng ký tài khoản mới
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: metadata
                }
            });
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('SignUp Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Đăng nhập
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('SignIn Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Đăng nhập bằng Google
    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard/'
                }
            });
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('Google SignIn Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Đăng xuất
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('SignOut Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Lấy user hiện tại
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('GetUser Error:', error);
            return null;
        }
    },
    
    // Lấy session hiện tại
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('GetSession Error:', error);
            return null;
        }
    },
    
    // Kiểm tra đã đăng nhập chưa
    async isLoggedIn() {
        const session = await this.getSession();
        return session !== null;
    },
    
    // Quên mật khẩu
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('ResetPassword Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Lắng nghe thay đổi auth state
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

/*
 * ===== DATA FUNCTIONS =====
 */

const VSH_DATA = {
    
    // Lấy thông tin user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*, tenants(*)')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('GetUserProfile Error:', error);
            return null;
        }
    },
    
    // Cập nhật user profile
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('UpdateUserProfile Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Lấy thông tin tenant
    async getTenant(tenantId) {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('GetTenant Error:', error);
            return null;
        }
    },
    
    // Tạo tenant mới (khi đăng ký)
    async createTenant(tenantData) {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .insert([tenantData])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('CreateTenant Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Lấy danh sách tất cả apps
    async getAllApps() {
        try {
            const { data, error } = await supabase
                .from('apps')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('GetAllApps Error:', error);
            return [];
        }
    },
    
    // Lấy apps của tenant
    async getTenantApps(tenantId) {
        try {
            const { data, error } = await supabase
                .from('tenant_apps')
                .select('*, apps(*)')
                .eq('tenant_id', tenantId)
                .eq('is_active', true);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('GetTenantApps Error:', error);
            return [];
        }
    },
    
    // Thêm app cho tenant
    async addAppToTenant(tenantId, appId) {
        try {
            const { data, error } = await supabase
                .from('tenant_apps')
                .insert([{ tenant_id: tenantId, app_id: appId }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('AddAppToTenant Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Lấy danh sách users của tenant
    async getTenantUsers(tenantId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('GetTenantUsers Error:', error);
            return [];
        }
    },
    
    // Đếm số users của tenant
    async countTenantUsers(tenantId) {
        try {
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId);
            
            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('CountTenantUsers Error:', error);
            return 0;
        }
    }
};

/*
 * ===== UTILITY FUNCTIONS =====
 */

const VSH_UTILS = {
    
    // Tạo tenant code từ tên công ty
    generateTenantCode(companyName) {
        return companyName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    },
    
    // Lấy initials từ tên
    getInitials(fullName) {
        if (!fullName) return '??';
        const names = fullName.trim().split(' ');
        if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        }
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    },
    
    // Format ngày tháng
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    // Format ngày giờ
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Hiển thị thông báo
    showAlert(message, type = 'info') {
        // Tạo alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `vsh-toast vsh-toast--${type}`;
        alertDiv.innerHTML = `
            <span class="vsh-toast__icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span class="vsh-toast__message">${message}</span>
        `;
        
        // Thêm style cho toast
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ${type === 'success' ? 'background: #dcfce7; color: #166534;' : ''}
            ${type === 'error' ? 'background: #fef2f2; color: #dc2626;' : ''}
            ${type === 'info' ? 'background: #eff6ff; color: #2563eb;' : ''}
        `;
        
        document.body.appendChild(alertDiv);
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
};

// Thêm animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('✅ VSH Supabase Client loaded successfully');
