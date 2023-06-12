
BEGIN
  return query
  select 
    portfolio.title as title, 
    portfolio.id as portfolio_id,
    "userInfo".first_name as first_name, 
    "userInfo".last_name as last_name,
    "userInfo".id as user_id
  from project_user
  left join portfolio on project_user.project_id = portfolio.project_id and project_user.user_id = portfolio.student_id
  join "userInfo" on project_user.user_id = "userInfo".id
  where project_user.project_id = query_project_id;
END;
