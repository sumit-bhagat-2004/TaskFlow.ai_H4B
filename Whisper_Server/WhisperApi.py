import os
import datetime
import whisper
from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from difflib import SequenceMatcher
import httpx
import google.generativeai as genai
import json
import uvicorn
from dotenv import load_dotenv  # Import dotenv

app = FastAPI()
model = whisper.load_model("base")  # You can use "small", "medium", or "large"

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

def add_days(days: int):
    return (datetime.datetime.now() + datetime.timedelta(days=days)).isoformat()

@app.post("/generate-milestones")
async def generate_milestones(preferences: MilestoneRequest):
    try:
        titles_str = ", ".join(preferences.titles)
        prompt = (
            "You are an expert AI assistant specializing in project management and technical task analysis. "
            "Your role is to process the following task titles and description, and structure them for a project management system.\n\n"
            f"Task Titles: {titles_str}\n"
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

        response = gemini_model.generate_content(prompt)

        # Check if the response has a `text` attribute and is not None
        if not hasattr(response, "text") or response.text is None:
            raise HTTPException(status_code=500, detail="Gemini API returned an invalid response.")

        milestones_data = response.text.strip()  # Strip leading/trailing whitespace
        print(type(milestones_data))  # Log the type of the response
        print("RAW GEMINI RESPONSE:\n", milestones_data)  # Log the raw response

        # Ensure the response is not empty
        if not milestones_data:
            raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        # Sanitize and validate JSON
        try:
            # Strip leading/trailing whitespace and remove Markdown formatting
            sanitized_data = milestones_data.strip()

            if sanitized_data.startswith("```"):
                lines = sanitized_data.splitlines()
                sanitized_data = "\n".join(lines[1:-1])  # Remove the ```json and ``` lines

            milestones = json.loads(sanitized_data)  # Now safe to parse
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON response: {str(e)}")

        return {"milestones": milestones}

    except HTTPException as e:
        # Re-raise HTTP exceptions to preserve their status codes
        raise e
    except Exception as e:
        # Catch all other exceptions and return a 500 error
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6500)
