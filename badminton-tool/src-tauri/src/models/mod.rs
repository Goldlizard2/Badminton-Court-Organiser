use sqlx::SqlitePool;

pub mod club;
pub mod player;
pub mod games;

pub use club::*;
pub use player::*;
pub use games::*;

pub struct AppState {
    pub db: SqlitePool,
}