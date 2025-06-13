use crate::models::{AppState, CreateUser, LoginCredentials, User}; // Add AppState to import
use crate::services::AuthService;
use bcrypt::{hash, DEFAULT_COST};
use sqlx::SqlitePool;
use tauri::State;

impl AppState {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let db_path = std::env::var("DATABASE_URL").unwrap_or_else(|_| "database.db".to_string());
        println!("Database will be created at: {:?}", db_path);

        let db = SqlitePool::connect(&format!("sqlite:{}", db_path)).await?;

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
        sqlx::query("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)")
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
pub async fn login(
    username: String,
    password: String,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let credentials = LoginCredentials { username, password };

    match AuthService::authenticate_user(&state.db, credentials).await {
        Ok(user) => {
            let mut current_user = state.current_user.lock().await;
            *current_user = Some(user.clone());
            Ok(user)
        }
        Err(e) => Err(e.into()),
    }
}

#[tauri::command]
pub async fn logout(state: State<'_, AppState>) -> Result<(), String> {
    let mut current_user = state.current_user.lock().await;
    *current_user = None;
    Ok(())
}

#[tauri::command]
pub async fn create_user(
    username: String,
    password: String,
    role: String,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let user_data = CreateUser {
        username,
        password,
        role,
    };

    match AuthService::create_user(&state.db, user_data).await {
        Ok(user) => Ok(user),
        Err(e) => Err(e.into()),
    }
}
