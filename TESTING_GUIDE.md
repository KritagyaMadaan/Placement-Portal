# 🧪 TESTING GUIDE - NFSU Placement Portal

## ⚠️ IMPORTANT: How to See Email Notifications

The email system is working! Here's how to see the emails:

### Method 1: Browser Console (Recommended)
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Perform any action (add student, import CSV, approve company)
4. Look for messages starting with `📧 EMAIL SENT:`
5. You'll see the email details including recipient, subject, and preview

### Method 2: Check Sent Emails
1. Open browser console (F12)
2. Type: `EmailService.getSentEmails()`
3. Press Enter
4. You'll see all emails that have been sent

### Method 3: LocalStorage
1. Press F12 → Go to **Application** tab
2. Expand **Local Storage** → Click your site
3. Find key: `nfsu_sent_emails`
4. Click to view all sent emails in JSON format

---

## 🚀 QUICK START - Load Demo Data

### Step 1: Open the Application
1. Make sure `npm run dev` is running
2. Open `http://localhost:3000` in your browser

### Step 2: Load Sample Data
1. Press `F12` to open Developer Console
2. Open the file: `DEMO_SETUP.js`
3. **Copy the ENTIRE contents** of that file
4. **Paste into the Console** and press Enter
5. You should see: `✅ Demo data loaded successfully!`
6. **Refresh the page** (F5)

### Step 3: Login as Admin
- Go to Admin Login
- Password: `nfsu_123`
- You should now see students and companies!

---

## 📊 CSV/Excel Import Format

### ✅ CORRECT FORMAT

**CSV File Format:**
```csv
Name,Email,RollNo,CGPA,Branch
John Doe,john@nfsu.ac.in,NFSU001,9.5,M.Sc Cyber Security
Jane Smith,jane@nfsu.ac.in,NFSU002,8.8,M.Sc Digital Forensics
Raj Kumar,raj@nfsu.ac.in,NFSU003,8.0,B.Tech Computer Science
```

**Important Notes:**
- **NO SPACES** after commas (or minimal spaces)
- **5 columns**: Name, Email, RollNo, CGPA, Branch
- First line is header (optional - the system will handle it)
- Branch must match one of: `M.Sc Cyber Security`, `M.Sc Digital Forensics`, `M.Sc Forensic Science`, `B.Tech Computer Science`, `MBA Forensic Accounting`

### 📝 How to Create CSV File

#### Option 1: Using Excel
1. Create a new Excel file
2. Add columns: Name | Email | RollNo | CGPA | Branch
3. Fill in data (see example above)
4. **Save As** → Choose **CSV (Comma delimited) (*.csv)**
5. Upload this file in the portal

#### Option 2: Using Notepad
1. Open Notepad
2. Type the data exactly as shown above
3. Save as `students.csv` (make sure to select "All Files" in save dialog)
4. Upload this file

#### Option 3: Paste Directly
1. In the Import modal, click "Or paste raw data"
2. Paste this:
```
Rahul Sharma,rahul@nfsu.ac.in,NFSU101,9.2,M.Sc Cyber Security
Priya Patel,priya@nfsu.ac.in,NFSU102,8.8,M.Sc Digital Forensics
Amit Kumar,amit@nfsu.ac.in,NFSU103,9.5,B.Tech Computer Science
```
3. Click "Process Database Import"

---

## 🧪 Testing Each Feature

### 1. Email Automation ✅

#### Test: Add Single Student
1. Login as Admin (password: `nfsu_123`)
2. Go to Students tab
3. Click "Add Student"
4. Fill in details:
   - Name: Test Student
   - Roll No: TEST001
   - Email: test@nfsu.ac.in
   - CGPA: 8.5
   - Branch: M.Sc Cyber Security
5. Click "Create Record"
6. **Open Console (F12)** → You should see: `📧 EMAIL SENT: to: test@nfsu.ac.in`
7. Alert will say: "Student added successfully! Welcome email sent to test@nfsu.ac.in"

#### Test: CSV Import with Emails
1. Click "Import DB"
2. Paste this data:
```
Student One,student1@nfsu.ac.in,S001,8.5,M.Sc Cyber Security
Student Two,student2@nfsu.ac.in,S002,9.0,M.Sc Digital Forensics
```
3. Click "Process Database Import"
4. **Check Console** → You should see 2 email notifications
5. Alert will show: "Successfully imported 2 students! Welcome emails sent: 2/2"

