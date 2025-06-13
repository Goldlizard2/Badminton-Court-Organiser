use std::path::PathBuf;

pub fn get_database_path() -> PathBuf {
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    PathBuf::from(home_dir)
        .join("Documents/Badminton-Court-Organiser")
        .join("badminton-tool")
        .join("data")
        .join("app_data.db")
}

pub fn get_app_data_dir() -> PathBuf {
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    PathBuf::from(home_dir)
        .join("Documents/Badminton-Court-Organiser")
        .join("badminton-tool")
}
