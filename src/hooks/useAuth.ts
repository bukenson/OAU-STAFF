import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";

const ALLOWED_DOMAIN = "oauife.edu.ng";

function isAllowedEmail(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user && !isAllowedEmail(session.user.email)) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Only @oauife.edu.ng accounts are allowed. Please sign in with your OAU email.",
            variant: "destructive",
          });
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !isAllowedEmail(session.user.email)) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "Only @oauife.edu.ng accounts are allowed. Please sign in with your OAU email.",
          variant: "destructive",
        });
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
