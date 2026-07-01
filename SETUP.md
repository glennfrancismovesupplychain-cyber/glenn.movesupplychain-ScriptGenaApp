# Presentation Script Generator - Setup Guide

## Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- pip package manager

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download a Llama model (approximately 4GB)
python download_model.py

# Or manually download a model from Hugging Face:
# https://huggingface.co/models?search=gguf
# Place it in ./models/ directory
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

The application uses a `.env` file in the backend directory:

```env
LLAMA_MODEL_PATH=./models/ggml-model-q4_k_m.gguf
LLAMA_N_CTX=4096
LLAMA_N_THREADS=4
LLAMA_N_GPU_LAYERS=0
HOST=0.0.0.0
PORT=8000
MAX_FILE_SIZE=52428800
```

### Model Selection

For best results, download one of these recommended models:
- **Mistral-7B-Instruct**: Good general-purpose model
- **Llama-2-7B-Chat**: Chat-optimized model
- **Phi-2**: Smaller, faster model for testing

## Usage

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

4. Upload your PDF or PowerPoint file and configure your script settings

5. Click "Generate Script" to create your presentation script

## Features

- **File Upload**: PDF and PowerPoint (.ppt, .pptx) support
- **Customizable Duration**: 3-30 minutes
- **Tone Selection**: Professional, Engaging, Casual, Persuasive, Educational, Storytelling
- **Focus Areas**: Specify which topics to emphasize
- **Local AI Processing**: No data leaves your machine
- **Download/Export**: Save scripts in Markdown format

## Troubleshooting

### Model Not Found
Make sure the model path in `.env` points to an existing GGUF format file.

### Slow Generation
- Increase `LLAMA_N_THREADS` if you have a multi-core CPU
- Use a smaller model (Q3_K_S, Q4_K_M)
- Reduce `LLAMA_N_CTX` if you have limited RAM

### Memory Issues
- Set `LLAMA_N_GPU_LAYERS=0` to use CPU only
- Reduce `LLAMA_N_CTX`
- Use a smaller model