#### Test: Company Approval Email
1. Go to "Approvals" tab
2. Click "Approve" on any pending company
3. **Check Console** → You should see company approval email
4. Alert confirms: "Company Approved! Automated emails sent..."

---

### 2. Clickable Records & Detailed Profiles ✅

#### Test: Student Profile
1. Go to "Students" tab
2. **Click anywhere on a student row** (or click the eye icon)
3. A detailed modal should open showing:
   - Student photo placeholder
   - Academic details
   - Skills & Certifications
   - **Resume section** (if student has uploaded)
   - Application history
4. Try clicking "View" or "Download" on resume (if available)

#### Test: Company Profile
1. Go to "Companies" tab
2. **Click anywhere on a company row** (or click the eye icon)
3. A detailed modal should open showing:
   - Company logo placeholder
   - Company details
   - HR contact info
   - Statistics (drives, applications, selections)
   - All placement drives
   - Recent applications

---

### 3. Resume Viewer ✅

#### Why Resume Might Not Show:
The resume viewer only works if:
1. Student has uploaded a resume, OR
2. You loaded the demo data (which includes sample resume URLs)

#### How to Test:
1. **Load demo data first** (see Quick Start above)
2. Login as Admin
3. Go to Students tab
4. Click on "Rahul Sharma" or "Priya Patel" (demo students)
5. In the modal, scroll to "Resume" section
6. You should see:
   - Resume filename
   - Upload date
   - "View" button (opens in new tab)
   - "Download" button

#### To Add Resume to Existing Student:
1. Login as that student
2. Go to Profile
3. Upload a PDF file (max 2MB)
4. Click "Save Profile Changes"
5. Now admin can see the resume

---

### 4. Companies Tab ✅

#### Why Companies Tab Might Be Empty:
- No companies registered yet
- Need to load demo data OR register a company

#### How to Test:
1. **Load demo data** (see Quick Start)
2. Login as Admin
3. Click "Companies" tab (should be visible now)
4. You should see:
   - CyberTech Solutions
   - Digital Forensics India
   - TechCorp India
5. Try:
   - Searching companies
   - Clicking on a row
   - Viewing company details

---

## 📋 Sample Test Data

### Sample CSV for Import:
```csv
Rajesh Kumar,rajesh@nfsu.ac.in,NFSU201,8.7,M.Sc Cyber Security
Anita Desai,anita@nfsu.ac.in,NFSU202,9.1,M.Sc Digital Forensics
Vikram Singh,vikram@nfsu.ac.in,NFSU203,8.3,B.Tech Computer Science
Pooja Sharma,pooja@nfsu.ac.in,NFSU204,8.9,M.Sc Forensic Science
Arjun Reddy,arjun@nfsu.ac.in,NFSU205,9.3,MBA Forensic Accounting
```

Save this as `test_students.csv` and upload it!

---

## 🐛 Troubleshooting

### Issue: "No companies found"
**Solution**: 
1. Load demo data (see Quick Start)
2. OR register a company via Company Registration page

### Issue: "Resume not showing"
**Solution**:
1. Load demo data (students have sample resumes)
2. OR login as student and upload a PDF resume

### Issue: "Not seeing emails"
**Solution**:
1. Open browser console (F12)
2. Emails are logged there with 📧 icon
3. Type `EmailService.getSentEmails()` to see all emails

### Issue: "CSV import not working"
**Solution**:
1. Check format: `Name,Email,RollNo,CGPA,Branch`
2. No extra spaces
3. Branch name must match exactly
4. Check console for errors

### Issue: "Companies tab not visible"
**Solution**:
1. Make sure you're on Admin Dashboard
2. Tab should be between "Students" and "Verifications"
3. Refresh page if needed

---

## ✅ Success Checklist

After loading demo data, you should be able to:
- [ ] See 4 students in Students tab
- [ ] See 3 companies in Companies tab
- [ ] Click any student row to see detailed profile
- [ ] Click any company row to see company details
- [ ] See resume info for Rahul, Priya, and Amit
- [ ] Import CSV and see welcome emails in console
- [ ] Add single student and see email in console
- [ ] Approve company and see email in console

---

## 🎯 Next Steps

1. **Load the demo data** using DEMO_SETUP.js
2. **Test each feature** using this guide
3. **Import your own CSV** using the correct format
4. **Check console** to see email notifications

---

**Need Help?**
- Check browser console for errors (F12)
- Make sure demo data is loaded
- Verify CSV format matches exactly
- Ensure dev server is running (`npm run dev`)
