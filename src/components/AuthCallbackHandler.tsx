import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getProfileDestination } from "@/lib/profileRedirect";

const ALLOWED_DOMAIN = "@oauife.edu.ng";

const hasAuthHash = (hash: string) => {
  return ["access_token=", "refresh_token=", "error=", "error_code=", "token_type="].some((token) =>
    hash.includes(token)
  );
};

const AuthCallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!hasAuthHash(location.hash)) {
      return;
    }

    let active = true;

    const clearHash = () => {
      const cleanUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState({}, document.title, cleanUrl);
    };

    const routeAuthenticatedUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        clearHash();
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
        return;
      }

      const email = data.session?.user.email?.toLowerCase() ?? "";

      if (data.session?.user && email.endsWith(ALLOWED_DOMAIN)) {
        const destination = await getProfileDestination(data.session.user);
        clearHash();
        navigate(destination, { replace: true });
        return;
      }

      if (data.session?.user) {
        await supabase.auth.signOut();
        if (!active) return;

        clearHash();
        toast({
          title: "Access Denied",
          description: "Only @oauife.edu.ng accounts are allowed.",
          variant: "destructive",
        });
      }

      navigate("/auth", { replace: true });
    };

    routeAuthenticatedUser();

    return () => {
      active = false;
    };
  }, [location.hash, navigate, toast]);

  return null;
};

export default AuthCallbackHandler;
