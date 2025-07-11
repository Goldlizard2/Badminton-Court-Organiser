use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: u32,
    pub username: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub password: String,
}

impl User {
    pub fn new(id: u32, username: String, ) -> Self {
        Self { id, username,  }
    }
}
