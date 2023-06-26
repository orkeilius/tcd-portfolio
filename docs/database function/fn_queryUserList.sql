drop function if exists "fn_queryUserList";
create function "fn_queryUserList" (query_project_id int)
RETURNS TABLE(title text,portfolio_id int,first_name text,last_name text,user_id uuid,user_role text) AS
$$
BEGIN
  return query
  select 
    portfolio.title as title, 
    portfolio.id as portfolio_id,
    "userInfo".first_name as first_name, 
    "userInfo".last_name as last_name,
    "userInfo".id as user_id,
    "role".role as user_role
  from project_user
  left join portfolio on project_user.project_id = portfolio.project_id and project_user.user_id = portfolio.student_id
  join "userInfo" on project_user.user_id = "userInfo".id
  left join "role" on "userInfo".role = "role".id 
  where project_user.project_id = query_project_id;

END;
$$
language plpgsql volatile;