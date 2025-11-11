# Owner Login Credentials

## Default Owner Account

**Email:** `owner@goldlink.com`  
**Default Password:** `Owner@GoldLink2024`

## How to Login as Owner

### For Local Development:
1. Go to the login page: `http://localhost:3000/auth/login`
2. Click the "Owner Login" button at the bottom of the form
3. The email field will auto-fill with `owner@goldlink.com`
4. Enter the default password: `Owner@GoldLink2024`
5. Click "Sign In"

### For Production/Deployment:
1. Go to your deployed app: `https://your-app.onrender.com/auth/login`
2. Click the "Owner Login" button at the bottom of the form
3. The email field will auto-fill with `owner@goldlink.com`
4. Enter the default password: `Owner@GoldLink2024`
5. Click "Sign In"

**Note:** If owner login fails, the owner account may not exist in the production database. You can initialize it by calling:
- `GET https://your-app.onrender.com/api/owner/init` - Check if owner exists
- `POST https://your-app.onrender.com/api/owner/init` - Create owner account

## Owner Profile Settings

After logging in as owner, you can:
1. Go to Owner Dashboard
2. Click "Profile Settings" button in the top right
3. Update:
   - Owner Name
   - Company Name
   - Company Address
   - Company Ranks & Certifications
   - Quality Standards
   - Achievements & Awards

## Change Owner Password

1. Login as owner
2. Go to Owner Dashboard
3. Click "Change Password" button in the top right
4. Enter current password and new password
5. Click "Change Password"

**Note:** The owner account is automatically created on first login attempt if it doesn't exist.

## Important

- Only one owner account exists in the system
- Owner registration is disabled - only customers can register
- The owner account email is fixed: `owner@goldlink.com`
- After changing the password, use the new password for future logins
- Interest rate is fixed at 0.8% for all loans
- **For Production:** If login fails, ensure the database is properly initialized and the owner account exists

