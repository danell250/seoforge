type GoogleCredentialResponse = { credential?: string };

type GoogleWindow = Window & {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: Record<string, string | number | boolean>,
        ) => void;
      };
    };
  };
  __seoaxeGoogleInitialized?: boolean;
  __seoaxeGoogleInitPromise?: Promise<void>;
};

const SCRIPT_ID = "google-identity-services";
const CREDENTIAL_EVENT = "seoforge:google-credential";

export function getGoogleCredentialEventName() {
  return CREDENTIAL_EVENT;
}

export async function ensureGoogleIdentityInitialized(clientId: string): Promise<void> {
  const w = window as GoogleWindow;
  if (w.__seoaxeGoogleInitialized) return;
  if (w.__seoaxeGoogleInitPromise) return w.__seoaxeGoogleInitPromise;

  w.__seoaxeGoogleInitPromise = new Promise<void>((resolve, reject) => {
    const setup = () => {
      const g = w.google;
      if (!g) {
        reject(new Error("Google Identity Services did not load."));
        return;
      }

      if (!w.__seoaxeGoogleInitialized) {
        g.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) return;
            window.dispatchEvent(
              new CustomEvent(CREDENTIAL_EVENT, {
                detail: { credential: response.credential },
              }),
            );
          },
        });
        w.__seoaxeGoogleInitialized = true;
      }
      resolve();
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((window as GoogleWindow).google) {
        setup();
      } else {
        existing.addEventListener("load", setup, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = setup;
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script."));
    document.head.appendChild(script);
  });

  return w.__seoaxeGoogleInitPromise;
}

export async function renderGoogleButton(
  mount: HTMLElement,
  clientId: string,
  options: Record<string, string | number | boolean>,
) {
  await ensureGoogleIdentityInitialized(clientId);
  const g = (window as GoogleWindow).google;
  if (!g) return;
  mount.innerHTML = "";
  g.accounts.id.renderButton(mount, options);
}

