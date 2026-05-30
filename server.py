import os
import json
import http.server
import socketserver

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
# Change working directory to ensure SimpleHTTPRequestHandler serves from the correct folder
os.chdir(DIRECTORY)

BOOKINGS_FILE = os.path.join(DIRECTORY, "bookings.json")

class MalarSyncHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/bookings':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.end_headers()
            
            bookings = []
            if os.path.exists(BOOKINGS_FILE):
                try:
                    with open(BOOKINGS_FILE, 'r', encoding='utf-8') as f:
                        bookings = json.load(f)
                except Exception as e:
                    print("Error reading bookings.json:", e)
            
            self.wfile.write(json.dumps(bookings).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/bookings':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                new_booking = json.loads(post_data.decode('utf-8'))
                
                bookings = []
                if os.path.exists(BOOKINGS_FILE):
                    try:
                        with open(BOOKINGS_FILE, 'r', encoding='utf-8') as f:
                            bookings = json.load(f)
                    except Exception as e:
                        print("Error reading bookings.json before append:", e)
                
                bookings.append(new_booking)
                
                with open(BOOKINGS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(bookings, f, ensure_ascii=False, indent=2)
                
                response = {"status": "success", "message": "Booking stored successfully"}
            except Exception as e:
                print("Error saving booking in POST:", e)
                response = {"status": "error", "message": str(e)}
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        elif self.path == '/api/bookings/sync':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                updated_bookings = json.loads(post_data.decode('utf-8'))
                
                with open(BOOKINGS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(updated_bookings, f, ensure_ascii=False, indent=2)
                
                response = {"status": "success", "message": "Bookings database synced successfully"}
            except Exception as e:
                print("Error syncing database in POST:", e)
                response = {"status": "error", "message": str(e)}
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    # Force socket address reuse to prevent "Address already in use" errors on restarts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MalarSyncHandler) as httpd:
        print(f"Malar A/C Sync Server running on port {PORT}...")
        print(f"Serving files from: {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run_server()
