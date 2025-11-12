use std::path::PathBuf;

pub fn get_database_path() -> PathBuf {
    PathBuf::from("../data").join("app_data.db")
}