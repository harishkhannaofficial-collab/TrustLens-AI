import { 
  loadAllUsers, 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  getInitials 
} from './src/lib/storage/userStore.ts';

console.log('=== TRUSTLENS AI: Authentication & User Management Test ===\n');

// Mock localStorage if running in Node
if (typeof localStorage === 'undefined' || localStorage === null) {
  let store = {};
  global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = v.toString(); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
}

// 1. Initial State & Defaults
console.log('[Step 1] Loading initial users...');
const initialUsers = loadAllUsers();
console.log(`✓ Total default accounts available: ${initialUsers.length}`);
initialUsers.forEach(u => console.log(`  - @${u.username}: ${u.name} (${u.role}) [${u.avatarInitials}]`));

if (initialUsers.length < 4) {
  console.error('❌ Failed: Expected at least 4 default users');
  process.exit(1);
}

// 2. Login as Sarah Chen
console.log('\n[Step 2] Testing Login with different user ID (@sarah)...');
const sarahLogin = loginUser('sarah', 'password123');
if (!sarahLogin.success || sarahLogin.user?.name !== 'Sarah Chen') {
  console.error('❌ Failed to login as Sarah Chen', sarahLogin);
  process.exit(1);
}
console.log(`✓ Logged in as: ${sarahLogin.user.name} (${sarahLogin.user.role})`);
console.log(`✓ Current active user session: ${getCurrentUser()?.name}`);

// 3. Logout
console.log('\n[Step 3] Testing Logout...');
logoutUser();
const loggedOutSession = getCurrentUser();
if (loggedOutSession !== null) {
  console.error('❌ Expected session to be null after logout');
  process.exit(1);
}
console.log('✓ Successfully logged out. Current session is null.');

// 4. Create New Username and Password (Register)
console.log('\n[Step 4] Creating a new user account (@cyber_dan)...');
const newReg = registerUser({
  username: 'cyber_dan',
  name: 'Daniel Vance',
  password: 'dansecurepass',
  role: 'DevOps Engineer'
});

if (!newReg.success || !newReg.user) {
  console.error('❌ Failed to register new user', newReg);
  process.exit(1);
}
console.log(`✓ New account created: @${newReg.user.username} - ${newReg.user.name}`);
console.log(`✓ Computed Initials: "${newReg.user.avatarInitials}"`);
console.log(`✓ Automatically signed in as: ${getCurrentUser()?.name}`);

// 5. Duplicate username rejection
console.log('\n[Step 5] Testing duplicate username prevention...');
const dupReg = registerUser({
  username: 'cyber_dan',
  name: 'Imposter Dan',
  password: 'password123',
  role: 'Student'
});
if (dupReg.success) {
  console.error('❌ Should reject duplicate username');
  process.exit(1);
}
console.log(`✓ Correctly rejected duplicate username: "${dupReg.error}"`);

// 6. Sign in with newly created credentials
console.log('\n[Step 6] Testing sign in with newly created username & password...');
logoutUser();
const danLogin = loginUser('cyber_dan', 'dansecurepass');
if (!danLogin.success || danLogin.user?.username !== 'cyber_dan') {
  console.error('❌ Failed to login with new credentials', danLogin);
  process.exit(1);
}
console.log(`✓ Successfully authenticated as: ${danLogin.user.name} (@${danLogin.user.username})`);

// 7. Test wrong password
console.log('\n[Step 7] Testing invalid password rejection...');
const failLogin = loginUser('cyber_dan', 'wrongpassword');
if (failLogin.success) {
  console.error('❌ Should fail on wrong password');
  process.exit(1);
}
console.log(`✓ Correctly rejected invalid password: "${failLogin.error}"`);

console.log('\n======================================================');
console.log('🎉 ALL USER AUTHENTICATION & PROFILE TESTS PASSED!');
console.log('======================================================\n');
