# -*- coding: utf-8 -*-
#!/usr/bin/env python

import json
import sys
import os
import gflags  # sudo pip install python-gflags
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from bs4 import BeautifulSoup  # sudo pip install BeautifulSoup4
import datetime

gflags.DEFINE_string(
    "locale_language",
    "en",
    "locale language",
    short_name='l')
gflags.DEFINE_string(
    "game_folder",
    "",
    "path to game folder (where the manifest and 'game' folder are situated).",
    short_name='g')
gflags.DEFINE_string(
    "log_file",
    "test",
    "name of the file to log the trials.",
    short_name='f')
gflags.DEFINE_integer(
    "port",
    8000,
    "the port in which in the server listen.",
    short_name='p')


def is_valid_game_folder(path):
    return path and \
        os.path.isdir(path) and \
        os.path.exists(path + "/game_manifest.xml") and \
        os.path.isdir(path + "/levels") and \
        os.path.isdir(path + "/locale") and \
        os.path.exists(path + "/game/index.html")


def is_valid_log_path(p):
    return len(p) > 0


gflags.RegisterValidator('game_folder',
                         is_valid_game_folder,
                         message='game_folder must exist and be valid.\n\n')
gflags.MarkFlagAsRequired("game_folder")

gflags.RegisterValidator('log_file',
                         is_valid_log_path,
                         message='log_file must be a string.')
gflags.MarkFlagAsRequired("log_file")

FLAGS = gflags.FLAGS


try:
    argv = FLAGS(sys.argv)  # parse flags
except gflags.FlagsError, e:
    print '%s\\nUsage: %s ARGS\\n%s' % (e, sys.argv[0], FLAGS)
    sys.exit(1)

if FLAGS.game_folder[-1] == "/":
    FLAGS.game_folder = FLAGS.game_folder[:-1]


def readGameManifest():
    try:
        game_manifest = BeautifulSoup(
            open(FLAGS.game_folder + "/game_manifest.xml").read())
        return {
            "gameName": game_manifest.game["name"],
            "gameVersion": game_manifest.game["version"],
            "languages": map(
                unicode.strip,
                game_manifest.game.languages.text.split(','))
        }

    except IOError:
        print "Couldn't open game manifest"
        sys.exit(1)

d = readGameManifest()
print d
extName = d["gameName"] + d["gameVersion"]
languages = d["languages"]
lang = FLAGS.locale_language
assert(lang in languages)


def convertPath(s):
    convertionRules = {
        "/MateMarote/": "/Front/src/main/webapp/",
        "/resources/js": "/Admin/resources/js",
        "/resources/api": "/Games/libs",
        "/favicon.ico": FLAGS.game_folder
    }
    if s.startswith("/" + extName):
        return "%s/%s/game%s" % \
            (os.curdir, FLAGS.game_folder, s[len("/" + extName):])
    for k, v in convertionRules.items():
        if s.startswith(k):
            return os.curdir + v + s[len(k):]

    return "%s/%s/game%s" % (os.curdir, FLAGS.game_folder, s)
    # print s
    # raise KeyError


def mime(path):
    if path.endswith(".js"):
        return "text/javascript"
    elif path.endswith(".css"):
        return "text/css"
    elif path.endswith(".png"):
        return "image/png"
    else:
        return "text/html"


def get_step_config():
    try:
        elems = []
        for line in open(FLAGS.game_folder + "/levels/level1").readlines():
            line = line.strip()
            if len(line) > 0 and line[0] != "#" and "=" in line:
                name, definition = line.split("=", 1)
                if definition[-1] == "\n":
                    definition = definition[:-1]
                elems.append("'%s' : %s" % (name, json.dumps(definition)))
        return "{\n %s }" % ",\n".join(elems)
    except IOError:
        print "Couldn't load game levels"
        sys.exit(1)


def get_messages(lang):
    try:
        elems = []
        for line in open(FLAGS.game_folder + "/locale/" + lang).readlines():
            if "=" in line:
                name, definition = line.split("=", 1)
                if definition[-1] == "\n":
                    definition = definition[:-1]
                definition = definition.replace("\\", "\\\\")
                definition = definition.replace("\"", "\\\"")
                elems.append(
                    "{localeTag: \"%s\", code: \"%s\", message: \"%s\"}" %
                    (lang, name, definition))
        return "[\n %s ]" % ",\n".join(elems)
    except IOError:
        print "Couldn't load language", lang
        sys.exit(1)

