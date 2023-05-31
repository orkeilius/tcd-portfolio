declare
	user_role text;
begin
  select role.role into user_role from "userInfo"
  join role on "userInfo".role = role.id
  where "userInfo".id = auth.uid() limit 1;
  return user_role;
end