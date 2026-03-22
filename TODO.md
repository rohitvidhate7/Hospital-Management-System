# CORS Fix - Admin Login
Status: 🔄 In Progress

## Steps
- [ ] 1. Update frontend axios baseURL to '/api' (use Vite proxy)
- [✅] 2. Reorder backend CORS middleware\n- [ ] 3. Restart servers (backend/frontend)\n  ```bash\n  cd backend && npm start  # T1\n  cd frontend && npm run dev  # T2\n  ```
- [ ] 4. Restart frontend: cd frontend && npm run dev  
- [ ] 5. Test admin login: admin@hospital.com / admin123
- [ ] 6. Verify Network tab shows /api/* requests (no CORS errors)

## Commands to run after edits
```bash
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend  
npm run dev
```

