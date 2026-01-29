import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ProviderStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  error?: string;
}

export default function AuthDebug() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Check session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // Test providers
      const providerTests: ProviderStatus[] = [];

      // Test Discord
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true,
          },
        });
        
        providerTests.push({
          name: 'Discord',
          enabled: !error,
          configured: !error,
          error: error?.message,
        });
      } catch (err: any) {
        providerTests.push({
          name: 'Discord',
          enabled: false,
          configured: false,
          error: err.message,
        });
      }

      // Test Google SSO
      try {
        const { error } = await supabase.auth.signInWithSSO({
          domain: 'miaoda-gg.com',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true,
          },
        });
        
        providerTests.push({
          name: 'Google SSO',
          enabled: !error,
          configured: !error,
          error: error?.message,
        });
      } catch (err: any) {
        providerTests.push({
          name: 'Google SSO',
          enabled: false,
          configured: false,
          error: err.message,
        });
      }

      setProviders(providerTests);
    } catch (error) {
      console.error('Auth debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDiscordOAuth = async () => {
    try {
      console.log('Testing Discord OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        alert(`Discord OAuth Error: ${error.message}`);
        console.error('Discord OAuth error:', error);
      } else {
        console.log('Discord OAuth initiated:', data);
      }
    } catch (err: any) {
      alert(`Discord OAuth Exception: ${err.message}`);
      console.error('Discord OAuth exception:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Status */}
            <div>
              <h3 className="font-semibold mb-2">Current Session</h3>
              {session ? (
                <div className="space-y-2">
                  <Badge variant="default" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Authenticated
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <p>User ID: {session.user.id}</p>
                    <p>Email: {session.user.email || 'N/A'}</p>
                    <p>Provider: {session.user.app_metadata.provider || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <Badge variant="secondary" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Not Authenticated
                </Badge>
              )}
            </div>

            {/* Provider Status */}
            <div>
              <h3 className="font-semibold mb-2">OAuth Providers</h3>
              {loading ? (
                <p className="text-muted-foreground">Checking providers...</p>
              ) : (
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <div key={provider.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{provider.name}</span>
                        {provider.configured ? (
                          <Badge variant="default" className="gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-2">
                            <XCircle className="w-4 h-4" />
                            Not Configured
                          </Badge>
                        )}
                      </div>
                      {provider.error && (
                        <div className="flex items-start gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <span>{provider.error}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test Buttons */}
            <div>
              <h3 className="font-semibold mb-2">Test OAuth</h3>
              <div className="space-y-2">
                <Button onClick={testDiscordOAuth} variant="outline" className="w-full">
                  Test Discord OAuth
                </Button>
                <p className="text-xs text-muted-foreground">
                  Click to test Discord OAuth. Check browser console for detailed logs.
                </p>
              </div>
            </div>

            {/* Configuration Info */}
            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
                <p>Current Origin: {window.location.origin}</p>
                <p>Redirect URL: {window.location.origin}/</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Setup Instructions</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>If Discord OAuth is not configured:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Discord Developer Portal</li>
                  <li>Create an application</li>
                  <li>Add redirect URL: https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback</li>
                  <li>Copy Client ID and Secret</li>
                  <li>Enable Discord in Supabase Dashboard → Authentication → Providers</li>
                  <li>Paste credentials and save</li>
                </ol>
                <p className="mt-2">
                  See <code>DISCORD_OAUTH_SETUP.md</code> for detailed instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
