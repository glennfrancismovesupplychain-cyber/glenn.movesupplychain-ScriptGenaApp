"""Configuration settings for the Presentation Script Generator."""

import os
from dotenv import load_dotenv

load_dotenv()

# Llama model configuration
LLAMA_MODEL_PATH = os.getenv("LLAMA_MODEL_PATH", "./models/mistral-7b-instruct.Q4_K_M.gguf")
LLAMA_N_CTX = int(os.getenv("LLAMA_N_CTX", "4096"))
LLAMA_N_THREADS = int(os.getenv("LLAMA_N_THREADS", "4"))
LLAMA_N_GPU_LAYERS = int(os.getenv("LLAMA_N_GPU_LAYERS", "0"))

# API configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# File upload configuration
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "50 * 1024 * 1024"))  # 50MB
