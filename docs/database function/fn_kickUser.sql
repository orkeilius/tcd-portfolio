begin
  if (
    "getUserRole"() = 'professor' and 
    auth.uid() != arg_user_id and
    auth.uid() in (
      select user_id from project_user 
      where project_id = arg_project_id
    )
  ) then
    delete from project_user 
    where project_id = arg_project_id and user_id = arg_user_id;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end