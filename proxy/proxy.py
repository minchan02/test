from mitmproxy import http
import json

tmp_log = []
log_file_path = "./tmp_log.txt"

def request(flow: http.HTTPFlow) -> None:
    log_entry = {
        "type": "request",
        "url": flow.request.url,
        "method": flow.request.method,
        "request_headers": dict(flow.request.headers),
        "request_body": flow.request.content.decode("utf-8", errors="ignore")
    }
    
    with open(log_file_path, "w") as f:
        f.write(json.dumps(log_entry) + "\n")
    
def response(flow: http.HTTPFlow) -> None:
    log_entry = {
        "type": "response",
        "status_code": flow.response.status_code,
        "response_headers": dict(flow.response.headers),
        "response_body": flow.response.content.decode("utf-8", errors="ignore")
    }
    
    with open(log_file_path, "a") as f:
        f.write(json.dumps(log_entry) + "\n")