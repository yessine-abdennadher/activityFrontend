export interface SavedGoogleAccount {
  email: string;
  name: string;
  avatar: string;
  lastUsed?: string;
}

const STORAGE_KEY = 'ACTIVITYTN_SAVED_GOOGLE_ACCOUNTS';

const INITIAL_ACCOUNTS: SavedGoogleAccount[] = [
  {
    email: 'abdo.activitytn@gmail.com',
    name: 'Abdo (Compte Gmail)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  },
  {
    email: 'ahmed.tunis@gmail.com',
    name: 'Ahmed Tunisien',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
];

let memoryAccounts: SavedGoogleAccount[] = [...INITIAL_ACCOUNTS];

export function getSavedGoogleAccounts(): SavedGoogleAccount[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignorer erreur de parsing
    }
  }
  return memoryAccounts;
}

export function saveGoogleAccount(account: SavedGoogleAccount): SavedGoogleAccount[] {
  const current = getSavedGoogleAccounts();
  const filtered = current.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
  const updated = [account, ...filtered];
  memoryAccounts = updated;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignorer erreur localStorage
    }
  }
  return updated;
}

export function removeGoogleAccount(email: string): SavedGoogleAccount[] {
  const current = getSavedGoogleAccounts();
  const updated = current.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
  memoryAccounts = updated;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignorer erreur localStorage
    }
  }
  return updated;
}
