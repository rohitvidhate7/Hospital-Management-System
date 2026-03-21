# Hospital Admin Dashboard Fix - Doctors/Patients Not Showing

Status: 🛠️ In Progress (09/2024)

## Root Cause Analysis ✅
- Backend routes already allow admin (authorize(['admin', 'receptionist']))
- Controller filters `status` field but schema uses `availability.status`
- Dashboard sends `?status=Available` → no matches
- Fix: Backend filter on nested `availability.status`

## Implementation Steps

### 1. [x] Create this TODO.md
### 2. [ ] Fix Backend Doctor Controller 
  - `controllers/doctorController.js`: Filter `{ 'availability.status': status }`
  - Support `limit` param (already does)
### 3. [ ] Verify Patient Controller (if needed)
  - `controllers/patientController.js`: Check status filtering
### 4. [ ] Update Frontend Dashboard Params
  - `Dashboard.jsx`: Send `availabilityStatus=Available` OR backend handles both
### 5. [ ] Test Flow
  ```
  cd hospital-management-system/backend && npm run dev
  cd ../frontend && npm run dev
  Login: admin@hospital.com / admin123
  Check dashboard doctors/patients preview sections
  ```
### 6. [ ] Seed Demo Data (if empty)
  ```
  cd backend
  node seed.js
  ```

## Expected Result
- Admin dashboard ✅ Doctors preview shows 4 available doctors
- Admin dashboard ✅ Recent patients preview
- DoctorList/PatientList pages work for admin
- Console logs show successful API responses

## Quick Debug Commands
```bash
# Backend logs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/doctors?limit=4&amp;status=Available

# Check token
console.log(localStorage.getItem('authState'))
```

