# Custom Email/Password JWT Authentication Playbook

Custom email/password authentication with JWT tokens for FastAPI + React + MongoDB web apps.

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
```

## Step 2: API Testing
```
curl -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"admin@civicpulse.org","password":"admin123"}'
```