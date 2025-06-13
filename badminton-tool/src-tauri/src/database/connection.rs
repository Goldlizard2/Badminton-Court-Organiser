use crate::utils::config::get_database_path;
use sqlx::SqlitePool;

pub async fn establish_connection() -> Result<SqlitePool, sqlx::Error> {
    let db_path = get_database_path();

    // Create the parent directories if they don't exist
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| {
            eprintln!("Failed to create app data directory: {}", e);
            sqlx::Error::Io(e)
        })?;
    }

    println!("Database will be created at: {:?}", db_path);

    let db = SqlitePool::connect(&format!("sqlite:{}", db_path.display())).await?;

    Ok(db)
}
