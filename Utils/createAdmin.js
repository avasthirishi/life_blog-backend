// utils/createAdmin.js
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create default admin
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = new User({
      name: 'Administrator',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@lifeblog.com',
      username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
      password: hashedPassword,
      role: 'admin',
      bio: 'System Administrator'
    });

    await admin.save();
    
    console.log('✅ Default admin created successfully!');
    console.log('📧 Admin Email:', admin.email);
    console.log('👤 Admin Username:', admin.username);
    console.log('🔑 Admin Password:', adminPassword);
    console.log('⚠️  Please change the admin password after first login!');
    
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};