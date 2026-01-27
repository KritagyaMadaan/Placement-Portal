/**
 * CHECK ACCOUNTS SCRIPT
 * Run this in browser console to see all created student accounts
 */

console.log('🔍 Checking Student Accounts...\n');

// Get all students from localStorage
const students = JSON.parse(localStorage.getItem('nfsu_students') || '[]');

if (students.length === 0) {
    console.log('❌ No students found in database!');
    console.log('💡 Try importing CSV first, then run this script again.');
} else {
    console.log(`✅ Found ${students.length} student accounts:\n`);

    console.table(students.map(s => ({
        Name: s.name,
        Email: s.email,
        Password: s.password,
        RollNo: s.rollNo,
        CGPA: s.cgpa,
        Branch: s.branch,
        Verified: s.isVerified ? '✅' : '❌'
    })));

    console.log('\n📋 Login Credentials:');
    students.forEach((s, i) => {
        console.log(`${i + 1}. Email: ${s.email} | Password: ${s.password}`);
    });
}

// Check sent emails
const emails = JSON.parse(localStorage.getItem('nfsu_sent_emails') || '[]');
console.log(`\n📧 Total emails sent: ${emails.length}`);
if (emails.length > 0) {
    console.log('Latest emails:');
    emails.slice(-5).forEach(e => {
        console.log(`  → To: ${e.to} | Subject: ${e.subject}`);
    });
}
