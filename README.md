# Presentation Script Generator

An AI-powered application that analyzes PDF and PowerPoint presentations and generates speaker scripts tailored to your needs.

## Overview

This application takes your presentation files and uses a local Llama AI model to:
- Extract and analyze content from PDF or PowerPoint files
- Generate appropriate speaker scripts with your specified duration and tone
- Focus on specific topics you want to emphasize

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python + FastAPI |
| Frontend | React + Vite |
| AI Model | Llama (local GGUF format) |
| PDF Processing | pdfplumber |
| PowerPoint | python-pptx |

## Quick Start

```bash
# Install backend dependencies
cd backend && pip install -r requirements.txt

# Download a Llama model
python download_model.py

# Start the backend server
python main.py

# Install frontend dependencies and run
cd ../frontend && npm install && npm run dev
```

Then open http://localhost:5173 in your browser.

## Features

- **Upload**: PDF and PowerPoint files
- **Configure**: Duration (3-30 min), tone, focus areas
- **Generate**: AI-powered script creation
- **Export**: Download as Markdown

## License

MIT
