use crate::models::{AppState, Game, GamesRound, InGamePlayer};
use sqlx::Row;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn make_games(
    mut players: Vec<InGamePlayer>,
    num_courts: usize,
    previous_sit_out: Option<Vec<InGamePlayer>>,
) -> GamesRound {
    println!(
        "make_games called with {} players and {} courts",
        players.len(),
        num_courts
    );

    // Convert previous_sit_out Vec to HashMap for fast lookup
    let sit_out_counts: HashMap<i64, i32> = previous_sit_out
        .unwrap_or_default()
        .into_iter()
        .map(|p| (p.id, p.sit_off_count))
        .collect();

    // Update each player's sit_off_count from previous rounds
    for player in &mut players {
        player.sit_off_count = *sit_out_counts.get(&player.id).unwrap_or(&0);
    }

    // Sort players by sit_off_count (ascending), then skill_level (descending for balance)
    players.sort_by(|a, b| {
        a.sit_off_count
            .cmp(&b.sit_off_count)
            .then(b.skill_level.cmp(&a.skill_level))
    });

    let total_needed = num_courts * 4;
    let mut games = Vec::new();
    let mut sitting_out = Vec::new();

    // If not enough players for all courts, sit out the lowest-priority players
    if players.len() < total_needed {
        sitting_out = players;
        return GamesRound { games, sitting_out };
    }

    // Split players into playing and sitting out
    let (playing_players, sitting_out_players) = players.split_at(total_needed);
    let playing_players = playing_players.to_vec();
    sitting_out = sitting_out_players.to_vec();

    // Create balanced teams
    let teams = create_balanced_teams(playing_players, num_courts);

    // Convert teams to games
    for (court_idx, team) in teams.into_iter().enumerate() {
        games.push(Game {
            court: court_idx + 1,
            players: team,
        });
    }

    GamesRound { games, sitting_out }
}

fn create_balanced_teams(players: Vec<InGamePlayer>, num_courts: usize) -> Vec<Vec<InGamePlayer>> {
    let mut teams = Vec::new();

    // Sort players by skill level for initial distribution
    let mut sorted_players = players;
    sorted_players.sort_by(|a, b| b.skill_level.cmp(&a.skill_level));

    // Initialize empty teams
    for _ in 0..num_courts {
        teams.push(Vec::new());
    }

    // Distribute players using snake draft pattern for balance
    let mut current_team = 0;
    let mut direction = 1; // 1 for forward, -1 for backward

    for player in sorted_players {
        teams[current_team].push(player);

        // Move to next team using snake pattern
        if direction == 1 {
            if current_team == num_courts - 1 {
                direction = -1;
            } else {
                current_team += 1;
            }
        } else {
            if current_team == 0 {
                direction = 1;
            } else {
                current_team -= 1;
            }
        }
    }

    // Apply stable marriage algorithm for fine-tuning
    optimize_teams_stability(&mut teams);

    teams
}

fn optimize_teams_stability(teams: &mut Vec<Vec<InGamePlayer>>) {
    let max_iterations = 10;

    for _ in 0..max_iterations {
        let mut improved = false;

        // Try swapping players between teams to improve balance
        for i in 0..teams.len() {
            for j in (i + 1)..teams.len() {
                if let Some(best_swap) = find_best_swap(&teams[i], &teams[j]) {
                    let (player_i_idx, player_j_idx) = best_swap;

                    // Perform the swap
                    let player_i = teams[i].remove(player_i_idx);
                    let player_j = teams[j].remove(player_j_idx);

                    teams[i].push(player_j);
                    teams[j].push(player_i);

                    improved = true;
                }
            }
        }

        // If no improvements were made, we've reached stability
        if !improved {
            break;
        }
    }
}

fn find_best_swap(team_a: &[InGamePlayer], team_b: &[InGamePlayer]) -> Option<(usize, usize)> {
    let team_a_avg = calculate_team_average(team_a);
    let team_b_avg = calculate_team_average(team_b);

    let mut best_swap = None;
    let mut best_improvement = 0.0;

    for (i, player_a) in team_a.iter().enumerate() {
        for (j, player_b) in team_b.iter().enumerate() {
            // Calculate new averages after hypothetical swap
            let new_team_a_total = team_a.iter().map(|p| p.skill_level).sum::<i32>()
                - player_a.skill_level
                + player_b.skill_level;
            let new_team_b_total = team_b.iter().map(|p| p.skill_level).sum::<i32>()
                - player_b.skill_level
                + player_a.skill_level;

            let new_team_a_avg = new_team_a_total as f64 / team_a.len() as f64;
            let new_team_b_avg = new_team_b_total as f64 / team_b.len() as f64;

            // Calculate current and new variance (measure of balance)
            let current_variance = (team_a_avg - team_b_avg).abs();
            let new_variance = (new_team_a_avg - new_team_b_avg).abs();

            let improvement = current_variance - new_variance;

            if improvement > best_improvement && improvement > 0.1 {
                best_improvement = improvement;
                best_swap = Some((i, j));
            }
        }
    }

    best_swap
}

fn calculate_team_average(team: &[InGamePlayer]) -> f64 {
    if team.is_empty() {
        return 0.0;
    }

    let total: i32 = team.iter().map(|p| p.skill_level).sum();
    total as f64 / team.len() as f64
}
