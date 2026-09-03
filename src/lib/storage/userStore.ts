import { User } from '../../types/user';

const STORAGE_KEY_USERS = 'trustlens_users_v1';
const STORAGE_KEY_CURRENT_USER = 'trustlens_current_user_v1';

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-ravi',
    username: 'ravi',
    name: 'Ravi Kumar',
    role: 'Student',
    avatarInitials: 'RK',
    password: 'password123',
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'usr-sarah',
    username: 'sarah',
    name: 'Sarah Chen',
    role: 'Security Lead',
    avatarInitials: 'SC',
    password: 'password123',
    createdAt: '2024-02-10T14:30:00.000Z'
  },
  {
    id: 'usr-alex',
    username: 'alex',
    name: 'Alex Morgan',
    role: 'Senior Developer',
    avatarInitials: 'AM',
    password: 'password123',
    createdAt: '2024-03-01T09:15:00.000Z'
  },
  {
    id: 'usr-priya',
    username: 'priya',
    name: 'Priya Sharma',
    role: 'Startup Founder',
    avatarInitials: 'PS',
    password: 'password123',
    createdAt: '2024-03-20T16:45:00.000Z'
  }
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function loadAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      saveAllUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export function saveAllUsers(users: User[]) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to local storage', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw === 'null') return null;
    if (!raw) {
      // Default to Ravi Kumar on first load
      const defaultUser = DEFAULT_USERS[0];
      setCurrentUser(defaultUser);
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USERS[0];
  }
}

export function setCurrentUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, 'null');
    }
  } catch (e) {
    console.error('Error setting current user', e);
  }
}

export function loginUser(username: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = loadAllUsers();
  const cleanUsername = username.trim().toLowerCase();
  
  const found = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (!found) {
    return { success: false, error: `No account found with username "${username}".` };
  }

  if (found.password && found.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(found);
  return { success: true, user: found };
}

export function registerUser(data: {
  username: string;
  name: string;
  password: string;
  role: string;
}): { success: boolean; user?: User; error?: string } {
  const users = loadAllUsers();
  const cleanUsername = data.username.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }

  if (!data.name.trim()) {
    return { success: false, error: 'Please enter your full name.' };
  }

  if (!data.password || data.password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, error: `Username "${cleanUsername}" is already taken. Please choose another.` };
  }

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username: cleanUsername,
    name: data.name.trim(),
    role: data.role || 'Developer',
    avatarInitials: getInitials(data.name),
    password: data.password,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [...users, newUser];
  saveAllUsers(updatedUsers);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
