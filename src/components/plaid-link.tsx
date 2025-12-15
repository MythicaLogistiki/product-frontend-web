"use client";

import { useState, useCallback, useEffect } from "react";
import { usePlaidLink, PlaidLinkOnSuccess } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Landmark, Loader2, CheckCircle } from "lucide-react";

interface PlaidLinkButtonProps {
  onSuccess?: (itemId: string, institutionName: string | null) => void;
  onError?: (error: Error) => void;
}

export function PlaidLinkButton({ onSuccess, onError }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link token on mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const { link_token } = await api.createPlaidLinkToken();
        setLinkToken(link_token);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize Plaid";
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    };

    fetchLinkToken();
  }, [onError]);

  const handleSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.connectPlaidAccount(
          publicToken,
          metadata.institution?.institution_id,
          metadata.institution?.name
        );

        setConnected(true);
        onSuccess?.(result.item_id, result.institution_name);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to connect account";
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
  });

  if (connected) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        Bank Connected
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => open()}
        disabled={!ready || loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Landmark className="h-4 w-4" />
        )}
        {loading ? "Connecting..." : "Connect Bank Account"}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
