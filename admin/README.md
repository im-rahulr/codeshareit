# CodeShareit Admin Panel

## 🍎 Apple-Inspired Admin Interface

A powerful, secure admin dashboard to manage your CodeShareit platform with beautiful Apple-inspired design.

---

## 🚀 Features

### Dashboard
- **Real-time Statistics**: View total codes, tokens, lines, and today's activity
- **Recent Activity Feed**: Monitor latest code submissions
- **Site Status Toggle**: Enable/disable 404 mode to show maintenance page to users
- **Beautiful Charts**: Visual representation of your platform's data

### Code Management
- **Search Functionality**: Search codes by share code, content, or token count
- **View Code Details**: Preview any code snippet with syntax highlighting
- **Token & Line Counter**: See tokens and lines for each code
- **Delete Codes**: Remove unwanted code snippets
- **Copy to Clipboard**: Quickly copy any code
- **Real-time Updates**: Refresh to see latest changes

### Settings
- **Change Credentials**: Update admin username and password
- **Database Info**: View Supabase connection details
- **Secure Authentication**: Protected admin access

### Site Control
- **404 Toggle**: Show custom 404 page to users while admin retains access
- **Admin Always Accessible**: Admin panel remains accessible even in offline mode

---

## 🔐 Default Credentials

**Username:** `admin`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

---

## 📋 Setup Instructions

### 1. Database Setup (Supabase)

You need to create the `admin_settings` table in your Supabase database:

```sql
CREATE TABLE admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    site_offline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin credentials
INSERT INTO admin_settings (username, password, site_offline)
VALUES ('admin', 'admin123', false);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is admin table)
CREATE POLICY "Allow all operations on admin_settings" 
ON admin_settings 
FOR ALL 
USING (true);
```

### 2. Access the Admin Panel

Navigate to: `http://yoursite.com/admin/`

### 3. First Login

1. Enter default credentials (admin / admin123)
2. Navigate to **Settings** tab
3. Update username and password
4. Save changes

---

## 🎯 How to Use

### Managing Codes

1. Go to **Code Management** tab
2. Use the search bar to find specific codes
3. Click **View** to see full code with details
4. Click **Copy** to copy code to clipboard
5. Click **Delete** to remove code (requires confirmation)

### Controlling Site Status

1. Go to **Dashboard** tab
2. Find "Site Status Control" section
3. Toggle the switch:
   - **OFF** (Green): Site is online and accessible to everyone
   - **ON** (Purple): Site shows 404 page to users (admin can still access)
4. Users will be redirected to a beautiful 404 maintenance page
5. Admin panel remains accessible at `/admin/`

### Updating Admin Credentials

1. Go to **Settings** tab
2. Enter new username
3. Enter new password (minimum 6 characters)
4. Confirm password
5. Click **Save Changes**
6. Use new credentials for next login

---

## 📊 Statistics Explained

- **Total Code Snippets**: Count of all codes in database
- **Total Tokens**: Sum of all tokens across all codes (words/identifiers)
- **Total Lines**: Sum of all lines of code
- **Today's Activity**: Number of codes added today

---

## 🎨 Design Features

- **Apple-inspired UI**: Clean, modern design following Apple's design principles
- **Smooth Animations**: Polished transitions and interactions
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Code Previews**: VS Code-style code display
- **Gradient Accents**: Beautiful purple gradients throughout
- **Card-based Layout**: Organized, easy-to-scan interface

---

## 🔒 Security Features

- **Session-based Authentication**: Credentials stored in localStorage
- **Password Protection**: Required for all admin actions
- **Confirmation Dialogs**: Delete actions require confirmation
- **Secure Database Access**: Uses Supabase Row Level Security
- **Admin-only Routes**: Protected pages redirect to login

---

## 🛠️ Technical Details

### Built With:
- **HTML5 & CSS3**: Modern semantic markup and styling
- **Vanilla JavaScript**: No framework dependencies
- **Supabase**: Backend database and real-time functionality
- **Apple Design Guidelines**: UI/UX inspiration

### Browser Support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

---

## 📱 Mobile Responsive

The admin panel is fully responsive and works on:
- 📱 Mobile phones (portrait & landscape)
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop monitors

---

## 🐛 Troubleshooting

### Can't Login?
1. Check if credentials are correct (default: admin/admin123)
2. Clear browser cache and localStorage
3. Verify Supabase connection in browser console

### Site Status Not Working?
1. Ensure `admin_settings` table exists in Supabase
2. Check browser console for errors
3. Verify Supabase policies allow read/write access

### Codes Not Loading?
1. Check `code_snippets` table exists
2. Verify Supabase URL and key in `config.js`
3. Check browser network tab for failed requests

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase database setup
3. Ensure all tables have correct policies

---

## 🎉 Enjoy Your Admin Panel!

You now have a powerful, beautiful admin interface to manage your CodeShareit platform. The Apple-inspired design makes administration a pleasure!

**Happy Coding! 🚀**
