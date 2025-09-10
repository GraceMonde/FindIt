const admin = require('firebase-admin');
const serviceAccount = require('./findit-910-firebase-adminsdk-fbsvc-5bf0119a1f.json');

// Test Firebase Connection
async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "findit-910.firebasestorage.app"
    });
    
    console.log('✅ Firebase initialized successfully');
    
    // Test Firestore
    const db = admin.firestore();
    console.log('🔍 Testing Firestore connection...');
    
    // Try to read from the 'users' collection
    const usersRef = db.collection('users');
    const snapshot = await usersRef.limit(1).get();
    
    if (snapshot.empty) {
      console.log('⚠️ Firestore connected but no users found (this is normal for a new database)');
    } else {
      console.log('✅ Firestore connected successfully');
      console.log(`📊 Found ${snapshot.size} user(s) in the database`);
    }
    
    // Test Firebase Storage
    console.log('🪣 Testing Firebase Storage connection...');
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ maxResults: 1 });
    
    if (files.length === 0) {
      console.log('⚠️ Storage connected but no files found (this is normal for a new storage bucket)');
    } else {
      console.log('✅ Firebase Storage connected successfully');
      console.log(`📁 Found ${files.length} file(s) in the storage bucket`);
    }
    
    // Test Authentication
    console.log('🔐 Testing Firebase Authentication...');
    const auth = admin.auth();
    const listUsersResult = await auth.listUsers(1);
    
    if (listUsersResult.users.length === 0) {
      console.log('⚠️ Authentication connected but no users found (this is normal for a new project)');
    } else {
      console.log('✅ Firebase Authentication connected successfully');
      console.log(`👤 Found ${listUsersResult.users.length} user(s) in authentication`);
    }
    
    console.log('\n🎉 All Firebase services are working correctly!');
    
    // Clean up
    await admin.app().delete();
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    } else {
      console.log('\n❌ Test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error during test:', error);
    process.exit(1);
  });