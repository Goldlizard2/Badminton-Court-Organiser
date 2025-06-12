#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands {
    pub mod auth;
}

use commands::auth::AppState;

#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

#[tokio::main]
async fn main() {
    let app_state = AppState::new().await.expect("Failed to initialize database");
    
    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::auth::login,
            commands::auth::logout,
            commands::auth::create_user
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}