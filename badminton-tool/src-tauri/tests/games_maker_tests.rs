#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn sample_player(id: i64, skill: i32) -> Player {
        Player {
            id,
            first_name: format!("First{}", id),
            last_name: format!("Last{}", id),
            email: format!("player{}@test.com", id),
            gender: "Male".to_string(),
            club_id: 1,
            skill_level: skill,
            sit_off_count: 0,
        }
    }

    #[tokio::test]
    async fn test_make_games_exact_players() {
        let players = vec![
            sample_player(1, 10),
            sample_player(2, 20),
            sample_player(3, 30),
            sample_player(4, 40),
        ];
        let result = make_games(players, 1, None).await;
        assert_eq!(result.games.len(), 1);
        assert_eq!(result.sitting_out.len(), 0);
    }

    #[tokio::test]
    async fn test_make_games_extra_players() {
        let players = vec![
            sample_player(1, 10),
            sample_player(2, 20),
            sample_player(3, 30),
            sample_player(4, 40),
            sample_player(5, 50),
        ];
        let result = make_games(players, 1, None).await;
        assert_eq!(result.games.len(), 1);
        assert_eq!(result.sitting_out.len(), 1);
    }

    #[tokio::test]
    async fn test_make_games_not_enough_players() {
        let players = vec![
            sample_player(1, 10),
            sample_player(2, 20),
            sample_player(3, 30),
        ];
        let result = make_games(players, 1, None).await;
        assert_eq!(result.games.len(), 0);
        assert_eq!(result.sitting_out.len(), 3);
    }
}