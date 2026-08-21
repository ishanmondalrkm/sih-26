import uuid
from datetime import datetime, timezone, timedelta
from auth import hash_password

INITIAL_DEPARTMENTS = [
    {
        "id": "dept-roads",
        "name": "Roads & Public Works Department",
        "code": "PWD-RD",
        "head_officer": "Er. S. Natarajan",
        "contact_phone": "+91 80 2297 5001",
        "active_workforce": 48,
        "sla_hours": 48,
        "icon": "Hammer"
    },
    {
        "id": "dept-water",
        "name": "Water Supply & Sewerage Board",
        "code": "BWSSB",
        "head_officer": "Er. Meera Hegde",
        "contact_phone": "+91 80 2297 5002",
        "active_workforce": 62,
        "sla_hours": 24,
        "icon": "Droplets"
    },
    {
        "id": "dept-sanitation",
        "name": "Sanitation & Solid Waste Management",
        "code": "BBMP-SWM",
        "head_officer": "Dr. Pradeep Varma",
        "contact_phone": "+91 80 2297 5003",
        "active_workforce": 120,
        "sla_hours": 12,
        "icon": "Trash2"
    },
    {
        "id": "dept-electrical",
        "name": "Electrical & Streetlighting Division",
        "code": "BESCOM-SL",
        "head_officer": "Er. Arvind Kulkarni",
        "contact_phone": "+91 80 2297 5004",
        "active_workforce": 35,
        "sla_hours": 24,
        "icon": "Lightbulb"
    },
    {
        "id": "dept-drainage",
        "name": "Drainage & Flood Management Wing",
        "code": "DFM-SWD",
        "head_officer": "Er. Rajeshwari Devi",
        "contact_phone": "+91 80 2297 5005",
        "active_workforce": 54,
        "sla_hours": 36,
        "icon": "Waves"
    },
    {
        "id": "dept-infra",
        "name": "Town Planning & Public Infrastructure",
        "code": "TP-INFRA",
        "head_officer": "Chief Architect Vikram Sen",
        "contact_phone": "+91 80 2297 5006",
        "active_workforce": 28,
        "sla_hours": 72,
        "icon": "Building2"
    }
]

INITIAL_WARDS = [
    {"id": "ward-12", "name": "Ward 12 - Indiranagar", "zone": "East", "lat": 12.9784, "lng": 77.6408, "officer": "K. Srinivas"},
    {"id": "ward-15", "name": "Ward 15 - Koramangala", "zone": "South", "lat": 12.9352, "lng": 77.6245, "officer": "R. Deepa"},
    {"id": "ward-08", "name": "Ward 08 - Malleshwaram", "zone": "West", "lat": 13.0031, "lng": 77.5643, "officer": "T. Murthy"},
    {"id": "ward-22", "name": "Ward 22 - Whitefield", "zone": "Mahadevapura", "lat": 12.9698, "lng": 77.7500, "officer": "B. Manoj"},
    {"id": "ward-05", "name": "Ward 05 - Jayanagar", "zone": "South", "lat": 12.9308, "lng": 77.5838, "officer": "S. Kavitha"},
    {"id": "ward-19", "name": "Ward 19 - HSR Layout", "zone": "Bommanahalli", "lat": 12.9121, "lng": 77.6446, "officer": "N. Harish"}
]

