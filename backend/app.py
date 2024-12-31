from flask import Flask, session, jsonify, request
from flask_cors import CORS
import redis
import subprocess
import os
import re
from packaging.version import Version
import json

app = Flask(__name__)
# host='redis'
r = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

CORS(app)

PROXY_PORT = 9000
env = os.environ.copy()
env["HTTP_PROXY"] = f"http://localhost:{PROXY_PORT}"
env["HTTPS_PROXY"] = f"http://localhost:{PROXY_PORT}"

def is_version_in_range(version_ranges, input_version):
    """
    Check if the input_version is within any of the version ranges.
    """
    regex = r"(\d+\.\d+(?:\.\d+)?)(?:\s*~\s*|-)(\d+\.\d+(?:\.\d+)?)|(\d+\.\d+(?:\.\d+)?)"  # 정규식: 범위와 단일 버전
    matches = re.findall(regex, version_ranges)

    input_version_parsed = Version(input_version)  # 입력 버전 파싱

    
    for start, end, single in matches:
        if single:
            # 단일 버전 처리
            if input_version_parsed == Version(single):
                return True
        elif start and end:
            # 범위 처리
            if Version(start) <= input_version_parsed <= Version(end):
                return True
    return False

# /api/cve
@app.route('/api/cve', methods=['GET'])
def main():
    cve_keys = r.keys('cve:*')

    cve_data = {}

    for key in cve_keys:
        cve_data[key] = r.hgetall(key)

    return jsonify(cve_data)

# Search
@app.route('/api/cve/get', methods=['GET'])
def get_cve():
    search_value = request.args.get('search', '').lower()
    frame = request.args.get('frame', '').lower()
    risk_range = request.args.get('risk', '').lower()
    version_target = request.args.get('target', '').lower()
    version = request.args.get('version', '').lower()

    cve_keys = r.keys('cve:*')
    results = {}
    
    if frame:
        frame = frame.split(",")
    if risk_range:
        risk_range = risk_range.split("-")
    if version_target:
        version_target = version_target.split(",")

    for key in cve_keys:
        cve_data = r.hgetall(key)
        
        # frame filter
        if frame:
            target = cve_data.get('target', None)
            isTarget = False
            for f in frame:
                if f == target:
                    isTarget = True
                    break
            if isTarget == False:
                continue
            
        # risk range filter
        if risk_range:
            risk = cve_data.get('risk', None)
            if risk != 'N/A':
                if not (float(risk_range[0]) <= float(risk) <= float(risk_range[1])):
                    continue
        
        # version filter
        if version_target or version:
            version_info = cve_data.get('version', None)
            try:
                v_t = version_info.split(":")[0]
                v = version_info.split(":")[1]
            except:
                return jsonify({"message": "Parsing CVE Info Error", "target":key}), 404
            
            if version_target:
                if v_t.lower().strip() not in version_target:
                    continue
                
            if version:
                if not is_version_in_range(v.strip(), version.strip()):
                    continue

        if any(search_value in value.lower() for value in cve_data.values()) or (search_value.lower() in key.lower()):
            results[key] = cve_data

    if results:
        return jsonify(results)
    else:
        return jsonify({"message": "No matching CVE found"}), 404
    
@app.route('/api/cve/<cveName>', methods=['GET'])
def get_cve_by_key(cveName):
    try:
        cve_data = r.hgetall(f'cve:{cveName}')
        
        if not cve_data:
            return jsonify({"error": "CVE not found"}), 404

        try:
            with open(f'./cve/{cveName}/poc.py', 'r') as file:
                poc_content = file.read()
            cve_data['poc'] = poc_content
        except:
            pass
        
        return jsonify(cve_data)

    except Exception as e:
        print(f"Error retrieving CVE data: {e}")
        return jsonify({"error": "Internal server error"}), 500

