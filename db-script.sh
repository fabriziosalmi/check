#!/bin/bash

# Database management script

# Configuration
LOG_FILE="./db-script.log"
BACKUP_DIR="./backups"
DB_FILE="./database.sql"

# Check dependencies
check_dependencies() {
  if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed"
    exit 1
  fi
}

# Logging function
log() {
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Create backup
create_backup() {
  mkdir -p "$BACKUP_DIR"
  local backup_file="$BACKUP_DIR/database_$(date +%Y%m%d_%H%M%S).sql"
  cp "$DB_FILE" "$backup_file"
  log "Created backup: $backup_file"
}

# Function to initialize database
init_db() {
  log "Initializing database..."
  
  # Ensure database file exists
  if [ ! -f "$DB_FILE" ]; then
    log "Creating new database file"
    touch "$DB_FILE"
    chmod 644 "$DB_FILE"
  fi
  
  node -e "require('./db-init.js').initDatabase().catch(e => { console.error(e); process.exit(1); })"
  
  # Verify database file was created successfully
  if [ ! -f "$DB_FILE" ]; then
    log "Error: Failed to create database file"
    exit 1
  fi
  
  log "Database initialized successfully"
}

# Function to reset database
reset_db() {
  log "Resetting database..."
  
  if [ "$CREATE_BACKUP" = "true" ]; then
    create_backup
  fi
  
  # Remove existing database file if exists
  if [ -f "$DB_FILE" ]; then
    rm -f "$DB_FILE"
  fi
  
  node -e "require('./db-init.js').resetDatabase().catch(e => { console.error(e); process.exit(1); })"
  
  # Verify new database file was created
  if [ ! -f "$DB_FILE" ]; then
    log "Error: Failed to create new database file"
    exit 1
  fi
  
  log "Database reset successfully"
}

# Main script logic
check_dependencies

case "$1" in
  init)
    init_db
    ;;
  reset)
    reset_db
    ;;
  *)
    log "Usage: $0 {init|reset}"
    echo "Usage: $0 {init|reset}"
    exit 1
    ;;
esac

exit 0