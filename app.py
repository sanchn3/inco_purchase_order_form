from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import logging
from datetime import datetime
from dateutil.relativedelta import relativedelta
from plyer import notification
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
#import pandas as pd
import csv
import os
import shutil

PICKUP_FIELDS   = ['form_type', 'date', 'driver_name', 'phone', 'company', 'po_number', 'truck_temp', 'cleanliness', 'time']
DELIVERY_FIELDS = ['form_type', 'visitor_name', 'company', 'host_person', 'entry_time', 'exit_time']


def read_csv_as_dicts(filepath, fieldnames):
    if not os.path.isfile(filepath):
        return []
    rows = []
    with open(filepath, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if not any(cell.strip() for cell in row):
                continue  # skip blank lines
            d = {fn: (row[j] if j < len(row) else '') for j, fn in enumerate(fieldnames)}
            d['_row_index'] = i
            rows.append(d)
    return rows


def write_csv(filepath, rows, fieldnames):
    with open(filepath, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for row in rows:
            writer.writerow([row.get(fn, '') for fn in fieldnames])


logging.basicConfig(
    filename='logs/system_activity.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
CORS(app) # This allows your frontend to communicate with this backend

@app.route('/')
def index():
    return render_template('landing.html')

@app.route('/pickup')
def pickup_page():
    return render_template('pickup.html')

@app.route('/visitor')
def visitor_page():
    return render_template('delivery_visitor.html')


# --- Admin routes ---

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

@app.route('/admin/data')
def admin_data():
    pickup   = read_csv_as_dicts('data/pickup.csv',   PICKUP_FIELDS)
    delivery = read_csv_as_dicts('data/delivery.csv', DELIVERY_FIELDS)
    return jsonify({'pickup': pickup, 'delivery': delivery})

@app.route('/admin/edit', methods=['POST'])
def admin_edit():
    try:
        body      = request.json
        file_key  = body['file']        # 'pickup' or 'delivery'
        row_index = int(body['row_index'])
        field     = body['field']
        value     = body['value']

        if file_key == 'pickup':
            filepath, fieldnames = 'data/pickup.csv', PICKUP_FIELDS
        else:
            filepath, fieldnames = 'data/delivery.csv', DELIVERY_FIELDS

        rows = read_csv_as_dicts(filepath, fieldnames)
        for row in rows:
            if row['_row_index'] == row_index:
                row[field] = value
                break

        write_csv(filepath, rows, fieldnames)
        logging.info(f"ADMIN EDIT: {file_key} row {row_index} field '{field}' = '{value}'")
        return jsonify({'status': 'success'})
    except Exception as e:
        logging.error(f"ADMIN EDIT ERROR: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/admin/export/<file_key>')
def admin_export(file_key):
    if file_key == 'pickup':
        filepath, filename = 'data/pickup.csv', 'pickup.csv'
    elif file_key == 'delivery':
        filepath, filename = 'data/delivery.csv', 'delivery.csv'
    else:
        return jsonify({'status': 'error', 'message': 'Unknown file'}), 400
    return send_file(filepath, mimetype='text/csv', as_attachment=True, download_name=filename)

@app.route('/admin/delete', methods=['POST'])
def admin_delete():
    try:
        body      = request.json
        file_key  = body['file']
        row_index = int(body['row_index'])

        if file_key == 'pickup':
            filepath, fieldnames = 'data/pickup.csv', PICKUP_FIELDS
        else:
            filepath, fieldnames = 'data/delivery.csv', DELIVERY_FIELDS

        rows = read_csv_as_dicts(filepath, fieldnames)
        rows = [r for r in rows if r['_row_index'] != row_index]
        write_csv(filepath, rows, fieldnames)
        logging.info(f"ADMIN DELETE: {file_key} row {row_index}")
        return jsonify({'status': 'success'})
    except Exception as e:
        logging.error(f"ADMIN DELETE ERROR: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


def save_to_csv(data):

    if data.get('form_type') == 'pickup':
        CSV_FILE = 'data/pickup.csv'
    else:
        CSV_FILE = 'data/delivery.csv'
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


def archive_and_clear_csvs():
    """Runs on the 1st of every month: copies CSVs to data/archives/ then clears them."""
    archive_dir = 'data/archives'
    os.makedirs(archive_dir, exist_ok=True)

    # Label archives with the month that just ended
    prev_month = (datetime.now() - relativedelta(months=1)).strftime('%Y-%m')

    for src, name in [('data/pickup.csv', 'pickup'), ('data/delivery.csv', 'delivery')]:
        if os.path.isfile(src) and os.path.getsize(src) > 0:
            dest = os.path.join(archive_dir, f'{name}_{prev_month}.csv')
            shutil.copy2(src, dest)
            # Clear the active file
            open(src, 'w').close()
            logging.info(f"MONTHLY ARCHIVE: {src} -> {dest}")
            print(f"Archived {src} to {dest}")


# Start the monthly archive scheduler (guard against Flask debug reloader running it twice)
if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    scheduler = BackgroundScheduler()
    scheduler.add_job(archive_and_clear_csvs, CronTrigger(day=1, hour=0, minute=0))
    scheduler.start()


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
