drop function if exists "fn_queryUserList";
create function "fn_queryUserList" (query_project_id int)
RETURNS TABLE(title text,portfolio_id int,first_name text,last_name text,user_id uuid,user_role text) AS
$$
BEGIN
  return query
  select 
    portfolio.title as title, 
    portfolio.id as portfolio_id,
    "user_info".first_name as first_name, 
    "user_info".last_name as last_name,
    "user_info".id as user_id,
    "role".role as user_role
  from project_user
  left join portfolio on project_user.project_id = portfolio.project_id and project_user.user_id = portfolio.student_id
  join "user_info" on project_user.user_id = "user_info".id
  left join "role" on "user_info".role = "role".id 
  where project_user.project_id = query_project_id;

END;
$$
language plpgsql volatile;