# /api/attack
@app.route('/api/attack', methods=['POST'])
def run_cve():
    data = request.get_json()
    cve_name = data.get('cve')
    url = data.get('url') 
    
    makefile_name = f"./cve/{cve_name}/makefile"
    requirement_name = f"./cve/{cve_name}/requirements.txt"
    script_name = f"poc.py"
    
    command = ["python3", script_name]
    
    if url:
        target_url = url
    else:
        target_url = "http://host.docker.internal"
        
    command.extend(["-u", target_url])

    try:
        if os.path.exists(requirement_name):
            subprocess.check_output(["pip", "install", "-r", requirement_name])
        if os.path.exists(makefile_name):
            try:
                subprocess.check_output(["make", "-C", f"./cve/{cve_name}"])
            except:
                pass
            
        output = subprocess.check_output(command, cwd=f"./cve/{cve_name}", stderr=subprocess.STDOUT, env=env)
        output = output.decode("utf-8")

        if "Detected Vulnerability : True" in output:
            result = "True"
        else:
            result = "False"
            
    except Exception as e:
        result = "False"
        output = str(e)
        log="None"
        return jsonify({"result": result, "msg" : output, "log" : log})
        
    with open("tmp_log.txt", "r") as f:
        log = f.read()
        
    return jsonify({"result": result, "msg" : output, "log" : log})

# /api/history
@app.route('/api/history/save', methods=['POST'])
def save_attack():
    data = request.get_json()
    attacks = data.get('attacks', [])

    try:
        for attack in attacks:
            cve = attack.get('cve')
            msg = attack.get('msg')
            result = attack.get('result')
            log = attack.get('log')
            timestamp = attack.get('timestamp')
            
            if not msg:
                msg = ""
            if not log:
                log = ""

            if cve:
                r.hset(f'history:{timestamp}', f'{cve}:msg', msg)
                r.hset(f'history:{timestamp}', f'{cve}:result', result)
                r.hset(f'history:{timestamp}', f'{cve}:log', log)

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "msg" : e})
    
@app.route('/api/history/get', methods=['GET'])
def get_history():
    keys = r.keys("history:*")
    history = {}

    for key in keys:
        timestamp = key.split(":", 1)[1]
        if timestamp not in history:
            history[timestamp] = []

        cve_data = r.hgetall(key)
        for field, value in cve_data.items():
            cve_name, field_type = field.split(":", 1)
            cve_entry = next((item for item in history[timestamp] if item["cve"] == cve_name), None)
            if not cve_entry:
                cve_entry = {"cve": cve_name, "msg": None, "result": None, "log": None}
                history[timestamp].append(cve_entry)
            cve_entry[field_type] = value

    sorted_history = [{"timestamp": ts, "attacks": attacks} for ts, attacks in sorted(history.items(), reverse=True)]
    
    return jsonify({"history": sorted_history})

@app.route('/api/history/delete', methods=['POST'])
def delete_history():
    data = request.get_json()
    timestamp = data.get("timestamp")
    if timestamp:
        redis_key = f"history:{timestamp}"
        if r.exists(redis_key):
            r.delete(redis_key) 
            return jsonify({"success": True})
    return jsonify({"success": False, "message": "Failed to delete history"})

# /api/manage
@app.route('/api/manage/cve/add', methods=['POST'])
def add_cve():
    data = request.get_json()
    cve_name = data.get("cve")
    risk = data.get("risk")
    target = data.get("target")
    version = data.get("version")
    summary = data.get("summary")
    description = data.get("description")
    patch = data.get("patch")
    
    try:
        if cve_name:
            risk and r.hset(f'cve:{cve_name}', f'risk', risk)
            target and r.hset(f'cve:{cve_name}', f'target', target)
            version and r.hset(f'cve:{cve_name}', f'version', version)
            summary and r.hset(f'cve:{cve_name}', f'summary', summary)
            description and r.hset(f'cve:{cve_name}', f'description', description)
            patch and r.hset(f'cve:{cve_name}', f'patch', patch)
    
    except Exception as e:
        return jsonify({"success": False, "msg" : f"Failed : {e}"})
    
    return jsonify({"success":True, "msg":"Add Success!"})
if __name__ == "__main__":
    app.run()