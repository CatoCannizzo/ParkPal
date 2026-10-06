import json
import sys
import os
from pathlib import Path
import psycopg2 as psql
from configparser import ConfigParser

def get_db_config(filename='db.ini', section='parkpal'):
    # Check multiple possible locations for db.ini
    possible_paths = [
        Path(filename),
        Path('backend') / filename,
        Path(__file__).resolve().parent.parent / filename,
    ]
    
    config_path = None
    for p in possible_paths:
        if p.exists():
            config_path = p
            break

    db = {}
    if config_path:
        parser = ConfigParser()
        parser.read(config_path)
        if parser.has_section(section):
            for param in parser.items(section):
                db[param[0]] = param[1]
    
    # Environment variable overrides
    if os.environ.get('DB_HOST'):
        db['host'] = os.environ.get('DB_HOST')
    if os.environ.get('DB_PORT'):
        db['port'] = os.environ.get('DB_PORT')
    if os.environ.get('DB_NAME'):
        db['database'] = os.environ.get('DB_NAME')
    if os.environ.get('DB_USER'):
        db['user'] = os.environ.get('DB_USER')
    if os.environ.get('DB_PASSWORD'):
        db['password'] = os.environ.get('DB_PASSWORD')

    if not db:
        db = {
            'host': '127.0.0.1',
            'port': '5433',
            'database': 'parkpal',
            'user': 'parkpal',
            'password': 'pass'
        }
    return db

def tf(val):
    return str(val).strip().upper() == "TRUE"

def main():
    if len(sys.argv) <= 1:
        print("Usage: python consolidate.py <input.json>")
        sys.exit(1)

    json_path = sys.argv[1]
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        sys.exit(1)

    db_params = get_db_config()
    print(f"Connecting to database {db_params.get('database')} at {db_params.get('host')}:{db_params.get('port', 5432)}...")

    conn = psql.connect(**db_params)
    cur = conn.cursor()

    with open(json_path, 'r', encoding='utf-8') as f:
        parks_json = json.load(f)

    print(f"Ingesting {len(parks_json)} records...")
    feature_count = 0
    park_count = 0

    seen_features = set()

    for item in parks_json:
        # Resolve latitude and longitude
        raw_x = float(item.get("xpos", 0.0)) if item.get("xpos") else 0.0
        raw_y = float(item.get("ypos", 0.0)) if item.get("ypos") else 0.0

        # Seattle latitude is ~47.6, longitude is ~ -122.3
        # raw_y is latitude, raw_x is longitude
        lat = raw_y
        lon = raw_x
        if lat < 0 and lon > 0:
            lat, lon = lon, lat

        hours = str(item.get("hours")) if item.get("hours") else None
        fid = int(item["feature_id"]) if "feature_id" in item else None
        fdesc = str(item.get("feature_desc", ""))
        pid = int(item["pmaid"]) if "pmaid" in item else None
        name = str(item.get("name", ""))

        if fid is not None and fid not in seen_features:
            cur.execute(
                """
                INSERT INTO feature (fid, name)
                VALUES (%s, %s)
                ON CONFLICT (fid) DO UPDATE SET name = EXCLUDED.name
                """,
                (fid, fdesc)
            )
            seen_features.add(fid)
            feature_count += 1

        if pid is not None and fid is not None:
            cur.execute(
                """
                INSERT INTO park (pid, name, fid, lat, lon, hours, youth_only, lighting)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    pid,
                    name,
                    fid,
                    lat,
                    lon,
                    hours,
                    tf(item.get("youth_only")),
                    tf(item.get("lighting"))
                )
            )
            park_count += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"Done! Inserted/updated {feature_count} features and {park_count} park entries.")

if __name__ == '__main__':
    main()