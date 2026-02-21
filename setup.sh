#!/bin/bash
echo "🚛 FleetFlow Quick Setup (SQLite)"
echo "================================="

cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js

echo ""
echo "✅ Backend ready!"gt
echo ""
cd ../frontend
npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 To run (open 2 terminals):"
echo ""
echo "  Terminal 1: cd backend  && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo ""
echo "🔐 Login: manager@fleetflow.com / password123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
