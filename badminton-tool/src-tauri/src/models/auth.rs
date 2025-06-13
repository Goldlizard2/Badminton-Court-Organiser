use super::User;
use sqlx::SqlitePool;
use tokio::sync::Mutex;

pub struct AppState {
    pub db: SqlitePool,
    pub current_user: Mutex<Option<User>>,
}

#[derive(Debug)]
pub enum AuthError {
    DatabaseError(String),
    InvalidCredentials,
    UserNotFound,
    UserAlreadyExists,
    HashingError,
    VerificationError,
}

impl std::fmt::Display for AuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            AuthError::InvalidCredentials => write!(f, "Invalid credentials"),
            AuthError::UserNotFound => write!(f, "User not found"),
            AuthError::UserAlreadyExists => write!(f, "User already exists"),
            AuthError::HashingError => write!(f, "Failed to hash password"),
            AuthError::VerificationError => write!(f, "Verification error"),
        }
    }
}

impl From<AuthError> for String {
    fn from(error: AuthError) -> Self {
        error.to_string()
    }
}
