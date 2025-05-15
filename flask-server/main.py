# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import vision
import os
import base64
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Google Cloud credentials - make sure to set up authentication!
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/your/service-account-key.json"

@app.route('/process-receipt', methods=['POST'])
def process_receipt():
    try:
        # Get the base64 image from the request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_content = base64.b64decode(image_data)
        
        # Create Vision API client and process image
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_content)
        response = client.text_detection(image=image)
        
        if response.error.message:
            return jsonify({"error": response.error.message}), 500
        
        # Process text annotations
        full_text = response.text_annotations[0].description if response.text_annotations else ""
        print(full_text)
        
        # Extract order items (this is where you'd implement your UberEats receipt parsing logic)
        # For now, we'll just search for your menu items
        MAIN_OPTIONS = [
            "Steak Grilled Cheesy Burrito",
            "5 Layer Beef Burrito",
            "Beef Burrito",
            "Burrito Supreme",
            "Crunchwrap Supreme",
            "Doritos Gordita Crunch",
        ]
        SIDE_OPTIONS = [
            "Regular Fries",
            "Chips & Cheese",
            "Fries Supreme",
            "Nachos Supreme",
            "Chili Cheese Fries",
            "Cinnamon Twists",
        ]
        DRINK_OPTIONS = [
            "Mountain Dew Baja Blast",
            "Pepsi",
            "7 Up",
            "Diet Pepsi",
            "Mountain Dew",
            "Iced Tea",
        ]
        
        # Simple detection (would need to be more sophisticated for real receipts)
        detected_items = {
            "main": None,
            "side": None,
            "drink": None
        }
        
        for i, item in enumerate(MAIN_OPTIONS):
            if item.lower() in full_text.lower():
                detected_items["main"] = item
                break
                
        for i, item in enumerate(SIDE_OPTIONS):
            if item.lower() in full_text.lower():
                detected_items["side"] = item
                break
                
        for i, item in enumerate(DRINK_OPTIONS):
            if item.lower() in full_text.lower():
                detected_items["drink"] = item
                break
        print(detected_items)
        # Return processed data
        return jsonify({
            "success": True,
            "detected_items": detected_items,
            "full_text": full_text
        })

        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)