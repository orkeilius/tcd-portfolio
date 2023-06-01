begin
  if 
    join_code = (select code from project_code where project_code.id = join_id)
    and
    getUserRole() = any( ARRAY['professor','student'])
  then

    insert into project_user (project_id,user_id)
    values(join_id,auth.uid());

  end if;
end