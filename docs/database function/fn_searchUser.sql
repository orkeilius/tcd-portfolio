CREATE OR REPLACE FUNCTION "fn_searchUser"(
    arg_search text
)
RETURNS TABLE (first_name text ,
               last_name text ,
               email varchar ,
               role int2,
               id uuid)
SECURITY definer 
LANGUAGE plpgsql AS $$
begin
  if ("getUserRole"() = 'admin') then
    return query
    select "userInfo".first_name, "userInfo".last_name, auth.users.email, "userInfo".role, "userInfo".id
    from "userInfo"
    left join auth.users on "userInfo".id = auth.users.id
    where "userInfo".first_name ILIKE '%' || arg_search || '%' OR "userInfo".last_name ILIKE '%' || arg_search || '%' OR auth.users.email ILIKE '%' || arg_search || '%'
    LIMIT 25;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end
$$;