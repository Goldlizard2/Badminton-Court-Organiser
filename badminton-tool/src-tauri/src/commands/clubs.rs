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
            member_count: row.get::<i64, _>("member_count") as i32,
        })
        .collect();

    Ok(clubs)
}

#[tauri::command]
pub async fn get_club_by_id(club_id: i64, state: State<'_, AppState>) -> Result<Club, String> {
    let row = sqlx::query("SELECT id, name FROM clubs WHERE id = ?")
        .bind(club_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    match row {
        Some(row) => Ok(Club {
            id: row.get("id"),
            name: row.get("name"),
            member_count: 0,
        }),
        None => Err("Club not found".into()),
    }
}

#[tauri::command]
pub async fn create_club(
    request: CreateClubRequest,
    state: State<'_, AppState>,
) -> Result<Club, String> {
    println!("Creating club: {:?}", request);
    let result = sqlx::query("INSERT INTO clubs (name) VALUES (?) RETURNING id")
        .bind(&request.name)
        .fetch_one(&state.db)
        .await
        .map_err(|e| format!("Failed to create club: {}", e))?;

    let club_id: i64 = result.get("id");

    Ok(Club {
        id: club_id,
        name: request.name,
        member_count: 1,
    })
}

#[tauri::command]
pub async fn delete_club(club_id: i64, state: State<'_, AppState>) -> Result<(), String> {
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