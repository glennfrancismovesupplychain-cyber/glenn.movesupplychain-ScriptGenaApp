"""
Script to download a Llama model for local script generation.
"""

import os
import urllib.request
from pathlib import Path

# Default model URL - this is a small example model
# In production, you'd want to download from Hugging Face or similar
DEFAULT_MODEL_URL = "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf"

# Alternative: You can use Mistral-7B which is often better for text generation
ALTERNATIVE_MODEL_URL = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf"

MODEL_DIR = Path(__file__).parent / "models"


def download_model(model_url: str, model_name: str = "ggml-model-q4_k_m.gguf") -> str:
    """Download a GGUF format Llama model."""
    MODEL_DIR.mkdir(exist_ok=True)
    model_path = MODEL_DIR / model_name

    if model_path.exists():
        print(f"Model already exists at: {model_path}")
        return str(model_path)

    print(f"Downloading model from: {model_url}")
    print(f"This may take a while depending on your connection...")

    try:
        urllib.request.urlretrieve(model_url, model_path)
        print(f"Model downloaded successfully: {model_path}")
        return str(model_path)
    except Exception as e:
        print(f"Error downloading model: {e}")
        print(f"\nTo manually download a model:")
        print(f"1. Go to https://huggingface.co/models?search=gguf")
        print(f"2. Download a .gguf file (preferably Q4_K_M for balance of size/quality)")
        print(f"3. Place it in: {model_path}")
        print(f"4. Set LLAMA_MODEL_PATH environment variable to point to the file")
        return ""


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Download Llama model")
    parser.add_argument(
        "--url",
        default=ALTERNATIVE_MODEL_URL,
        help="URL to download the model from"
    )
    parser.add_argument(
        "--name",
        default="mistral-7b-instruct.Q4_K_M.gguf",
        help="Filename for the downloaded model"
    )

    args = parser.parse_args()

    model_path = download_model(args.url, args.name)

    if model_path:
        print(f"\nUpdate your .env file with:")
        print(f"LLAMA_MODEL_PATH={model_path}")


if __name__ == "__main__":
    main()
