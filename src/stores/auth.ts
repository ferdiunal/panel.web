/**
 * Auth Store
 *
 * Kullanıcı oturum yönetimi için merkezi Zustand store.
 *
 * ## Kullanım
 *
 * ### Store'dan state okuma:
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuthStore();
 * ```
 *
 * ### Loader'larda oturum kontrolü:
 * ```ts
 * // checkSession() başarısızlık durumunda hata fırlatır.
 * // Bu sayede loader catch bloğu çalışır ve /login'e yönlendirir.
 * // TTL süresince (varsayılan 60sn) tekrar çağrılırsa API'ye gitmez,
 * // mevcut store state'ini kullanır.
 * try {
 *   await useAuthStore.getState().checkSession();
 * } catch {
 *   return redirect('/login');
 * }
 * ```
 *
 * ### Login sonrası state güncelleme:
 * ```ts
 * const { login } = useAuthStore();
 * login(user, token);
 * ```
 *
 * ### Önbellek davranışı:
 * ```
 * İlk çağrı         → API isteği atar, sonucu cache'ler (60sn TTL)
 * 60sn içinde tekrar → API'ye gitmez, mevcut state'i kontrol eder
 * 60sn sonra tekrar  → API isteği atar, cache'i yeniler
 * Logout / 401       → Cache temizlenir, sonraki çağrı API'ye gider
 * ```
 */
import { create } from 'zustand';
import api, { setAuthToken, clearAuthToken } from '@/lib/axios';
import { isSessionCacheValid, updateSessionCache, invalidateSessionCache } from '@/lib/session-cache';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    // checkSession başarısız olursa hata fırlatır,
    // böylece loader'daki catch bloğu çalışır.
    // TTL süresi içinde tekrar çağrılırsa API'ye gitmez.
    checkSession: () => Promise<void>;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
    setError: (error: Error | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    
    /**
     * Oturum kontrolü yapar (TTL tabanlı önbellekli).
     *
     * - İlk çağrıda veya TTL süresi dolduğunda API'ye istek atar.
     * - TTL süresi içinde tekrar çağrılırsa mevcut store state'ini kontrol eder:
     *   - isAuthenticated === true → sessizce döner (API'ye gitmez)
     *   - isAuthenticated === false → hata fırlatır (redirect için)
     * - Başarısız: state temizler VE hata fırlatır.
     * - Logout veya 401 interceptor'ı cache'i sıfırlar.
     *
     * Hatayı fırlatması kritik — loader catch blokları
     * bu sayede redirect('/login') yapabilir.
     */
    checkSession: async () => {
        // TTL süresi dolmadıysa API'ye gitme, mevcut state'i kullan
        if (isSessionCacheValid()) {
            const { isAuthenticated } = get();
            if (isAuthenticated) {
                // Oturum hala geçerli — sessizce dön
                return;
            }
            // Cache'te var ama authenticated değil — hata fırlat
            throw new Error("Oturum geçersiz (cached)");
        }
        
        // TTL doldu veya ilk çağrı — API'ye git
        try {
            const { data } = await api.get('/auth/session');
            if (!data.user) {
                throw new Error("Oturum doğrulanamadı");
            }
            // Başarılı — state güncelle ve cache timestamp'ini yenile
            updateSessionCache();
            set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error) {
            // Başarısız — state temizle, cache'i sıfırla
            invalidateSessionCache();
            clearAuthToken();
            set({ user: null, isAuthenticated: false, isLoading: false });
            // Hatayı fırlat — loader catch bloğu redirect yapabilsin
            throw error;
        }
    },
    
    login: (user, token) => {
        setAuthToken(token);
        // Login sonrası cache'i güncelle — gereksiz session kontrolünü engelle
        updateSessionCache();
        set({ user, isAuthenticated: true, isLoading: false, error: null });
    },
    
    logout: async () => {
        try {
            await api.post('/auth/sign-out', {});
        } catch (e) {
            // Logout hatalarını yoksay
        }
        // Cache'i sıfırla — sonraki checkSession API'ye gitsin
        invalidateSessionCache();
        clearAuthToken();
        set({ user: null, isAuthenticated: false });
    },
    
    setError: (error) => set({ error }),
}));
