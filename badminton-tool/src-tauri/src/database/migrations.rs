use bcrypt::{hash, DEFAULT_COST};
use sqlx::SqlitePool;

pub async fn run_migrations(db: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create clubs table (if you have clubs)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
        "#,
    )
    .execute(db)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS club_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (club_id) REFERENCES clubs(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        "#,
    )
    .execute(db)
    .await?;

    Ok(())
}


