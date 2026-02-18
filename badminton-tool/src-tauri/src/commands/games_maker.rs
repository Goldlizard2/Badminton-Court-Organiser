use crate::models::{Game, GamesRound, InGamePlayer};
use std::collections::HashSet;
use std::time::{SystemTime, UNIX_EPOCH};

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

    let previous_sit_out_ids: HashSet<i64> = previous_sit_out
        .unwrap_or_default()
        .into_iter()
        .map(|p| p.id)
        .collect();

    let total_needed = num_courts * 4;
    let mut games = Vec::new();
    let mut sitting_out = Vec::new();

    if players.len() < total_needed {
        sitting_out = players;
        for p in &mut sitting_out {
            p.sit_out_count += 1;
        }
        return GamesRound { games, sitting_out };
    }

    let num_to_sit_out = players.len() - total_needed;
    sitting_out = select_players_to_sit_out(&mut players, num_to_sit_out, &previous_sit_out_ids);

    for p in &mut sitting_out {
        p.sit_out_count += 1;
    }

    // Prioritize previous sit-outs in assignment order
    let teams = create_balanced_teams(players, num_courts, &previous_sit_out_ids);

    for (court_idx, team) in teams.into_iter().enumerate() {
        games.push(Game {
            court: court_idx + 1,
            players: team,
        });
    }

    GamesRound { games, sitting_out }
}

fn select_players_to_sit_out(
    players: &mut Vec<InGamePlayer>,
    num_to_sit_out: usize,
    previous_sit_out_ids: &HashSet<i64>,
) -> Vec<InGamePlayer> {
    if num_to_sit_out == 0 || players.is_empty() {
        return Vec::new();
    }

    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0);

    // Rank all players by:
    // 1) not in previous sit-out round
    // 2) lowest sit_out_count (fair distribution over time)
    // 3) randomized tie-breaker
    let mut pool: Vec<InGamePlayer> = players.drain(..).collect();
    pool.sort_by(|a, b| {
        let a_prev = previous_sit_out_ids.contains(&a.id) as u8;
        let b_prev = previous_sit_out_ids.contains(&b.id) as u8;

        a_prev
            .cmp(&b_prev)
            .then(a.sit_out_count.cmp(&b.sit_out_count))
            .then_with(|| tie_breaker(a.id, seed).cmp(&tie_breaker(b.id, seed)))
    });

    let split = num_to_sit_out.min(pool.len());
    let mut remaining = pool.split_off(split);
    let sitting_out = pool;

    *players = std::mem::take(&mut remaining);
    sitting_out
}

fn tie_breaker(id: i64, seed: u64) -> u64 {
    // Small deterministic mixer for pseudo-random ordering per round.
    let mut x = (id as u64) ^ seed;
    x ^= x >> 33;
    x = x.wrapping_mul(0xff51afd7ed558ccd);
    x ^= x >> 33;
    x = x.wrapping_mul(0xc4ceb9fe1a85ec53);
    x ^ (x >> 33)
}

fn create_balanced_teams(
    players: Vec<InGamePlayer>,
    num_courts: usize,
    previous_sit_out_ids: &HashSet<i64>,
) -> Vec<Vec<InGamePlayer>> {
    if num_courts == 0 {
        return Vec::new();
    }

    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0);

    // 1) Players who sat out last round are assigned first
    // 2) Within each group, higher skill first
    // 3) Random tie-breaker for same skill
    let (mut priority, mut regular): (Vec<_>, Vec<_>) = players
        .into_iter()
        .partition(|p| previous_sit_out_ids.contains(&p.id));

    priority.sort_by(|a, b| {
        b.skill_level
            .cmp(&a.skill_level)
            .then_with(|| tie_breaker(a.id, seed).cmp(&tie_breaker(b.id, seed)))
    });

    regular.sort_by(|a, b| {
        b.skill_level
            .cmp(&a.skill_level)
            .then_with(|| tie_breaker(a.id, seed).cmp(&tie_breaker(b.id, seed)))
    });

    let mut draft_order = priority;
    draft_order.extend(regular);

    let mut teams: Vec<Vec<InGamePlayer>> = vec![Vec::new(); num_courts];
    let mut current_team = 0usize;
    let mut direction = 1i32;

    for player in draft_order {
        teams[current_team].push(player);

        if direction == 1 {
            if current_team == num_courts - 1 {
                direction = -1;
            } else {
                current_team += 1;
            }
        } else if current_team == 0 {
            direction = 1;
        } else {
            current_team -= 1;
        }
    }

    optimize_teams_stability(&mut teams);
    teams
}

fn optimize_teams_stability(teams: &mut [Vec<InGamePlayer>]) {
    for _ in 0..10 {
        let mut improved = false;

        for i in 0..teams.len() {
            for j in (i + 1)..teams.len() {
                if let Some((idx_a, idx_b)) = find_best_swap(&teams[i], &teams[j]) {
                    let player_a = teams[i].remove(idx_a);
                    let player_b = teams[j].remove(idx_b);
                    teams[i].push(player_b);
                    teams[j].push(player_a);
                    improved = true;
                }
            }
        }

        if !improved {
            break;
        }
    }
}

fn find_best_swap(team_a: &[InGamePlayer], team_b: &[InGamePlayer]) -> Option<(usize, usize)> {
    let team_a_avg = calculate_team_average(team_a);
    let team_b_avg = calculate_team_average(team_b);
    let current_variance = (team_a_avg - team_b_avg).abs();

    let mut best_swap = None;
    let mut best_improvement = 0.0;

    for (i, player_a) in team_a.iter().enumerate() {
        for (j, player_b) in team_b.iter().enumerate() {
            let new_team_a_avg = calculate_new_average(team_a, player_a.skill_level, player_b.skill_level);
            let new_team_b_avg = calculate_new_average(team_b, player_b.skill_level, player_a.skill_level);
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

fn calculate_new_average(team: &[InGamePlayer], remove_skill: i32, add_skill: i32) -> f64 {
    let total: i32 = team.iter().map(|p| p.skill_level).sum::<i32>() - remove_skill + add_skill;
    total as f64 / team.len() as f64
}

fn calculate_team_average(team: &[InGamePlayer]) -> f64 {
    if team.is_empty() {
        return 0.0;
    }
    let total: i32 = team.iter().map(|p| p.skill_level).sum();
    total as f64 / team.len() as f64
}
