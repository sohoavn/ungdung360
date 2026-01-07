/**
 * =====================================================
 * VSH PLATFORM - AUTHENTICATION
 * =====================================================
 * Xử lý đăng nhập, đăng ký, đăng xuất
 * CẬP NHẬT: Hỗ trợ tự động tạo Tenant khi đăng ký
 * Phiên bản: 2.0.0
 * Ngày cập nhật: 07/01/2026
 * =====================================================
 */

const VSH_AUTH = {
    
    /**
     * ĐĂNG KÝ tài khoản mới (CÓ TẠO TENANT TỰ ĐỘNG)
     * @param {string} email 
     * @param {string} password 
     * @param {object} metadata - { full_name, company, industry }
     * @returns {object} { success, data, error }
     */
    async signUp(email, password, metadata = {}) {
        try {
            const supabase = getSupabase();
            if (!supabase) {
                return { success: false, error: 'Không thể kết nối Supabase' };
            }
            
            // Chuẩn bị metadata để trigger tự động tạo tenant
            const userMetadata = {
                full_name: metadata.full_name || '',
                company: metadata.company || '',
                industry: metadata.industry || 'other'
            };
            
            console.log('📝 Đang đăng ký với metadata:', userMetadata);
            
            // Đăng ký user - Supabase sẽ tự động trigger tạo tenant
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: userMetadata,
                    emailRedirectTo: window.location.origin + '/login.html'
                }
            });
            
            if (error) {
                console.error('❌ Lỗi đăng ký:', error.message);
                return { success: false, error: this.translateError(error.message) };
            }
            
            console.log('✅ Đăng ký thành công:', data.user?.email);
            
            // Kiểm tra xem cần xác nhận email không
            if (data.user && !data.session) {
                return { 
                    success: true, 
                    data: data,
                    needsEmailConfirmation: true,
                    message: 'Vui lòng kiểm tra email để xác nhận tài khoản'
                };
            }
            
            return { success: true, data: data };
            
        } catch (err) {
            console.error('❌ Exception:', err);
            return { success: false, error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
        }
    },
    
    /**
     * ĐĂNG NHẬP
     * @param {string} email 
     * @param {string} password 
     * @returns {object} { success, data, error }
     */
    async signIn(email, password) {
        try {
            const supabase = getSupabase();
            if (!supabase) {
                return { success: false, error: 'Không thể kết nối Supabase' };
            }
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                console.error('❌ Lỗi đăng nhập:', error.message);
                return { success: false, error: this.translateError(error.message) };
            }
            
            console.log('✅ Đăng nhập thành công:', data.user?.email);
            
            // Lưu thông tin tenant vào localStorage để dùng sau
            await this.loadAndSaveTenantInfo(data.user.id);
            
            return { success: true, data: data };
            
        } catch (err) {
            console.error('❌ Exception:', err);
            return { success: false, error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
        }
    },
    
    /**
     * TẢI VÀ LƯU THÔNG TIN TENANT CỦA USER
     * @param {string} userId 
     */
    async loadAndSaveTenantInfo(userId) {
        try {
            const supabase = getSupabase();
            if (!supabase) return;
            
            // Lấy tenant_users để biết user thuộc tenant nào
            const { data: tenantUser, error } = await supabase
                .from('tenant_users')
                .select(`
                    tenant_id,
                    role,
                    tenants (
                        id,
                        name,
                        code,
                        plan,
                        trial_ends_at,
                        status
                    )
                `)
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();
            
            if (error || !tenantUser) {
                console.warn('⚠️ Không tìm thấy tenant cho user này');
                localStorage.removeItem('vsh_tenant_id');
                localStorage.removeItem('vsh_tenant_info');
                return;
            }
            
            // Lưu vào localStorage
            localStorage.setItem('vsh_tenant_id', tenantUser.tenant_id);
            localStorage.setItem('vsh_tenant_info', JSON.stringify({
                id: tenantUser.tenants.id,
                name: tenantUser.tenants.name,
                code: tenantUser.tenants.code,
                plan: tenantUser.tenants.plan,
                trial_ends_at: tenantUser.tenants.trial_ends_at,
                status: tenantUser.tenants.status,
                user_role: tenantUser.role
            }));
            
            console.log('✅ Đã lưu thông tin tenant:', tenantUser.tenants.name);
            
        } catch (err) {
            console.error('❌ Lỗi load tenant info:', err);
        }
    },
    
    /**
     * LẤY THÔNG TIN TENANT HIỆN TẠI
     * @returns {object|null}
     */
    getTenantInfo() {
        const info = localStorage.getItem('vsh_tenant_info');
        return info ? JSON.parse(info) : null;
    },
    
    /**
     * LẤY TENANT ID HIỆN TẠI
     * @returns {string|null}
     */
    getTenantId() {
        return localStorage.getItem('vsh_tenant_id');
    },
    
    /**
     * ĐĂNG XUẤT
     * @returns {object} { success, error }
     */
    async signOut() {
        try {
            const supabase = getSupabase();
            if (!supabase) {
                return { success: false, error: 'Không thể kết nối Supabase' };
            }
            
            const { error } = await supabase.auth.signOut();
            
            // Xóa thông tin tenant khỏi localStorage
            localStorage.removeItem('vsh_tenant_id');
            localStorage.removeItem('vsh_tenant_info');
            
            if (error) {
                console.error('❌ Lỗi đăng xuất:', error.message);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Đã đăng xuất');
            return { success: true };
            
        } catch (err) {
            console.error('❌ Exception:', err);
            return { success: false, error: 'Đã có lỗi xảy ra.' };
        }
    },
    
    /**
     * LẤY USER HIỆN TẠI
     * @returns {object|null} User object hoặc null
     */
    async getCurrentUser() {
        try {
            const supabase = getSupabase();
            if (!supabase) return null;
            
            const { data: { user } } = await supabase.auth.getUser();
            return user;
            
        } catch (err) {
            console.error('❌ Lỗi lấy user:', err);
            return null;
        }
    },
    
    /**
     * LẤY SESSION HIỆN TẠI
     * @returns {object|null} Session object hoặc null
     */
    async getSession() {
        try {
            const supabase = getSupabase();
            if (!supabase) return null;
            
            const { data: { session } } = await supabase.auth.getSession();
            return session;
            
        } catch (err) {
            console.error('❌ Lỗi lấy session:', err);
            return null;
        }
    },
    
    /**
     * KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA
     * @returns {boolean}
     */
    async isLoggedIn() {
        const session = await this.getSession();
        return session !== null;
    },
    
    /**
     * GỬI EMAIL ĐẶT LẠI MẬT KHẨU
     * @param {string} email 
     * @returns {object} { success, error }
     */
    async resetPassword(email) {
        try {
            const supabase = getSupabase();
            if (!supabase) {
                return { success: false, error: 'Không thể kết nối Supabase' };
            }
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });
            
            if (error) {
                return { success: false, error: this.translateError(error.message) };
            }
            
            return { success: true };
            
        } catch (err) {
            return { success: false, error: 'Đã có lỗi xảy ra.' };
        }
    },
    
    /**
     * KIỂM TRA TRIAL CÒN HẠN KHÔNG
     * @returns {object} { isValid, daysLeft, message }
     */
    checkTrialStatus() {
        const tenantInfo = this.getTenantInfo();
        
        if (!tenantInfo) {
            return { isValid: false, daysLeft: 0, message: 'Không tìm thấy thông tin công ty' };
        }
        
        // Nếu không phải gói trial thì luôn valid
        if (tenantInfo.plan !== 'trial') {
            return { isValid: true, daysLeft: -1, message: 'Gói trả phí' };
        }
        
        // Tính số ngày còn lại
        const trialEnds = new Date(tenantInfo.trial_ends_at);
        const now = new Date();
        const diffTime = trialEnds - now;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            return { 
                isValid: false, 
                daysLeft: 0, 
                message: 'Thời gian dùng thử đã hết. Vui lòng nâng cấp gói!' 
            };
        }
        
        return { 
            isValid: true, 
            daysLeft: daysLeft, 
            message: `Còn ${daysLeft} ngày dùng thử` 
        };
    },
    
    /**
     * DỊCH LỖI TIẾNG ANH SANG TIẾNG VIỆT
     * @param {string} errorMessage 
     * @returns {string}
     */
    translateError(errorMessage) {
        const errorMap = {
            'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
            'Email not confirmed': 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.',
            'User already registered': 'Email này đã được đăng ký',
            'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
            'Unable to validate email address: invalid format': 'Định dạng email không hợp lệ',
            'Email rate limit exceeded': 'Gửi quá nhiều yêu cầu. Vui lòng đợi vài phút.',
            'For security purposes, you can only request this once every 60 seconds': 'Vui lòng đợi 60 giây trước khi thử lại',
            'Signup requires a valid password': 'Vui lòng nhập mật khẩu hợp lệ',
            'To signup, please provide your email': 'Vui lòng nhập địa chỉ email'
        };
        
        return errorMap[errorMessage] || errorMessage;
    }
};

// Shortcut functions
const vshSignUp = (email, password, metadata) => VSH_AUTH.signUp(email, password, metadata);
const vshSignIn = (email, password) => VSH_AUTH.signIn(email, password);
const vshSignOut = () => VSH_AUTH.signOut();
const vshGetUser = () => VSH_AUTH.getCurrentUser();
const vshIsLoggedIn = () => VSH_AUTH.isLoggedIn();
const vshGetTenantId = () => VSH_AUTH.getTenantId();
const vshGetTenantInfo = () => VSH_AUTH.getTenantInfo();
