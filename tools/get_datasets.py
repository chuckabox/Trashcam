"""
TACO (Trash Annotations in Context) Dataset Downloader
This script helps download and setup the TACO dataset for YOLO fine-tuning.
"""

import os
import sys

def main():
    print("Setting up dataset directories...")
    os.makedirs("datasets/taco/images", exist_ok=True)
    os.makedirs("datasets/taco/labels", exist_ok=True)
    
    print("To download the full TACO dataset, please run:")
    print("git clone https://github.com/pedropro/TACO.git")
    print("cd TACO")
    print("python download.py")
    
    print("\nAfter downloading, you will need to convert the COCO annotations to YOLO format.")
    print("You can use the 'ultralytics' python package to train your model:")
    print("\nfrom ultralytics import YOLO")
    print("model = YOLO('yolov8n.pt')")
    print("results = model.train(data='datasets/taco.yaml', epochs=50, imgsz=640)")
    
    # Create a template yaml file for YOLO
    yaml_content = """
path: ./datasets/taco
train: images/train
val: images/val

names:
  0: recyclable
  1: waste
  2: unknown
"""
    with open("datasets/taco.yaml", "w") as f:
        f.write(yaml_content.strip())
        
    print("\nCreated datasets/taco.yaml template for YOLO training.")

if __name__ == "__main__":
    main()
