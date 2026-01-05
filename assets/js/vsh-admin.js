/**
 * =====================================================
 * VSH PLATFORM - ADMIN FUNCTIONS
 * =====================================================
 * Các hàm dành riêng cho Admin Dashboard
 * =====================================================
 */

const VSH_ADMIN = {
    
    /**
     * KIỂM TRA CÓ PHẢI SUPER ADMIN KHÔNG
     * @returns {boolean}
     */
    async isSuperAdmin() {
        try {
            const supabase = getSupabase();
            if (!supabase) return false;
            
            const user = await VSH_AUTH.getCurrentUser();
            if (!user) return false;
            
            const { data, error } = await supabase
                .from('profiles')
                .select('is_super_admin')
                .eq('id', user.id)
                .single();
            
            if (error || !data) return false;
            
            return data.is_super_admin === true;
            
        } catch (err) {
            console.error('Lỗi kiểm tra admin:', err);
            return false;
        }
    },
    
    /**
     * YÊU CẦU QUYỀN SUPER ADMIN
     * Chuyển hướng nếu không phải admin
     */
    async requireSuperAdmin() {
        const isAdmin = await this.isSuperAdmin();
        if (!isAdmin) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '../dashboard/index.html';
            return false;
        }
        return true;
    },
    
    // =====================================================
    // QUẢN LÝ TENANTS
    // =====================================================
    
    /**
     * LẤY DANH SÁCH TẤT CẢ TENANTS
     */
    async getAllTenants() {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data: data || [] };
            
        } catch (err) {
            console.error('Lỗi lấy tenants:', err);
            return { success: false, error: err.message, data: [] };
        }
    },
    
    /**
     * TẠO TENANT MỚI
     */
    async createTenant(tenantData) {
        try {
            const supabase = getSupabase();
            
            // Tạo code từ tên (loại bỏ dấu, thay space bằng -)
            const code = this.generateCode(tenantData.name);
            
            const { data, error } = await supabase
                .from('tenants')
                .insert({
                    name: tenantData.name,
                    code: code,
                    email: tenantData.email || null,
                    phone: tenantData.phone || null,
                    address: tenantData.address || null,
                    industry: tenantData.industry || null,
                    plan: tenantData.plan || 'starter',
                    status: 'active'
                })
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
            
        } catch (err) {
            console.error('Lỗi tạo tenant:', err);
            return { success: false, error: err.message };
        }
    },
    
    /**
     * CẬP NHẬT TENANT
     */
    async updateTenant(tenantId, tenantData) {
        try {
            const supabase = getSupabase();
            
            const { data, error } = await supabase
                .from('tenants')
                .update({
                    name: tenantData.name,
                    email: tenantData.email,
                    phone: tenantData.phone,
                    address: tenantData.address,
                    industry: tenantData.industry,
                    plan: tenantData.plan,
                    status: tenantData.status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', tenantId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
            
        } catch (err) {
            console.error('Lỗi cập nhật tenant:', err);
            return { success: false, error: err.message };
        }
    },
    
    /**
     * XÓA TENANT
     */
    async deleteTenant(tenantId) {
        try {
            const supabase = getSupabase();
            
            const { error } = await supabase
                .from('tenants')
                .delete()
                .eq('id', tenantId);
            
            if (error) throw error;
            return { success: true };
            
        } catch (err) {
            console.error('Lỗi xóa tenant:', err);
            return { success: false, error: err.message };
        }
    },
    
    // =====================================================
    // QUẢN LÝ USERS
    // =====================================================
    
    /**
     * LẤY DANH SÁCH TẤT CẢ USERS
     */
    async getAllUsers() {
        try {
            const supabase = getSupabase();
            
            // Lấy profiles kèm thông tin user
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data: data || [] };
            
        } catch (err) {
            console.error('Lỗi lấy users:', err);
            return { success: false, error: err.message, data: [] };
        }
    },
    
    /**
     * CẬP NHẬT USER PROFILE
     */
    async updateUserProfile(userId, profileData) {
        try {
            const supabase = getSupabase();
            
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    role: profileData.role,
                    is_super_admin: profileData.is_super_admin || false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
            
        } catch (err) {
            console.error('Lỗi cập nhật profile:', err);
            return { success: false, error: err.message };
        }
    },
    
    // =====================================================
    // QUẢN LÝ APPS
    // =====================================================
    
    /**
     * LẤY TẤT CẢ APPS (KỂ CẢ INACTIVE)
     */
    async getAllApps() {
        try {
            const supabase = getSupabase();
            
            const { data, error } = await supabase
                .from('apps')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            return { success: true, data: data || [] };
            
        } catch (err) {
            console.error('Lỗi lấy apps:', err);
            return { success: false, error: err.message, data: [] };
        }
    },
    
    /**
     * TẠO APP MỚI
     */
    async createApp(appData) {
        try {
            const supabase = getSupabase();
            
            const { data, error } = await supabase
                .from('apps')
                .insert({
                    code: appData.code,
                    name: appData.name,
                    description: appData.description || null,
                    icon: appData.icon || '📱',
                    category: appData.category || 'other',
                    app_url: appData.app_url || null,
                    is_free: appData.is_free || false,
                    is_active: appData.is_active !== false,
                    sort_order: appData.sort_order || 0
                })
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
            
        } catch (err) {
            console.error('Lỗi tạo app:', err);
            return { success: false, error: err.message };
        }
    },
    
    /**
     * CẬP NHẬT APP
     */
    async updateApp(appId, appData) {
        try {
            const supabase = getSupabase();
            
            const { data, error } = await supabase
                .from('apps')
                .update({
                    name: appData.name,
                    description: appData.description,
                    icon: appData.icon,
                    category: appData.category,
                    app_url: appData.app_url,
                    is_free: appData.is_free,
                    is_active: appData.is_active,
                    sort_order: appData.sort_order
                })
                .eq('id', appId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data: data };
            
        } catch (err) {
            console.error('Lỗi cập nhật app:', err);
            return { success: false, error: err.message };
        }
    },
    
    /**
     * XÓA APP
     */
    async deleteApp(appId) {
        try {
            const supabase = getSupabase();
            
            const { error } = await supabase
                .from('apps')
                .delete()
                .eq('id', appId);
            
            if (error) throw error;
            return { success: true };
            
        } catch (err) {
            console.error('Lỗi xóa app:', err);
            return { success: false, error: err.message };
        }
    },
    
    // =====================================================
    // THỐNG KÊ
    // =====================================================
    
    /**
     * LẤY THỐNG KÊ TỔNG QUAN
     */
    async getStats() {
        try {
            const supabase = getSupabase();
            
            // Đếm số tenants
            const { count: tenantCount } = await supabase
                .from('tenants')
                .select('*', { count: 'exact', head: true });
            
            // Đếm số users
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            
            // Đếm số apps
            const { count: appCount } = await supabase
                .from('apps')
                .select('*', { count: 'exact', head: true });
            
            // Đếm số apps đang active
            const { count: activeAppCount } = await supabase
                .from('apps')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            
            return {
                success: true,
                data: {
                    totalTenants: tenantCount || 0,
                    totalUsers: userCount || 0,
                    totalApps: appCount || 0,
                    activeApps: activeAppCount || 0
                }
            };
            
        } catch (err) {
            console.error('Lỗi lấy stats:', err);
            return { success: false, error: err.message };
        }
    },
    
    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================
    
    /**
     * Tạo code từ tên (loại bỏ dấu tiếng Việt)
     */
    generateCode(name) {
        const map = {
            'à':'a','á':'a','ả':'a','ã':'a','ạ':'a',
            'ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a',
            'â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a',
            'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e',
            'ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
            'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
            'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o',
            'ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o',
            'ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
            'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u',
            'ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
            'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
            'đ':'d',
            'À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A',
            'Ă':'A','Ằ':'A','Ắ':'A','Ẳ':'A','Ẵ':'A','Ặ':'A',
            'Â':'A','Ầ':'A','Ấ':'A','Ẩ':'A','Ẫ':'A','Ậ':'A',
            'È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E',
            'Ê':'E','Ề':'E','Ế':'E','Ể':'E','Ễ':'E','Ệ':'E',
            'Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I',
            'Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O',
            'Ô':'O','Ồ':'O','Ố':'O','Ổ':'O','Ỗ':'O','Ộ':'O',
            'Ơ':'O','Ờ':'O','Ớ':'O','Ở':'O','Ỡ':'O','Ợ':'O',
            'Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U',
            'Ư':'U','Ừ':'U','Ứ':'U','Ử':'U','Ữ':'U','Ự':'U',
            'Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y',
            'Đ':'D'
        };
        
        return name
            .split('')
            .map(char => map[char] || char)
            .join('')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },
    
    /**
     * Format ngày tháng
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};
