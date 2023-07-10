CREATE FUNCTION "public"."fn_userExist"("arg_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
   PERFORM * FROM auth.users
   WHERE email = LOWER(arg_email);

   IF (FOUND) THEN
      RETURN TRUE;
   ELSE
      RETURN FALSE;
  END if;
END;$$;