async def seed_database(db):
    for dept in INITIAL_DEPARTMENTS:
        await db.departments.update_one({"id": dept["id"]}, {"$set": dept}, upsert=True)

    for ward in INITIAL_WARDS:
        await db.wards.update_one({"id": ward["id"]}, {"$set": ward}, upsert=True)

    admin_user = {
        "id": "usr-admin-01",
        "name": "Director Anjali Rao",
        "email": "admin@civicpulse.org",
        "mobile": "9899001122",
        "role": "admin",
        "department": "Municipal Grievance Cell",
        "badge_id": "ADM-7749",
        "password_hash": hash_password("admin123"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.update_one({"email": admin_user["email"]}, {"$set": admin_user}, upsert=True)

    citizen_user = {
        "id": "usr-citizen-01",
        "name": "Ramesh Sharma",
        "email": "citizen@civicpulse.org",
        "mobile": "9876543210",
        "role": "citizen",
        "ward": "Ward 12 - Indiranagar",
        "address": "45/2 100 Feet Rd, HAL 2nd Stage, Bangalore",
        "password_hash": hash_password("citizen123"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.update_one({"email": citizen_user["email"]}, {"$set": citizen_user}, upsert=True)

    dev_user = {
        "id": "usr-dev-01",
        "name": "System Diagnostic Lead",
        "email": "dev@civicpulse.org",
        "mobile": "9900112233",
        "role": "developer",
        "department": "CivicPulse Technical Operations",
        "badge_id": "SYS-900",
        "password_hash": hash_password("dev123"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.update_one({"email": dev_user["email"]}, {"$set": dev_user}, upsert=True)

    count = await db.complaints.count_documents({})
    if count < 4:
        now = datetime.now(timezone.utc)
        initial_complaints = [
            {
                "id": str(uuid.uuid4()),
                "complaint_number": "CP-1092",
                "user_id": citizen_user["id"],
                "citizen_name": "Ramesh S.",
                "category": "Roads",
                "priority": "High",
                "status": "IN PROGRESS",
                "title": "Major road damage & deep craters near 12th Main junction",
                "description": "हमारे रास्ते पर बहुत बड़ा गड्ढा हो गया है, रात में गाड़ियां फिसल रही हैं। Urgent repair needed.",
                "original_language": "Hindi",
                "translated_description": "There is a massive road crater near 12th Main junction causing vehicles to slip at night. Urgent asphalt resurfacing required.",
                "assigned_department": "Roads & Public Works Department",
                "assigned_officer": "Er. S. Natarajan",
                "location": {
                    "latitude": 12.9784,
                    "longitude": 77.6408,
                    "address": "12th Main Rd, Indiranagar, Bangalore",
                    "ward": "Ward 12 - Indiranagar"
                },
                "photo_url": "https://images.pexels.com/photos/6018646/pexels-photo-6018646.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "is_duplicate": False,
                "duplicate_count": 3,
                "status_history": [
                    {"status": "PENDING", "changed_by": "System (Citizen Submission)", "timestamp": (now - timedelta(days=2)).isoformat(), "remarks": "Complaint registered via Mobile Portal"},
                    {"status": "ASSIGNED", "changed_by": "Director Anjali Rao", "timestamp": (now - timedelta(days=1, hours=18)).isoformat(), "remarks": "Routed to Roads PWD Division A"},
                    {"status": "IN PROGRESS", "changed_by": "Er. S. Natarajan", "timestamp": (now - timedelta(hours=14)).isoformat(), "remarks": "Road inspection team dispatched with asphalt mixing unit."}
                ],
                "internal_notes": "Contractor assigned under work order #PWD-2026-881. Work scheduled for completion tonight.",
                "created_at": (now - timedelta(days=2)).isoformat(),
                "updated_at": (now - timedelta(hours=14)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "complaint_number": "CP-1087",
                "user_id": citizen_user["id"],
                "citizen_name": "Ramesh S.",
                "category": "Water Supply",
                "priority": "High",
                "status": "PENDING",
                "title": "Water pipeline leakage causing massive clean water waste",
                "description": "Main distribution pipe is gushing drinking water across the footpath since this morning.",
                "original_language": "English",
                "translated_description": "Main distribution pipe is gushing drinking water across the footpath since this morning.",
                "assigned_department": "Water Supply & Sewerage Board",
                "assigned_officer": "Er. Meera Hegde",
                "location": {
                    "latitude": 12.9352,
                    "longitude": 77.6245,
                    "address": "5th Block, Koramangala 80 Feet Road",
                    "ward": "Ward 15 - Koramangala"
                },
                "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHBpcGUlMjBsZWFrYWdlfGVufDB8fHx8MTc4NzI4ODAwMHww&ixlib=rb-4.1.0&q=85",
                "is_duplicate": False,
                "duplicate_count": 1,
                "status_history": [
                    {"status": "PENDING", "changed_by": "System (Citizen Submission)", "timestamp": (now - timedelta(hours=8)).isoformat(), "remarks": "Complaint filed with high priority tag"}
                ],
                "internal_notes": "Valve isolation crew notified for inspection.",
                "created_at": (now - timedelta(hours=8)).isoformat(),
                "updated_at": (now - timedelta(hours=8)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "complaint_number": "CP-1079",
                "user_id": citizen_user["id"],
                "citizen_name": "Ramesh S.",
                "category": "Streetlights",
                "priority": "High",
                "status": "RESOLVED",
                "title": "Dangerous street light failure with loose hanging wires",
                "description": "আমাদের রাস্তার বাতি একদম বন্ধ এবং তার ঝুলছে।",
                "original_language": "Bengali",
                "translated_description": "Street light pole on 4th Cross has failed completely with loose electrical wires exposed.",
                "assigned_department": "Electrical & Streetlighting Division",
                "assigned_officer": "Er. Arvind Kulkarni",
                "location": {
                    "latitude": 13.0031,
                    "longitude": 77.5643,
                    "address": "4th Cross, Malleshwaram West",
                    "ward": "Ward 08 - Malleshwaram"
                },
                "photo_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxzdHJlZXRsaWdodCUyMG5pZ2h0fGVufDB8fHx8MTc4NzI4ODAwMHww&ixlib=rb-4.1.0&q=85",
                "is_duplicate": False,
                "duplicate_count": 0,
                "status_history": [
                    {"status": "PENDING", "changed_by": "System", "timestamp": (now - timedelta(days=4)).isoformat(), "remarks": "Submitted with photo evidence"},
                    {"status": "ASSIGNED", "changed_by": "Admin Desk", "timestamp": (now - timedelta(days=3, hours=20)).isoformat(), "remarks": "Assigned to Lineman Team 4"},
                    {"status": "IN PROGRESS", "changed_by": "Er. Arvind Kulkarni", "timestamp": (now - timedelta(days=2)).isoformat(), "remarks": "Replacing LED luminaire and fixing insulation"},
                    {"status": "RESOLVED", "changed_by": "Er. Arvind Kulkarni", "timestamp": (now - timedelta(days=1)).isoformat(), "remarks": "Streetlight restored. Citizen safety verification completed."}
                ],
                "internal_notes": "Replaced 120W LED fitting and re-anchored junction box.",
                "created_at": (now - timedelta(days=4)).isoformat(),
                "updated_at": (now - timedelta(days=1)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "complaint_number": "CP-1065",
                "user_id": citizen_user["id"],
                "citizen_name": "Ramesh S.",
                "category": "Garbage",
                "priority": "Medium",
                "status": "RESOLVED",
                "title": "Unattended municipal garbage dump on street corner",
                "description": "Solid waste overflow blocking pedestrian walkway and creating severe foul odor.",
                "original_language": "English",
                "translated_description": "Solid waste overflow blocking pedestrian walkway and creating severe foul odor.",
                "assigned_department": "Sanitation & Solid Waste Management",
                "assigned_officer": "Dr. Pradeep Varma",
                "location": {
                    "latitude": 12.9121,
                    "longitude": 77.6446,
                    "address": "Sector 2, HSR Layout Main Road",
                    "ward": "Ward 19 - HSR Layout"
                },
                "photo_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxnYXJiYWdlJTIwYmlufGVufDB8fHx8MTc4NzI4ODAwMHww&ixlib=rb-4.1.0&q=85",
                "is_duplicate": False,
                "duplicate_count": 0,
                "status_history": [
                    {"status": "PENDING", "changed_by": "System", "timestamp": (now - timedelta(days=5)).isoformat(), "remarks": "Garbage pickup requested"},
                    {"status": "IN PROGRESS", "changed_by": "Sanitation Inspector", "timestamp": (now - timedelta(days=4)).isoformat(), "remarks": "Tipper truck deployed"},
                    {"status": "RESOLVED", "changed_by": "Dr. Pradeep Varma", "timestamp": (now - timedelta(days=3)).isoformat(), "remarks": "Site cleared and disinfected with lime powder"}
                ],
                "internal_notes": "Dustbin capacity upgraded from 1.1m3 to 2.4m3.",
                "created_at": (now - timedelta(days=5)).isoformat(),
                "updated_at": (now - timedelta(days=3)).isoformat()
            }
        ]

        for comp in initial_complaints:
            await db.complaints.update_one({"complaint_number": comp["complaint_number"]}, {"$set": comp}, upsert=True)

        notifications = [
            {
                "id": str(uuid.uuid4()),
                "user_id": citizen_user["id"],
                "complaint_number": "CP-1092",
                "title": "Complaint Status: IN PROGRESS",
                "message": "Your complaint CP-1092 for Road Damage has been taken up by Roads & Public Works Department.",
                "type": "status_update",
                "read": False,
                "created_at": (now - timedelta(hours=14)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": citizen_user["id"],
                "complaint_number": "CP-1079",
                "title": "Complaint RESOLVED",
                "message": "Streetlight issue CP-1079 has been successfully resolved and inspected.",
                "type": "resolution",
                "read": True,
                "created_at": (now - timedelta(days=1)).isoformat()
            }
        ]
        for notif in notifications:
            await db.notifications.insert_one(notif)