CREATE FUNCTION "public"."getUserRole"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$declare
	user_role text;
begin
  select role.role into user_role from "user_info"
  join role on "user_info".role = role.id
  where "user_info".id = auth.uid() limit 1;
  return user_role;
end$$;