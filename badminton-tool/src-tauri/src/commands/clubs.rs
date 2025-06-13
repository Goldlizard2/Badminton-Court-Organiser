use crate::models::AppState;
use crate::models::Club;
use crate::models::CreateClubRequest;
use sqlx::Row;
use tauri::State;

#[tauri::command]
pub async fn get_clubs(state: State<'_, AppState>) -> Result<Vec<Club>, String> {
    let rows = sqlx::query(
        "SELECT c.id, c.name, c.description, 
         COALESCE(COUNT(cm.user_id), 0) as member_count
         FROM clubs c 
         LEFT JOIN club_members cm ON c.id = cm.club_id 
         GROUP BY c.id, c.name, c.description
         ORDER BY c.name",
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    let clubs = rows
        .into_iter()
        .map(|row| Club {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            member_count: row.get::<i64, _>("member_count") as i32,
        })
        .collect();

    Ok(clubs)
}

#[tauri::command]
pub async fn create_club(
    request: CreateClubRequest,
    state: State<'_, AppState>,
) -> Result<Club, String> {
    // Check if user is authenticated
    let current_user = state.current_user.lock().await;
    let user = current_user.as_ref().ok_or("User not authenticated")?;

    // Insert new club
    let result = sqlx::query("INSERT INTO clubs (name, description) VALUES (?, ?) RETURNING id")
        .bind(&request.name)
        .bind(&request.description)
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to create club: {}", e))?;

    let club_id: i64 = result.get("id");

    // Add the creator as the first member
    sqlx::query("INSERT INTO club_members (club_id, user_id) VALUES (?, ?)")
        .bind(club_id)
        .bind(user.id as i64)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to add creator as member: {}", e))?;

    Ok(Club {
        id: club_id,
        name: request.name,
        description: request.description,
        member_count: 1,
    })
}

#[tauri::command]
pub async fn delete_club(club_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    // Check if user is authenticated
    let current_user = state.current_user.lock().await;
    current_user.as_ref().ok_or("User not authenticated")?;

    // Delete club members first (foreign key constraint)
    sqlx::query("DELETE FROM club_members WHERE club_id = ?")
        .bind(club_id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete club members: {}", e))?;

    // Delete the club
    let result = sqlx::query("DELETE FROM clubs WHERE id = ?")
        .bind(club_id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete club: {}", e))?;

    if result.rows_affected() == 0 {
        return Err("Club not found".to_string());
    }

    Ok(())
}

#[tauri::command]
pub async fn join_club(club_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let current_user = state.current_user.lock().await;
    let user = current_user.as_ref().ok_or("User not authenticated")?;

    // Check if user is already a member
    let existing = sqlx::query("SELECT id FROM club_members WHERE club_id = ? AND user_id = ?")
        .bind(club_id)
        .bind(user.id as i64)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing.is_some() {
        return Err("Already a member of this club".to_string());
    }

    // Add user to club
    sqlx::query("INSERT INTO club_members (club_id, user_id) VALUES (?, ?)")
        .bind(club_id)
        .bind(user.id as i64)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to join club: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn leave_club(club_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let current_user = state.current_user.lock().await;
    let user = current_user.as_ref().ok_or("User not authenticated")?;

    let result = sqlx::query("DELETE FROM club_members WHERE club_id = ? AND user_id = ?")
        .bind(club_id)
        .bind(user.id as i64)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to leave club: {}", e))?;

    if result.rows_affected() == 0 {
        return Err("Not a member of this club".to_string());
    }

    Ok(())
}
