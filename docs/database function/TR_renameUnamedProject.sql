CREATE FUNCTION "public"."TR_renameUnamedProject"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  if '' in  (select name from project) then
    update project
    set name = 'untitled project'
    where name = '';
  end if;
  return new;
end$$;