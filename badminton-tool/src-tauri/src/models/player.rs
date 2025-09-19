use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Gender {
    Male,
    Female,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Player {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub gender: Gender,
    pub club_id: i64,
    pub skill_level: i8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GetPlayer {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub club_id: i64,
    pub skill_level: i8,
    pub gender: Gender,
}

#[derive(Debug, Deserialize)]
pub struct CreatePlayerRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub gender: Gender,
    pub club_id: i64,
    pub skill_level: i32,
}

impl CreatePlayerRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.skill_level < 1 || self.skill_level > 50 {
            return Err("Skill level must be between 1 and 50".to_string());
        }
        
        if self.first_name.trim().is_empty() {
            return Err("First name cannot be empty".to_string());
        }
        
        if self.last_name.trim().is_empty() {
            return Err("Last name cannot be empty".to_string());
        }
        
        if self.email.trim().is_empty() {
            return Err("Email cannot be empty".to_string());
        }
        
        Ok(())
    }
}
