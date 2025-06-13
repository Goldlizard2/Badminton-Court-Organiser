use sqlx::SqlitePool;

pub mod auth;
pub mod club;
pub mod user;

pub use auth::*;
pub use club::*;
pub use user::*;

pub struct AppState {
    pub db: SqlitePool,
    pub current_user: tokio::sync::Mutex<Option<User>>,
}
