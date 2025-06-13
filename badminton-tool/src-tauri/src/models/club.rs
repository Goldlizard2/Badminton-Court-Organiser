use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Club {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub member_count: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateClubRequest {
    pub name: String,
    pub description: String,
}
