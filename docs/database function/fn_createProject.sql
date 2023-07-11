CREATE FUNCTION "public"."fn_createProject"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  newProjectID integer;
begin
  if ("getUserRole"() = 'professor') then
    insert into project ("name","description") 
      values ('','')
    RETURNING id into newProjectID;

    insert into project_user (project_id,user_id)
      values(newProjectID,auth.uid());
    
    return newProjectID;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;

end$$;