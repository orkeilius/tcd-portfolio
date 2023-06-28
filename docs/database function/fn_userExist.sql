BEGIN
   PERFORM * FROM auth.users
   WHERE email = LOWER(arg_email);

   IF (FOUND) THEN
      RETURN TRUE;
   ELSE
      RETURN FALSE;
  END if;
END;