
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, storeName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ... (keep state)
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Safety timeout: stop loading after 15 seconds max (increased for slow connections)
    const safetyTimeout = setTimeout(() => {
        setIsLoading((loading) => {
            if (loading) {
                console.warn("Auth loading timed out - forcing release.");
                setAuthError("Tempo limite excedido. O servidor pode estar lento ou pausado.");
                return false;
            }
            return loading;
        });
    }, 15000);

    const loadSession = async () => {
      console.log('🔄 Auth: Loading session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
            console.log('✅ Auth: Session found', session.user.id);
            await fetchProfile(session.user.id, session.user.email!);
        } else {
            console.log('ℹ️ Auth: No session');
            setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Auth: Load session error', err);
        setIsLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Auth Event: ${event}`);
      if (session?.user) {
        // Only fetch if not already loaded/loading? 
        // For simplicity, we fetch to ensure sync.
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setTenant(null);
        setIsLoading(false);
      }
    });

    return () => {
        subscription.unsubscribe();
        clearTimeout(safetyTimeout);
    };
  }, []);

  // Deduping promise ref
  const profilePromiseRef = React.useRef<Promise<boolean> | null>(null);

  const fetchProfile = async (userId: string, email: string): Promise<boolean> => {
    // 1. Check if already loaded to avoid redundant fetch
    if (user?.id === userId && tenant?.id) {
        console.log('✅ Auth: Profile already loaded for', userId);
        return true;
    }

    // 2. Check operational promise (deduping)
    if (profilePromiseRef.current) {
         console.log('🔄 Auth: Joining existing fetchProfile operation...');
         return profilePromiseRef.current;
    }

    const tId = Math.random().toString(36).substring(7); // Trace ID
    console.log(`[${tId}] 🕒 fetchProfile START for ${userId}`);
    
    // Create the promise and store it
    const promise = (async () => {
        console.time(`fetchProfile-${tId}`);
        try {
          console.log(`[${tId}] 👤 Querying profiles table...`);
          // Get Profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError) throw profileError;
          if (!profile) throw new Error("Profile not found");
          
          console.log(`[${tId}] ✅ Profile found:`, profile.id);

          console.log(`[${tId}] 🏢 Querying tenants table for ${profile.tenant_id}...`);
          // Get Tenant
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', profile.tenant_id)
            .single();

          if (tenantError) throw tenantError;
          if (!tenantData) throw new Error("Tenant not found");
          
          console.log(`[${tId}] ✅ Tenant found:`, tenantData.id);

          console.log(`[${tId}] 🔄 State Updates START`);

          // Batch updates
          setTenant(tenantData as Tenant);
          setUser({
            id: userId,
            email: email,
            name: profile.name,
            role: profile.role as any,
            tenantId: profile.tenant_id
          });
          console.log(`[${tId}] 🔄 State Updates DONE`);
          
          return true;
        } catch (error) {
          console.error(`[${tId}] ❌ Critical Auth Error:`, error);
          await supabase.auth.signOut();
          setUser(null);
          setTenant(null);
          setAuthError(error instanceof Error ? error.message : "Erro desconhecido ao carregar perfil.");
          return false;
        } finally {
          setIsLoading(false);
          console.timeEnd(`fetchProfile-${tId}`);
          console.log(`[${tId}] 🏁 fetchProfile END`);
          // Clear promise ref so future calls can rewrite
          profilePromiseRef.current = null;
        }
    })();

    profilePromiseRef.current = promise;
    return promise;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null); // Clear previous errors
    console.time('loginTotal');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      setAuthError(error.message);
      setIsLoading(false);
      console.timeEnd('loginTotal');
      return false;
    }
    
    // Explicitly wait for profile to load before returning
    let profileSuccess = false;
    if (data.session?.user) {
        // This will now reuse the promise if onAuthStateChange already triggered it
        profileSuccess = await fetchProfile(data.session.user.id, data.session.user.email!);
    }
    
    console.timeEnd('loginTotal');
    return profileSuccess; 
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    storeName: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // 2. Create tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert([{ name: storeName, plan: 'FREE' }])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 3. Create profile linked to tenant
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          name: name,
          tenant_id: tenantData.id,
          role: 'OWNER'
        }]);

      if (profileError) throw profileError;

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao registrar';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTenant(null);
    setAuthError(null);
  };


  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      isLoading,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
