use crate::models::{AppState, Player, CreatePlayerRequest, GetPlayer, Gender};
use sqlx::Row;
use tauri::State;

#[tauri::command]
pub async fn get_players_by_club(club_id: i64, state: State<'_, AppState>) -> Result<Vec<GetPlayer>, String> {
    let rows = sqlx::query(
        "SELECT id, first_name, last_name, gender, club_id, skill_level FROM players WHERE club_id = ? ORDER BY first_name, last_name"
    )
    .bind(club_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    let players = rows
        .into_iter()
        .map(|row| {
            let gender_str: String = row.get("gender");
            let gender = match gender_str.as_str() {
                "Male" => Gender::Male,
                "Female" => Gender::Female,
                _ => Gender::Male, // default fallback
            };

            GetPlayer {
                id: row.get("id"),
                first_name: row.get("first_name"),
                last_name: row.get("last_name"),
                club_id: row.get("club_id"),
                skill_level: row.get("skill_level"),
                gender,
                
            }
        })
        .collect();

    Ok(players)
}

#[tauri::command]
pub async fn create_player(
    request: CreatePlayerRequest,
    state: State<'_, AppState>,
) -> Result<Player, String> {
    println!("Creating player: {:?}", request);
    
    let gender_str = match request.gender {
        Gender::Male => "Male",
        Gender::Female => "Female",
    };

    // Start a transaction
    let mut tx = state.db.begin().await.map_err(|e| format!("Failed to start transaction: {}", e))?;

    // Insert the player
    let result = sqlx::query(
        "INSERT INTO players (first_name, last_name, email, gender, club_id, skill_level) VALUES (?, ?, ?, ?, ?, ?) RETURNING id"
    )
    .bind(&request.first_name)
    .bind(&request.last_name)
    .bind(&request.email)
    .bind(gender_str)
    .bind(request.club_id)
    .bind(request.skill_level)  
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| format!("Failed to create player: {}", e))?;

    let player_id: i64 = result.get("id");

    // Increment the club's member count
    sqlx::query("UPDATE clubs SET member_count = member_count + 1 WHERE id = ?")
        .bind(request.club_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to update club member count: {}", e))?;

    // Commit the transaction
    tx.commit().await.map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(Player {
        id: player_id,
        first_name: request.first_name,
        last_name: request.last_name,
        email: request.email,
        gender: request.gender,
        club_id: request.club_id,
        skill_level: request.skill_level,
    })
}

#[tauri::command]
pub async fn update_player(
    player_id: i64,
    request: CreatePlayerRequest,
    state: State<'_, AppState>,
) -> Result<Player, String> {
    let gender_str = match request.gender {
        Gender::Male => "Male",
        Gender::Female => "Female",
    };

    // Start a transaction
    let mut tx = state.db.begin().await.map_err(|e| format!("Failed to start transaction: {}", e))?;

    // Get the current player to check if club_id is changing
    let current_player = sqlx::query("SELECT club_id FROM players WHERE id = ?")
        .bind(player_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| format!("Player not found: {}", e))?;

    let current_club_id: i64 = current_player.get("club_id");

    // Update the player
    let result = sqlx::query(
        "UPDATE players SET first_name = ?, last_name = ?, email = ?, gender = ?, club_id = ? WHERE id = ?"
    )
    .bind(&request.first_name)
    .bind(&request.last_name)
    .bind(&request.email)
    .bind(gender_str)
    .bind(request.club_id)
    .bind(request.skill_level)
    .bind(player_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Failed to update player: {}", e))?;

    if result.rows_affected() == 0 {
        return Err("Player not found".to_string());
    }

    // If club_id changed, update member counts
    if current_club_id != request.club_id {
        // Decrement old club's member count
        sqlx::query("UPDATE clubs SET member_count = member_count - 1 WHERE id = ?")
            .bind(current_club_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to update old club member count: {}", e))?;

        // Increment new club's member count
        sqlx::query("UPDATE clubs SET member_count = member_count + 1 WHERE id = ?")
            .bind(request.club_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to update new club member count: {}", e))?;
    }

    // Commit the transaction
    tx.commit().await.map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(Player {
        id: player_id,
        first_name: request.first_name,
        last_name: request.last_name,
        email: request.email,
        gender: request.gender,
        club_id: request.club_id,
        skill_level: request.skill_level,
    })
}

#[tauri::command]
pub async fn delete_player(player_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    // Start a transaction
    let mut tx = state.db.begin().await.map_err(|e| format!("Failed to start transaction: {}", e))?;

    // Get the player's club_id before deleting
    let player = sqlx::query("SELECT club_id FROM players WHERE id = ?")
        .bind(player_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| format!("Player not found: {}", e))?;

    let club_id: i64 = player.get("club_id");

    // Delete the player
    let result = sqlx::query("DELETE FROM players WHERE id = ?")
        .bind(player_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete player: {}", e))?;

    if result.rows_affected() == 0 {
        return Err("Player not found".to_string());
    }

    // Decrement the club's member count
    sqlx::query("UPDATE clubs SET member_count = member_count - 1 WHERE id = ?")
        .bind(club_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to update club member count: {}", e))?;

    // Commit the transaction
    tx.commit().await.map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(())
}