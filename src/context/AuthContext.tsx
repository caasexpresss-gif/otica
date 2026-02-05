
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, storeName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Initial Session Check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Auth Event: ${event}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        await fetchProfile(session.user.id, session.user.email!);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTenant(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      console.log('👤 Fetching profile for:', userId);
      
      // Get Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        throw new Error("Perfil não encontrado.");
      }

      // Get Tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (tenantError || !tenantData) {
        console.error('Tenant error:', tenantError);
        throw new Error("Tenant não encontrado.");
      }

      setTenant(tenantData as Tenant);
      setUser({
        id: userId,
        email: email,
        name: profile.name,
        role: profile.role as any,
        tenantId: profile.tenant_id
      });
      console.log('✅ Auth State Updated');

    } catch (error) {
      console.error('❌ Critical Auth Error:', error);
      setAuthError(error instanceof Error ? error.message : "Erro ao carregar sessão");
      // Optional: Sign out if profile fails
      // await supabase.auth.signOut();
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };

    } catch (error: any) {
      console.error('Login error:', error.message);
      const msg = error.message === 'Invalid login credentials' 
        ? 'Email ou senha incorretos' 
        : 'Erro ao fazer login';
      setAuthError(msg);
      setIsLoading(false); // Only stop loading on error, success is handled by onAuthStateChange
      return { success: false, error: msg };
    }
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
    // State clearing handled by onAuthStateChange
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
