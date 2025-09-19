use sqlx::SqlitePool;

pub async fn run_migrations(db: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create clubs table with member_count
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            member_count INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
        "#,
    )
    .execute(db)
    .await?;

    // Add member_count column if it doesn't exist (for existing databases)
    sqlx::query("ALTER TABLE clubs ADD COLUMN member_count INTEGER DEFAULT 0")
        .execute(db)
        .await
        .ok(); // Ignore error if column already exists

    // ...existing code...

    // Create players table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
            club_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            skill_level INTEGER NOT NULL CHECK (skill_level BETWEEN 1 AND 50),
            FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(db)
    .await?;

    // Initialize member_count for existing clubs
    sqlx::query(
        r#"
        UPDATE clubs 
        SET member_count = (
            SELECT COUNT(*) 
            FROM players 
            WHERE players.club_id = clubs.id
        ) 
        WHERE member_count = 0
        "#
    )
    .execute(db)
    .await?;

    Ok(())
    
}