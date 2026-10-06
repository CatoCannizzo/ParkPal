import os
import json
import datetime
from pathlib import Path
from contextlib import contextmanager
from configparser import ConfigParser

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import psycopg2 as psql
import psycopg2.errors
import bcrypt
import jwt

# Certificate setup
CERT_DIR = Path(__file__).resolve().parent / '.cert'
PRIVATE_KEY_PATH = CERT_DIR / 'privatekey.pem'
PUBLIC_KEY_PATH = CERT_DIR / 'publickey.cer'

def ensure_keys():
    """Ensure RSA keypair exists for JWT signing and verification."""
    if not PRIVATE_KEY_PATH.exists() or not PUBLIC_KEY_PATH.exists():
        CERT_DIR.mkdir(parents=True, exist_ok=True)
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        public_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        with open(PRIVATE_KEY_PATH, 'wb') as f:
            f.write(private_pem)
        with open(PUBLIC_KEY_PATH, 'wb') as f:
            f.write(public_pem)
        print("Generated new RSA key pair in .cert/")

ensure_keys()
private_key = open(PRIVATE_KEY_PATH, 'r').read()
public_key = open(PUBLIC_KEY_PATH, 'r').read()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def get_db_config(filename='db.ini', section='parkpal'):
    possible_paths = [
        Path(filename),
        Path(__file__).resolve().parent / filename,
    ]
    db = {}
    for p in possible_paths:
        if p.exists():
            parser = ConfigParser()
            parser.read(p)
            if parser.has_section(section):
                for param in parser.items(section):
                    db[param[0]] = param[1]
                break

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

@contextmanager
def get_db_cursor():
    """Context manager for acquiring a PostgreSQL connection and cursor safely."""
    conn = psql.connect(**get_db_config())
    try:
        with conn.cursor() as cur:
            yield cur, conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def parkOut(park):
    return {
        "pid": park[0],
        "name": park[1],
        "fids": [park[2]],
        "lat": park[3],
        "lon": park[4],
        "hours": park[5],
        "youth_only": park[6],
        "lighting": park[7]
    }

def featureOut(feature):
    return {
        "fid": feature[0],
        "name": feature[1],
        "image": feature[2]
    }

@app.route('/')
def healthcheck():
    return 'The Backend is running as expected'

@app.route('/auth_login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json(silent=True) or {}
    user = data.get('username', '').strip()
    passwd = data.get('password', '')

    if not user or not passwd:
        return jsonify({"status": "unauthorized", "msg": "Username and password required"}), 400

    with get_db_cursor() as (cur, _):
        cur.execute("SELECT password, id FROM users WHERE username=%s", (user,))
        res = cur.fetchone()

    if res is not None:
        db_hashed = res[0]
        if bcrypt.checkpw(passwd.encode('utf-8'), db_hashed.encode('utf-8')):
            payload_data = {
                "sub": str(res[1]),
                "nickname": user,
                "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
                "iat": datetime.datetime.now(datetime.timezone.utc)
            }
            new_token = jwt.encode(
                payload=payload_data,
                key=private_key,
                algorithm='RS256'
            )
            return jsonify({"status": "success", "msg": "success", "token": new_token}), 200
        else:
            return jsonify({"status": "unauthorized", "msg": "incorrect password"}), 401
    else:
        return jsonify({"status": "unauthorized", "msg": "incorrect username"}), 401

@app.route('/auth_register', methods=['POST'])
@cross_origin()
def register():
    data = request.get_json(silent=True) or {}
    user = data.get('username', '').strip()
    passwd = data.get('password', '')

    if len(user) > 0 and len(passwd) > 0:
        salt = bcrypt.gensalt()
        hashed_pass = bcrypt.hashpw(passwd.encode('utf-8'), salt).decode('utf-8')
        try:
            with get_db_cursor() as (cur, _):
                cur.execute("INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id", (user, hashed_pass))
                cur.fetchone()
            return jsonify({"status": "success", "msg": "success"}), 200
        except psql.errors.UniqueViolation:
            return jsonify({"status": "error", "msg": "Please choose a different username"}), 409
    else:
        return jsonify({"status": "error", "msg": "Username or password must not be empty"}), 400

@app.route('/auth_editnote', methods=['POST'])
@cross_origin()
def editNote():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith("Bearer "):
        return jsonify({"status": "error", "msg": "Invalid token"}), 401

    raw_jwt = auth_header[7:].strip()
    try:
        jwt_data = jwt.decode(raw_jwt, key=public_key, algorithms=['RS256'])
    except jwt.PyJWTError as e:
        return jsonify({"status": "error", "msg": f"Token error: {str(e)}"}), 401

    data = request.get_json(silent=True) or {}
    note = data.get('note', '')
    park = data.get('pid')

    if park is None:
        return jsonify({"status": "error", "msg": "Park ID required"}), 400

    try:
        user_id = int(jwt_data["sub"])
        with get_db_cursor() as (cur, _):
            cur.execute("SELECT note FROM notes WHERE uid = %s AND pid = %s", (user_id, park))
            existing = cur.fetchone()
            if existing is None:
                cur.execute("INSERT INTO notes (uid, pid, note) VALUES (%s, %s, %s)", (user_id, park, note))
            else:
                cur.execute("UPDATE notes SET note = %s WHERE uid = %s AND pid = %s", (note, user_id, park))
        return jsonify({"status": "success", "msg": "Note saved"}), 200
    except Exception as e:
        return jsonify({"status": "failure", "msg": f"Error saving note: {str(e)}"}), 500

@app.route('/auth_getnote', methods=['POST'])
@cross_origin()
def getNote():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith("Bearer "):
        return jsonify({"status": "error", "msg": "Invalid token"}), 401

    raw_jwt = auth_header[7:].strip()
    try:
        jwt_data = jwt.decode(raw_jwt, key=public_key, algorithms=['RS256'])
    except jwt.PyJWTError as e:
        return jsonify({"status": "error", "msg": f"Token error: {str(e)}"}), 401

    data = request.get_json(silent=True) or {}
    park = data.get('pid')

    if park is None:
        return jsonify({"status": "error", "msg": "Park ID required"}), 400

    try:
        user_id = int(jwt_data["sub"])
        with get_db_cursor() as (cur, _):
            cur.execute("SELECT note FROM notes WHERE uid = %s AND pid = %s", (user_id, park))
            row = cur.fetchone()
            note_val = row[0] if row else ""
        return jsonify({"status": "success", "msg": "Note retrieved", "note": note_val}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": f"Error retrieving note: {str(e)}"}), 500

@app.route('/parks')
def getParks():
    try:
        with get_db_cursor() as (cur, _):
            cur.execute('SELECT pid, name, fid, lat, lon, hours, youth_only, lighting FROM park')
            parks = cur.fetchall()

        ret = {}
        for park in parks:
            key = str(park[1])
            if key in ret:
                ret[key]["fids"].append(park[2])
            else:
                ret[key] = parkOut(park)

        return jsonify(list(ret.values())), 200
    except Exception as error:
        print(f"Error fetching parks: {error}")
        return jsonify({"error": str(error)}), 500

@app.route('/features')
def getFeatures():
    try:
        with get_db_cursor() as (cur, _):
            cur.execute('SELECT fid, name, image FROM feature')
            features = cur.fetchall()

        ret = [featureOut(f) for f in features]
        return jsonify(ret), 200
    except Exception as error:
        print(f"Error fetching features: {error}")
        return jsonify({"error": str(error)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)