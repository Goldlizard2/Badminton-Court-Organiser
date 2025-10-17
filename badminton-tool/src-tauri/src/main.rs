#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod models;
mod services;
mod utils;

use database::{establish_connection, run_migrations};
use models::AppState;

#[tokio::main]
async fn main() {
    // Initialize database connection
    let db = establish_connection()
        .await
        .expect("Failed to establish database connection");

    // Run migrations
    run_migrations(&db).await.expect("Failed to run migrations");

    // Create app state
    let app_state = AppState { db };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::clubs::get_clubs,
            commands::clubs::create_club,
            commands::clubs::delete_club,
            commands::clubs::get_club_by_id,
            commands::player::get_players_by_club,
            commands::player::create_player,
            commands::player::update_player,
            commands::player::delete_player,
            commands::games_maker::make_games,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
