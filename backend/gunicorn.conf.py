# Gunicorn configuration file
import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = int(os.getenv('GUNICORN_WORKERS', '2'))
worker_class = 'sync'
worker_connections = 1000
threads = int(os.getenv('GUNICORN_THREADS', '2'))
timeout = int(os.getenv('GUNICORN_TIMEOUT', '120'))
keepalive = 5

# Restart workers after this many requests to prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'gunicorn-banco'

# Server hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    server.log.info("🚀 Starting Gunicorn server")

def when_ready(server):
    """Called just after the server is started."""
    server.log.info("✅ Gunicorn server is ready. Spawning workers")

def on_exit(server):
    """Called just before exiting Gunicorn."""
    server.log.info("👋 Shutting down Gunicorn")

def worker_int(worker):
    """Called just after a worker exited on SIGINT or SIGQUIT."""
    worker.log.info(f"⚠️  Worker received INT or QUIT signal")

def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    server.log.info(f"👷 Worker spawned (pid: {worker.pid})")

def pre_exec(server):
    """Called just before a new master process is forked."""
    server.log.info("🔄 Forking new master process")

def worker_abort(worker):
    """Called when a worker received the SIGABRT signal."""
    worker.log.info(f"💥 Worker received SIGABRT signal")
