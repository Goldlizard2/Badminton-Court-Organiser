use sqlx::SqlitePool;

pub mod club;
pub mod games;
pub mod player;

pub use club::*;
pub use games::*;
pub use player::*;

pub struct AppState {
    pub db: SqlitePool,
}
