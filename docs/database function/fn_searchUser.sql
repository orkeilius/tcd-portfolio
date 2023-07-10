CREATE FUNCTION "public"."fn_searchUser"("arg_search" "text") RETURNS TABLE("first_name" "text", "last_name" "text", "email" character varying, "role" smallint, "id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if ("getUserRole"() = 'admin') then
    return query
    select "user_info".first_name, "user_info".last_name, auth.users.email, "user_info".role, "user_info".id
    from "user_info"
    left join auth.users on "user_info".id = auth.users.id
    where "user_info".first_name ILIKE '%' || arg_search || '%' OR "user_info".last_name ILIKE '%' || arg_search || '%' OR auth.users.email ILIKE '%' || arg_search || '%'
    LIMIT 25;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end
$$;