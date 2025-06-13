use crate::models::{AuthError, CreateUser, LoginCredentials, User};
use bcrypt::{hash, verify, DEFAULT_COST};
use sqlx::{Row, SqlitePool};

pub struct AuthService;

impl AuthService {
    pub async fn authenticate_user(
        db: &SqlitePool,
        credentials: LoginCredentials,
    ) -> Result<User, AuthError> {
        let row =
            sqlx::query("SELECT id, username, password_hash, role FROM users WHERE username = ?")
                .bind(&credentials.username)
                .fetch_optional(db)
                .await
                .map_err(|_| AuthError::DatabaseError("Failed to query user".to_string()))?;

        if let Some(row) = row {
            let stored_hash: String = row.get("password_hash");

            if verify(&credentials.password, &stored_hash)
                .map_err(|_| AuthError::VerificationError)?
            {
                Ok(User {
                    id: row.get::<i64, _>("id") as u32,
                    username: row.get("username"),
                    role: row.get("role"),
                })
            } else {
                Err(AuthError::InvalidCredentials)
            }
        } else {
            Err(AuthError::UserNotFound)
        }
    }

    pub async fn create_user(db: &SqlitePool, user_data: CreateUser) -> Result<User, AuthError> {
        // Check if user already exists
        let existing_user = sqlx::query("SELECT id FROM users WHERE username = ?")
            .bind(&user_data.username)
            .fetch_optional(db)
            .await
            .map_err(|_| AuthError::DatabaseError("Failed to check existing user".to_string()))?;

        if existing_user.is_some() {
            return Err(AuthError::UserAlreadyExists);
        }

        // Hash the password
        let password_hash =
            hash(&user_data.password, DEFAULT_COST).map_err(|_| AuthError::HashingError)?;

        // Insert new user into database
        let result =
            sqlx::query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
                .bind(&user_data.username)
                .bind(&password_hash)
                .bind(&user_data.role)
                .execute(db)
                .await
                .map_err(|_| AuthError::DatabaseError("Failed to create user".to_string()))?;

        Ok(User {
            id: result.last_insert_rowid() as u32,
            username: user_data.username,
            role: user_data.role,
        })
    }
}
