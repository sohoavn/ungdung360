/**
 * =====================================================
 * VSH PLATFORM - AUTHENTICATION
 * =====================================================
 * Xử lý đăng nhập, đăng ký, đăng xuất
 * Cần load SAU vsh-config.js và vsh-supabase.js
 * =====================================================
 */

const VSH_AUTH = {
    
    /**
     * ĐĂNG KÝ tài khoản mới
     * @param {string} email 
     * @param {string} password 
     * @param {object} metadata - { full_name, company, ... }
     * @returns {object} { success, data, error }
     */
    async signUp(email, password, metadata = {}) {
        try {
            const supabase = getSupabase();
            if (!supabase) {
                return { success: false, error: 'Không thể kết nối Supabase' };
            }
            
            // Đăng ký user
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: metadata.full_name || '',
                        company: metadata.company || '',
                        industry: metadata.industry || ''
                    }
                }
            });
            
            if (error) {
                console.error('❌ Lỗi đăng ký:', error.message);
                return { success: false, error: this.translateError(error.message) };
            }
            
            console.log('✅ Đăng ký thành công:', data.user?.email);
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
            return { success: true, data: data };
            
        } catch (err) {
            console.error('❌ Exception:', err);
            return { success: false, error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
        }
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
     * CHUYỂN HƯỚNG NẾU CHƯA ĐĂNG NHẬP
     * Dùng cho các trang cần bảo vệ (dashboard, settings,...)
     */
    async requireAuth() {
        const isLoggedIn = await this.isLoggedIn();
        if (!isLoggedIn) {
            window.location.href = VSH_CONFIG.ROUTES.LOGIN;
            return false;
        }
        return true;
    },
    
    /**
     * CHUYỂN HƯỚNG NẾU ĐÃ ĐĂNG NHẬP
     * Dùng cho trang login, register
     */
    async redirectIfLoggedIn() {
        const isLoggedIn = await this.isLoggedIn();
        if (isLoggedIn) {
            window.location.href = VSH_CONFIG.ROUTES.DASHBOARD;
            return true;
        }
        return false;
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
            'For security purposes, you can only request this once every 60 seconds': 'Vui lòng đợi 60 giây trước khi thử lại'
        };
        
        return errorMap[errorMessage] || errorMessage;
    }
};

// Shortcut functions (để gọi ngắn gọn hơn)
const vshSignUp = (email, password, metadata) => VSH_AUTH.signUp(email, password, metadata);
const vshSignIn = (email, password) => VSH_AUTH.signIn(email, password);
const vshSignOut = () => VSH_AUTH.signOut();
const vshGetUser = () => VSH_AUTH.getCurrentUser();
const vshIsLoggedIn = () => VSH_AUTH.isLoggedIn();