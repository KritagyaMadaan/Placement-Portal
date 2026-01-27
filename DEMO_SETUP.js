/**
 * DEMO SETUP SCRIPT
 * Run this in the browser console to populate the database with sample data
 * This will help you test all the new features
 */

// Copy and paste this entire script into your browser console (F12)

console.log('🚀 Setting up NFSU Placement Portal Demo Data...');

// Sample Students with Resume Data
const sampleStudents = [
    {
        id: 'demo_s1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@nfsu.ac.in',
        password: 'NFSU1234Ab',
        rollNo: 'NFSU2024001',
        course: 'M.Sc',
        branch: 'M.Sc Cyber Security',
        year: 2024,
        cgpa: 9.2,
        backlogs: 0,
        skills: ['Python', 'Penetration Testing', 'Network Security', 'Cryptography'],
        certifications: ['CEH', 'CompTIA Security+', 'OSCP'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeFileName: 'Rahul_Sharma_Resume.pdf',
        resumeUploadedAt: '2026-01-20',
        isVerified: true,
        isBlacklisted: false
    },
    {
        id: 'demo_s2',
        name: 'Priya Patel',
        email: 'priya.patel@nfsu.ac.in',
        password: 'NFSU5678Cd',
        rollNo: 'NFSU2024002',
        course: 'M.Sc',
        branch: 'M.Sc Digital Forensics',
        year: 2024,
        cgpa: 8.8,
        backlogs: 0,
        skills: ['Digital Forensics', 'Malware Analysis', 'Incident Response', 'SIEM'],
        certifications: ['CHFI', 'EnCE', 'GCFA'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeFileName: 'Priya_Patel_Resume.pdf',
        resumeUploadedAt: '2026-01-22',
        isVerified: true,
        isBlacklisted: false
    },
    {
        id: 'demo_s3',
        name: 'Amit Kumar',
        email: 'amit.kumar@nfsu.ac.in',
        password: 'NFSU9012Ef',
        rollNo: 'NFSU2024003',
        course: 'B.Tech',
        branch: 'B.Tech Computer Science',
        year: 2025,
        cgpa: 9.5,
        backlogs: 0,
        skills: ['Java', 'Spring Boot', 'React', 'AWS', 'Docker'],
        certifications: ['AWS Solutions Architect', 'Oracle Java Certified'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeFileName: 'Amit_Kumar_Resume.pdf',
        resumeUploadedAt: '2026-01-25',
        isVerified: true,
        isBlacklisted: false
    },
    {
        id: 'demo_s4',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@nfsu.ac.in',
        password: 'NFSU3456Gh',
        rollNo: 'NFSU2024004',
        course: 'M.Sc',
        branch: 'M.Sc Forensic Science',
        year: 2024,
        cgpa: 8.5,
        backlogs: 1,
        skills: ['DNA Analysis', 'Toxicology', 'Crime Scene Investigation'],
        certifications: ['Forensic Science Certification'],
        isVerified: false,
        isBlacklisted: false
    }
];

// Sample Companies
const sampleCompanies = [
    {
        id: 'demo_c1',
        name: 'CyberTech Solutions',
        hrName: 'Rajesh Verma',
        hrEmail: 'hr@cybertech.com',
        password: 'company123',
        description: 'Leading cybersecurity firm specializing in threat intelligence and penetration testing',
        isApproved: true
    },
    {
        id: 'demo_c2',
        name: 'Digital Forensics India',
        hrName: 'Meera Singh',
        hrEmail: 'hr@digitalforensics.in',
        password: 'company456',
        description: 'Premier digital forensics and incident response company',
        isApproved: true
    },
    {
        id: 'demo_c3',
        name: 'TechCorp India',
        hrName: 'Vikram Malhotra',
        hrEmail: 'hr@techcorp.in',
        password: 'company789',
        description: 'Multinational IT services and consulting company',
        isApproved: false
    }
];

// Sample Placement Drives
const sampleDrives = [
    {
        id: 'demo_d1',
        companyId: 'demo_c1',
        role: 'Security Analyst',
        ctc: '₹8-10 LPA',
        minCgpa: 8.0,
        eligibleBranches: ['M.Sc Cyber Security', 'B.Tech Computer Science'],
        maxBacklogs: 0,
        deadline: '2026-02-15',
        description: 'Looking for talented security analysts to join our SOC team',
        rounds: ['Aptitude Test', 'Technical Interview', 'HR Round'],
        status: 'Open'
    },
    {
        id: 'demo_d2',
        companyId: 'demo_c2',
        role: 'Forensic Investigator',
        ctc: '₹7-9 LPA',
        minCgpa: 7.5,
        eligibleBranches: ['M.Sc Digital Forensics', 'M.Sc Forensic Science'],
        maxBacklogs: 1,
        deadline: '2026-02-20',
        description: 'Seeking digital forensics experts for our investigation team',
        rounds: ['Written Test', 'Technical Round', 'Case Study', 'HR Interview'],
        status: 'Open'
    }
];

// Sample Applications
const sampleApplications = [
    {
        id: 'demo_app1',
        studentId: 'demo_s1',
        driveId: 'demo_d1',
        status: 'Shortlisted',
        appliedAt: '2026-01-26T10:00:00Z',
        verified: true
    },
    {
        id: 'demo_app2',
        studentId: 'demo_s2',
        driveId: 'demo_d2',
        status: 'Applied',
        appliedAt: '2026-01-27T09:30:00Z',
        verified: true
    },
    {
        id: 'demo_app3',
        studentId: 'demo_s3',
        driveId: 'demo_d1',
        status: 'Technical Round',
        appliedAt: '2026-01-25T14:20:00Z',
        verified: true
    }
];

// Save to localStorage
try {
    localStorage.setItem('nfsu_students', JSON.stringify(sampleStudents));
    localStorage.setItem('nfsu_companies', JSON.stringify(sampleCompanies));
    localStorage.setItem('nfsu_drives', JSON.stringify(sampleDrives));
    localStorage.setItem('nfsu_applications', JSON.stringify(sampleApplications));

    console.log('✅ Demo data loaded successfully!');
    console.log('📊 Added:');
    console.log(`   - ${sampleStudents.length} students (with resumes)`);
    console.log(`   - ${sampleCompanies.length} companies`);
    console.log(`   - ${sampleDrives.length} placement drives`);
    console.log(`   - ${sampleApplications.length} applications`);
    console.log('');
    console.log('🔄 Please refresh the page to see the changes!');
    console.log('');
    console.log('📝 Test Credentials:');
    console.log('   Admin: Password = nfsu_123');
    console.log('   Student: rahul.sharma@nfsu.ac.in / NFSU1234Ab');
    console.log('   Company: hr@cybertech.com / company123');

} catch (error) {
    console.error('❌ Error loading demo data:', error);
}
