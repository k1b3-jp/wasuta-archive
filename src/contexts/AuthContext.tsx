import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

interface AuthState {
	user: User | null;
	session: Session | null;
	isLoggedIn: boolean;
	isAdmin: boolean;
	loading: boolean;
}

interface AuthContextValue extends AuthState {
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getAdminStatus = async (session: Session | null) => {
	if (!session) return false;

	try {
		const response = await fetch("/api/auth/me", {
			headers: { Authorization: `Bearer ${session.access_token}` },
		});
		if (!response.ok) return false;
		const body: { isAdmin?: boolean } = await response.json();
		return body.isAdmin === true;
	} catch {
		return false;
	}
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [admin, setAdmin] = useState(false);
	const authRevision = useRef(0);

	const isLoggedIn = !!user;

	// サインアウト
	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			authRevision.current += 1;
			setUser(null);
			setSession(null);
			setAdmin(false);
		} catch (error) {
			console.error("Error signing out:", error);
			throw error;
		}
	};

	useEffect(() => {
		let active = true;

		const applySession = async (nextSession: Session | null) => {
			const revision = ++authRevision.current;
			setSession(nextSession);
			setUser(nextSession?.user ?? null);
			setAdmin(false);
			const isAdmin = await getAdminStatus(nextSession);
			if (!active || revision !== authRevision.current) return;
			setAdmin(isAdmin);
			setLoading(false);
		};

		supabase.auth.getSession().then(({ data, error }) => {
			if (error) {
				console.error("Error fetching session:", error);
				void applySession(null);
				return;
			}
			void applySession(data.session);
		});

		// セッション変更の監視
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			void applySession(nextSession);
		});

		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, []);

	const value: AuthContextValue = {
		user,
		session,
		isLoggedIn,
		isAdmin: admin,
		loading,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
