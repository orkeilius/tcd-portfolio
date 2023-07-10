CREATE FUNCTION "public"."TR_deleteExpiredCode"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  delete from project_code 
  where expire < now();
  return new;
end$$;