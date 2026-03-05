import { SchemaStore } from '@/lib/schema-store';
import { Button } from '@/components/ui/button';

const LicenseBlocked = () => {
  const status = SchemaStore.getLicenseStatus();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Builder Access Blocked</h1>
        <p className="mb-1 text-muted-foreground">
          Your license is currently <span className="font-medium text-foreground">{status}</span>.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          {status === 'inactive'
            ? 'Please activate your license to access the visual builder.'
            : 'You have exceeded your license limits. Please upgrade to continue.'}
        </p>
        <Button variant="default" onClick={() => alert('License activation coming soon')}>
          Enter License Key
        </Button>
        <div className="mt-4">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  );
};

export default LicenseBlocked;
