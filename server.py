from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime, timezone
import json
import os
import re
import threading


# ============================================================
# CONFIG
# ============================================================

BASE = Path(__file__).resolve().parent
WISH_FILE = BASE / "wishes.json"

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))

MAX_WISHES = 500

LOCK = threading.Lock()


# ============================================================
# FILE
# ============================================================

def ensure_wish_file():

    if not WISH_FILE.exists():

        WISH_FILE.write_text(
            "[]",
            encoding="utf-8"
        )


# ============================================================
# CLEAN INPUT
# ============================================================

def clean_text(value, maximum):

    if not isinstance(value, str):
        return ""

    value = re.sub(
        r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]",
        "",
        value
    )

    return value.strip()[:maximum]


# ============================================================
# READ
# ============================================================

def read_wishes():

    ensure_wish_file()

    with LOCK:

        try:

            data = json.loads(
                WISH_FILE.read_text(
                    encoding="utf-8"
                )
            )

            if isinstance(data, list):
                return data

            return []

        except Exception:

            return []


# ============================================================
# WRITE
# ============================================================

def write_wishes(wishes):

    with LOCK:

        WISH_FILE.write_text(
            json.dumps(
                wishes,
                ensure_ascii=False,
                indent=2
            ),
            encoding="utf-8"
        )


# ============================================================
# SERVER
# ============================================================

class NamjoonHandler(SimpleHTTPRequestHandler):


    def __init__(
        self,
        *args,
        **kwargs
    ):

        super().__init__(
            *args,
            directory=str(BASE),
            **kwargs
        )


    # --------------------------------------------------------
    # HEADERS
    # --------------------------------------------------------

    def end_headers(self):

        self.send_header(
            "Cache-Control",
            "no-store, no-cache, must-revalidate"
        )

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.send_header(
            "X-Content-Type-Options",
            "nosniff"
        )

        super().end_headers()


    def do_OPTIONS(self):

        self.send_response(204)
        self.end_headers()


    # --------------------------------------------------------
    # JSON RESPONSE
    # --------------------------------------------------------

    def send_json(
        self,
        status,
        payload
    ):

        body = json.dumps(
            payload,
            ensure_ascii=False
        ).encode("utf-8")


        self.send_response(status)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        self.send_header(
            "Content-Length",
            str(len(body))
        )

        self.end_headers()

        self.wfile.write(body)


    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    def do_GET(self):

        path = urlparse(self.path).path


        if path == "/api/wishes":

            wishes = read_wishes()

            wishes.sort(
                key=lambda item:
                    item.get(
                        "created_at",
                        ""
                    ),
                reverse=True
            )

            self.send_json(
                200,
                {
                    "wishes": wishes
                }
            )

            return


        super().do_GET()


    # --------------------------------------------------------
    # POST
    # --------------------------------------------------------

    def do_POST(self):

        path = urlparse(self.path).path


        if path != "/api/wishes":

            self.send_json(
                404,
                {
                    "error":
                        "Not found."
                }
            )

            return


        try:

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    "0"
                )
            )

        except ValueError:

            content_length = 0


        if (
            content_length <= 0
            or content_length > 20000
        ):

            self.send_json(
                413,
                {
                    "error":
                        "The submitted message is too large."
                }
            )

            return


        try:

            raw = self.rfile.read(content_length)

            data = json.loads(raw.decode("utf-8"))

        except Exception:

            self.send_json(
                400,
                {
                    "error":
                        "Invalid request."
                }
            )

            return


        wish = {

            "name":
                clean_text(
                    data.get("name"),
                    40
                ),

            "place":
                clean_text(
                    data.get("place"),
                    50
                ),

            "message":
                clean_text(
                    data.get("message"),
                    500
                ),

            "created_at":
                datetime.now(
                    timezone.utc
                ).isoformat()

        }


        if not all(
            [
                wish["name"],
                wish["place"],
                wish["message"]
            ]
        ):

            self.send_json(
                400,
                {
                    "error":
                        "Name, place and birthday wish are all required."
                }
            )

            return


        wishes = read_wishes()

        wishes.insert(
            0,
            wish
        )

        wishes = wishes[:MAX_WISHES]

        write_wishes(wishes)


        self.send_json(
            201,
            {
                "wishes": wishes
            }
        )


    # --------------------------------------------------------
    # LOG
    # --------------------------------------------------------

    def log_message(
        self,
        format_string,
        *args
    ):

        print(
            "[server]",
            format_string % args
        )


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    ensure_wish_file()


    server = ThreadingHTTPServer(
        (HOST, PORT),
        NamjoonHandler
    )


    print()
    print("✦ NAMJOON'S LITTLE UNIVERSE")
    print("--------------------------------")
    print(
        f"http://localhost:{PORT}"
    )
    print()
    print(
        "Birthday wishes are stored in:"
    )
    print(WISH_FILE)
    print()
    print(
        "Press CTRL+C to stop."
    )
    print()


    try:

        server.serve_forever()

    except KeyboardInterrupt:

        print()
        print("Server stopped.")

        server.server_close()