script_inject_game_data_and_redirect = u"""
<html>
<head>
<script src="libs/jquery-2.0.3.js"></script>
<script src="libs/jstorage.js"></script>
<script type="text/javascript">
$.jStorage.flush();
var mockUserId = 32;
$.jStorage.set("currentUser", mockUserId);
// inject level info
var gameData = {};
gameData.stepConfig = %s;
gameData.gameName = '%s';
gameData.gameVersion = '%s';
var lang = "%s";
$.jStorage.set(mockUserId + "_currentLanguage", lang);
gameData.i18nMessages = %s;
$.jStorage.set(mockUserId + "_currentStep", gameData);
$.jStorage.set(mockUserId + "_loginData", {isAdmin: false});
window.location.href = "/%s/index.html";
</script>
</head>
</html>
""" % (get_step_config(), d["gameName"], d["gameVersion"], lang, get_messages(lang), extName)

#print script_inject_game_data_and_redirect

script_mock_gameflow = """
<html>
<head>
<title>Gameflow Mock</title>
</head>
<body>
<h1>Gameflow Mock</h1>
<a href="/"><img src="thumbnail.png" /></a>
</body>
</html>"""

metrics_strs = []


class LocalServerRequestHandler(BaseHTTPRequestHandler):

    def serve_file(self, path):
        f = open(path)
        self.send_response(200)
        self.send_header("Content-type", mime(path))
        self.end_headers()
        self.wfile.write(f.read())

    def serve_json(self, json):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json)

    def serve_text(self, string):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(string)

    def do_GET(self):
        try:
            if self.path == "/":
                self.serve_text(script_inject_game_data_and_redirect)
            elif self.path == "/MateMarote/gameflow.html":
                self.serve_text(script_mock_gameflow)
            elif self.path == "/MateMarote/thumbnail.png":
                self.serve_file("%s/%s/thumbnail.png" % (os.curdir, FLAGS.game_folder))
            elif self.path == "/metrics":
                self.serve_text(getMetrics())
            else:
                self.serve_file(convertPath(self.path))

        except IOError:
            self.send_error(404, "File Not Found: %s" % self.path)

    def log_message(self, format, *args):
        return

    def do_POST(self):
        global metrics_str
        if self.path == "/services/pulse":
            print "pulse"
            self.serve_json("true")
        else:  # assume post metrics
            content_length = int(self.headers.getheader('content-length', 0))
            data = self.rfile.read(content_length)

            with open(FLAGS.log_file, 'ab') as f:
                f.write(data)

            metrics_strs.append(data)
            self.send_response(204)
            self.end_headers()



def timestamp2date(timestamp):
    return datetime.datetime \
        .fromtimestamp(timestamp / 1000.0) \
        .strftime('%Y-%m-%d %H:%M:%S.%f')


def parseMetrics():
    global metrics_strs
    res = ""
    for strmetrics in metrics_strs:
        metrics = json.loads(strmetrics)
        for measurement in metrics.get("measurements", []):
            for metric in measurement.get("metrics", []):
                res += "<tr><td>%s</td><td>%s</td><td>%s</td></tr>" % \
                    (timestamp2date(measurement['saveTimestamp']), metric, measurement['metrics'][metric])
    return res


def getMetrics():
    global metrics_strs
    if metrics_strs == []:
        return "No metrics registered."

    print metrics_strs
    playerId = json.loads(metrics_strs[0])['playerId']
    if len(metrics_strs) > 0:
        try:
            userSynchDate = timestamp2date(json.loads(metrics_strs[1])['userSynchDate'])
        except:
            userSynchDate = "--"
    else:
        userSynchDate = "--"

    metrics_table = \
        """
        <table class="gridtable">
        <thead><tr><th>Time</th><th>Name</th><th>Data</th></tr></thead>
        <tbody> %s
        </tbody>
        </table>
        """ % parseMetrics()

    return """
    <html>
    <head><title>Metrics</title>
    <script type="text/javascript" src="/vendors/lz-string-1.3.3/lz-string-1.3.3-min.js"></script>
    <style type="text/css">
    table.gridtable {
        font-family: verdana,arial,sans-serif;
        font-size:11px;
        color:#333333;
        border-width: 1px;
        border-color: #666666;
        border-collapse: collapse;
    }
    table.gridtable th {
        border-width: 1px;
        padding: 8px;
        border-style: solid;
        border-color: #666666;
        background-color: #dedede;
    }
    table.gridtable td {
        border-width: 1px;
        padding: 8px;
        border-style: solid;
        border-color: #666666;
        background-color: #ffffff;
    }
    </style>
    </head>
    <body>
    <h1>Metrics</h1>
    <h2>PlayerId: %s</h2>
    <h2>userSynchDate: %s</h2>
    <h2>Measurements:</h2>
    %s
    </body>
    </html>
    """ % (playerId, userSynchDate, metrics_table)

try:
    #Create a web server and define the handler to manage the
    #incoming request
    server = HTTPServer(("", FLAGS.port), LocalServerRequestHandler)
    print "Started httpserver on port", FLAGS.port
    #Wait forever for incoming http requests
    server.serve_forever()

except KeyboardInterrupt:
    print "^C received, shutting down the web server"
    server.socket.close()
