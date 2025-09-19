use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Game {
    pub court: usize,
    pub players: Vec<Player>,
}

#[derive(Serialize, Deserialize)]
pub struct GamesRound {
    pub games: Vec<Game>,
    pub sitting_out: Vec<Player>,
}