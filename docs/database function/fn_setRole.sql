CREATE OR REPLACE FUNCTION "fn_setRole"(
    arg_role int,
    arg_id uuid
)
RETURNS void
SECURITY definer 
LANGUAGE plpgsql AS $$
begin
  if ("getUserRole"() = 'admin') then
    UPDATE "user_info"
    SET role = arg_role
    where id = arg_id;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end
$$;