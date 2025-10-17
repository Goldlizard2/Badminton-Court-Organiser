use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct GamesRound {
    pub games: Vec<Game>,
    pub sitting_out: Vec<InGamePlayer>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct InGamePlayer {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub skill_level: i32,
    pub sit_off_count: i32,
}

#[derive(Serialize, Deserialize)]
pub struct Game {
    pub court: usize,
    pub players: Vec<InGamePlayer>,
}
