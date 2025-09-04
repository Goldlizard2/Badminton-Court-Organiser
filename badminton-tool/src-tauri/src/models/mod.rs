use sqlx::SqlitePool;

pub mod club;
pub mod user;
pub mod player;

pub use club::*;
pub use user::*;
pub use player::*;

pub struct AppState {
    pub db: SqlitePool,
}