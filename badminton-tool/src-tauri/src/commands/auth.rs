use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool, Row};
use tauri::State;
use bcrypt::{hash, verify, DEFAULT_COST};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: u32,
    pub username: String,
    pub role: String,
}

pub struct AppState {
    pub db: SqlitePool,
    pub current_user: tokio::sync::Mutex<Option<User>>,
}

impl AppState {
    pub async fn new() -> Result<Self, sqlx::Error> {
        std::fs::create_dir_all("data").map_err(|e| sqlx::Error::Io(e))?;
        // Database will be created in app data directory
        let db = SqlitePool::connect("sqlite:data/app_data.db").await?;
        
        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL
            )
            "#,
        )
        .execute(&db)
        .await?;

        // Create default admin user
        let admin_password = hash("password123", DEFAULT_COST).unwrap();
        sqlx::query(
            "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)"
        )
        .bind("admin@example.com")
        .bind(admin_password)
        .bind("admin")
        .execute(&db)
        .await?;

        Ok(Self {
            db,
            current_user: tokio::sync::Mutex::new(None),
        })
    }
}

#[tauri::command]
pub async fn login(username: String, password: String, state: State<'_, AppState>) -> Result<User, String> {
    let row = sqlx::query("SELECT id, username, password_hash, role FROM users WHERE username = ?")
        .bind(&username)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| "Database error")?;

    if let Some(row) = row {
        let stored_hash: String = row.get("password_hash");
        
        if verify(&password, &stored_hash).map_err(|_| "Verification error")? {
            let user = User {
                id: row.get::<i64, _>("id") as u32,
                username: row.get("username"),
                role: row.get("role"),
            };
            
            let mut current_user = state.current_user.lock().await;
            *current_user = Some(user.clone());
            Ok(user)
        } else {
            Err("Invalid credentials".to_string())
        }
    } else {
        Err("User not found".to_string())
    }
}

#[tauri::command]
pub async fn logout(state: State<'_, AppState>) -> Result<(), String> {
    let mut current_user = state.current_user.lock().await;
    *current_user = None;
    Ok(())
}

#[tauri::command]
pub async fn create_user(username: String, password: String, role: String, state: State<'_, AppState>) -> Result<User, String> {
    // Check if user already exists
    let existing_user = sqlx::query("SELECT id FROM users WHERE username = ?")
        .bind(&username)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| "Database error")?;
    
    if existing_user.is_some() {
        return Err("User already exists".to_string());
    }
    
    // Hash the password
    let password_hash = hash(&password, DEFAULT_COST)
        .map_err(|_| "Failed to hash password")?;
    
    // Insert new user into database
    let result = sqlx::query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
        .bind(&username)
        .bind(&password_hash)
        .bind(&role)
        .execute(&state.db)
        .await
        .map_err(|_| "Failed to create user")?;
    
    let user = User {
        id: result.last_insert_rowid() as u32,
        username,
        role,
    };
    
    Ok(user)
}