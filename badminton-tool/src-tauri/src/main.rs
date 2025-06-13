#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod models;
mod services;
mod utils;

use database::{establish_connection, run_migrations};
use models::AppState;
use tokio::sync::Mutex;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tokio::main]
async fn main() {
    // Initialize database connection
    let db = establish_connection()
        .await
        .expect("Failed to establish database connection");

    // Run migrations
    run_migrations(&db).await.expect("Failed to run migrations");

    // Create app state
    let app_state = AppState {
        db,
        current_user: Mutex::new(None),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::auth::login,
            commands::auth::logout,
            commands::auth::create_user,
            commands::clubs::get_clubs,
            commands::clubs::create_club,
            commands::clubs::delete_club,
            commands::clubs::join_club,
            commands::clubs::leave_club
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
