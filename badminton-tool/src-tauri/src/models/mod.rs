use sqlx::SqlitePool;

pub mod club;
pub mod user;

pub use club::*;
pub use user::*;

pub struct AppState {
    pub db: SqlitePool,
}
