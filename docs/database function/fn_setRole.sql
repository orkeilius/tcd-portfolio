CREATE FUNCTION "public"."fn_setRole"("arg_role" integer, "arg_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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