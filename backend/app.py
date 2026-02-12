from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
from plyer import notification
#import pandas as pd
import csv
import os

logging.basicConfig(
    filename='backend/system_activity.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
CORS(app) # This allows your frontend to communicate with this backend

def save_to_csv(data):

    if data.get('form_type') == 'pickup':
        CSV_FILE = 'backend/data/pickup.csv'
    else:
        CSV_FILE = 'backend/data/delivery.csv'
    # Check if file exists to determine if we need to write the header
    file_exists = os.path.isfile(CSV_FILE)
    
    # Define the order of the columns (must match your JS keys)
    fieldnames = list(data.keys())



    # 'a' means append mode (adds to the end without deleting old data)
    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        # Write the header only once
        if not file_exists:
            writer.writeheader()
            
        writer.writerow(data)

@app.route('/submit', methods=['POST', 'GET'])
def handle_form():


    # Get the JSON data sent from the HTML form
    try:
        data = request.json
        save_to_csv(data) # Save the data!
        logging.info(f"ENTRY SAVED for {data.get('form_type')}: Company: {data.get('company')}")
        print(f"Success! Entry saved for: {data.get('form_type')}")
        if data.get('form_type') == 'pickup':
            form_type = data.get('form_type', 'unknown')
            user_name = data.get('name') or data.get('driver_name') or "A visitor"
            truck_temp = data.get('truck_temp') 
            po_number = data.get('po_number') 
            try:
                notification.notify(
                    title= f"{form_type} form Completed!",
                    message=f"Temperature: {truck_temp} \t PO: {po_number}",
                    app_name="Logistics Kiosk",
                    timeout=10 # Stays visible for 10 seconds
                )

            except Exception as e:
                print(f"Could not trigger Windows notification: {e}")
        return jsonify({"status": "success", "message": "Thank you, Sign in Complete!"}), 200
    except Exception as e:
        logging.error(f"SYSTEM ERROR: {str(e)}")
        print(f"Error saving data: {e}")
        return jsonify({"status": "error", "message": "Server error"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)