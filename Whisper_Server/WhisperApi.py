import os
import datetime
import whisper
from fastapi import FastAPI, UploadFile, Form, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from difflib import SequenceMatcher
import httpx
import google.generativeai as genai
import json
import uvicorn
from dotenv import load_dotenv  # Import dotenv
import motor.motor_asyncio
from bson import ObjectId
import smtplib
from email.mime.text import MIMEText

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = whisper.load_model("base")  # You can use "small", "medium", or "large"
# Load environment variables from .env file
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables or .env file.")
genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel("models/gemini-2.0-flash")

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = mongo_client["SkillSwap_h4b"]  # Change to your actual DB name

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    contents = await file.read()
    with open("temp.wav", "wb") as f:
        f.write(contents)
    result = model.transcribe("temp.wav")
    return {"text": result["text"]}

    # === /generate-milestones ===
class MilestoneRequest(BaseModel):
    titles: str
    description: str
    project_id: str  # Add project_id field

def add_days(days: int):
    return (datetime.datetime.now() + datetime.timedelta(days=days)).isoformat()

@app.post("/generate-milestones")
async def generate_milestones(preferences: MilestoneRequest):
    """
    Generate project milestones and task allocation using Gemini AI, similar to analyzeAndAllocateTask in task.js.
    """
    try:
        
        titles = preferences.titles

        prompt = (
            "You are an expert AI assistant specializing in project management and technical task analysis. "
            "Your role is to process the following task titles and description, and structure them for a project management system.\n\n"
            f"Task Titles: {', '.join(titles)}\n"
            f"Task Description: {preferences.description}\n\n"
            "You must output a valid, raw JSON object that conforms to the following schema:\n\n"
            "{\n"
            '  "projectSummary": {\n'
            '    "title": "A concise summary of the task title.",\n'
            '    "problem": "A brief description of the core problem to be solved.",\n'
            '    "objective": "The primary goal of completing this task."\n'
            "  },\n"
            '  "taskAllocation": {\n'
            '    "priority": "\'Low\', \'Medium\', \'High\', or \'Urgent\'",\n'
            '    "estimated_time_hours": "A numerical estimate of the hours required.",\n'
            '    "required_skills": ["An array of strings listing relevant technical skills."],\n'
            '    "suggested_assignee_profile": "A brief description of the ideal team member profile for this task."\n'
            "  },\n"
            '  "technicalNotes": {\n'
            '    "implementation_hints": ["A list of suggestions or steps for implementation."],\n'
            '    "resource_links": ["An array of relevant documentation or resource URLs."]\n'
            "  }\n"
            "}\n"
        )

        # --- Gemini AI call (make sure gemini_model is initialized) ---
        response = gemini_model.generate_content(prompt)

        if not hasattr(response, "text") or response.text is None:
            raise HTTPException(status_code=500, detail="Gemini API returned an invalid response.")

        milestones_data = response.text.strip()
        if not milestones_data:
            raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        # Remove markdown formatting if present
        sanitized_data = milestones_data.strip()
        if sanitized_data.startswith("```"):
            lines = sanitized_data.splitlines()
            sanitized_data = "\n".join(lines[1:-1])

        try:
            milestones = json.loads(sanitized_data)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON response: {str(e)}")

        # --- Compose response similar to analyzeAndAllocateTask in task.js ---
        # Map Gemini output to the expected structure
        summary = milestones.get("projectSummary", {}).get("title", "")
        priority = milestones.get("taskAllocation", {}).get("priority", "medium").lower()
        notes = milestones.get("technicalNotes", {}).get("implementation_hints", [])
        skills = milestones.get("taskAllocation", {}).get("required_skills", [])
        suggested_assignee_profile = milestones.get("taskAllocation", {}).get("suggested_assignee_profile", "")

        # --- MongoDB integration ---
        project_id = preferences.project_id  # You need to add this to MilestoneRequest!
        

        # 1. Find the project (use ObjectId for _id)
        try:
            project_obj_id = ObjectId(project_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid project_id format.")

        project = await db.Project.find_one({"_id": project_obj_id})
        print(f"Project found: {project}")
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

        # 2. Find members (not project manager)
        members_cursor = db.User.find({
            "_id": {"$in": project["members"]},
            "position": {"$ne": "project manager"}
        })
        members = await members_cursor.to_list(length=None)

        # 3. For each member, get task count and skill match
        members_with_task_counts = []
        for user in members:
            task_count = await db.Task.count_documents({"assignedTo": user["_id"]})
            has_matching_skill = (
                not skills or
                any(
                    user_skill.lower() in [s.lower() for s in skills]
                    for user_skill in user.get("skills", [])
                )
            )
            members_with_task_counts.append({
                "user": user,
                "taskCount": task_count,
                "hasMatchingSkill": has_matching_skill
            })

        # 4. Filter eligible users
        eligible_users = sorted(
            [entry for entry in members_with_task_counts if entry["taskCount"] < 3 and entry["hasMatchingSkill"]],
            key=lambda x: x["taskCount"]
        )

        assigned_user_entry = eligible_users[0] if eligible_users else None
        assigned_to_user = assigned_user_entry["user"] if assigned_user_entry else None
        assigned_to_user_id = assigned_to_user["_id"] if assigned_to_user else None

        if not assigned_to_user_id:
            raise HTTPException(status_code=400, detail="No eligible user found to assign this task.")

        # 5. Create the task
        task_doc = {
            "name": title,
            "description": description,
            "projectId": project_id,
            "summary": summary,
            "priority": priority,
            "notes": notes,
            "skills": skills,
            "assignedTo": assigned_to_user_id,
            "status": "pending"
        }
        await db.Task.insert_one(task_doc)

        result = {
            "summary": summary,
            "priority": priority,
            "notes": notes,
            "technical_skills": skills,
            "suggested_assignee_profile": suggested_assignee_profile,
            "milestones_raw": milestones  # Optionally include full AI output
        }

        return result

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-meeting-invitation")
async def send_meeting_invitation(
    email: str = Body(...),
    meetingDetails: dict = Body(...)
):
    """
    Send a meeting invitation email.
    meetingDetails should be a dict with keys: subject, date, time, location, agenda
    """
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

    if not EMAIL_USER or not EMAIL_PASSWORD:
        raise HTTPException(status_code=500, detail="Email credentials not set in environment variables.")

    subject = meetingDetails.get("subject", "Meeting Invitation")
    date = meetingDetails.get("date", "")
    time_ = meetingDetails.get("time", "")
    agenda = meetingDetails.get("agenda", "N/A")

    body = f"""You are invited to a meeting.

Date: {date}
Time: {time_}
Agenda: {agenda}

Please confirm your attendance.

Best regards,
The Team
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, [email], msg.as_string())
        return {"message": "Meeting invitation email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending meeting invitation email: {str(e)}")

@app.get("/print-db")
async def print_db():
    """
    Print all documents from Project, User, and Task collections for debugging.
    """
    projects = await db.Project.find().to_list(length=None)
    users = await db.User.find().to_list(length=None)
    tasks = await db.Task.find().to_list(length=None)
    return {
        "projects": projects,
        "users": users,
        "tasks": tasks
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6500)
