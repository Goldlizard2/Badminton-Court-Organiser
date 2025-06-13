use bcrypt::{hash, DEFAULT_COST};
use sqlx::SqlitePool;

pub async fn run_migrations(db: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create users table
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
    .execute(db)
    .await?;

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

    // Create default admin user
    create_default_admin(db).await?;

    Ok(())
}

async fn create_default_admin(db: &SqlitePool) -> Result<(), sqlx::Error> {
    let admin_password = hash("password123", DEFAULT_COST).unwrap();
    sqlx::query("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)")
        .bind("admin@example.com")
        .bind(admin_password)
        .bind("admin")
        .execute(db)
        .await?;

    Ok(())
}
